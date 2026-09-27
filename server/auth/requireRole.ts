import { Request } from 'express';
import { requireRole as baseRequireRole, AuthenticatedUser } from './requireUser';

export async function requireRole(req: Request, allowedRoles: string[]): Promise<AuthenticatedUser> {
  return baseRequireRole(req, allowedRoles);
}

export async function requireAdmin(req: Request): Promise<AuthenticatedUser> {
  return baseRequireRole(req, ['super_admin', 'church_admin', 'pastor', 'admin']);
}
