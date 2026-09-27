import { getDbClient, SUPABASE_TABLES } from '../db/client';
import { AuthenticatedUser } from '../auth/requireUser';

export async function getCurrentUserProfile(authUser: AuthenticatedUser) {
  const supabase = getDbClient();
  const { data: profile } = await supabase
    .from(SUPABASE_TABLES.PROFILES)
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (!profile) {
    // Upsert profile
    const { data: created } = await supabase
      .from(SUPABASE_TABLES.PROFILES)
      .insert({
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.fullName,
        avatar_url: authUser.avatarUrl,
        role: authUser.role || 'member',
        theme_preference: 'light',
        language_preference: 'en',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    return created || authUser;
  }

  return profile;
}

export async function updateCurrentUserProfile(authUser: AuthenticatedUser, updates: Record<string, any>) {
  const supabase = getDbClient();
  const allowed = {
    full_name: updates.fullName || updates.full_name,
    avatar_url: updates.avatarUrl || updates.avatar_url,
    theme_preference: updates.themePreference || updates.theme_preference,
    language_preference: updates.languagePreference || updates.language_preference,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(SUPABASE_TABLES.PROFILES)
    .update(allowed)
    .eq('id', authUser.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listUsers(page = 1, limit = 20) {
  const supabase = getDbClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabase
    .from(SUPABASE_TABLES.PROFILES)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { items: data || [], total: count || 0, page, limit };
}

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.PROFILES)
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
