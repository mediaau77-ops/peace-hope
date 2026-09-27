import { Request } from 'express';
import { getDbClient, SUPABASE_TABLES } from '../db/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: string;
}

export async function getAuthUser(req: Request): Promise<AuthenticatedUser | null> {
  const supabase = getDbClient();

  // 1. Try Authorization header: Bearer <token>
  let token: string | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // 2. Try cookie
  if (!token && req.cookies) {
    token = req.cookies['sb-access-token'] || req.cookies['sb_token'];
    if (!token) {
      // Find any cookie starting with sb- and ending with -auth-token
      const key = Object.keys(req.cookies).find((k) => k.startsWith('sb-') && k.endsWith('-auth-token'));
      if (key) {
        try {
          const parsed = JSON.parse(req.cookies[key]);
          token = Array.isArray(parsed) ? parsed[0] : parsed?.access_token;
        } catch {
          token = req.cookies[key];
        }
      }
    }
  }

  if (!token) {
    return null;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;

    // Fetch user role from profiles table
    let role = 'member';
    const { data: profile } = await supabase
      .from(SUPABASE_TABLES.PROFILES)
      .select('role, full_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role) {
      role = profile.role;
    }

    const fullName =
      profile?.full_name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Member';
    const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture;

    return {
      id: user.id,
      email: user.email || '',
      fullName,
      avatarUrl,
      role,
    };
  } catch (err) {
    console.debug('[AUTH] Token validation failed:', err);
    return null;
  }
}

export async function requireUser(req: Request): Promise<AuthenticatedUser> {
  const user = await getAuthUser(req);
  if (!user) {
    const err: any = new Error('Authentication required');
    err.status = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }
  return user;
}

export async function requireRole(req: Request, allowedRoles: string[]): Promise<AuthenticatedUser> {
  const user = await requireUser(req);
  if (!allowedRoles.includes(user.role) && user.role !== 'super_admin') {
    const err: any = new Error('Forbidden: Insufficient permissions');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }
  return user;
}
