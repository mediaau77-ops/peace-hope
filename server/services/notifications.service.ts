import { getDbClient, SUPABASE_TABLES } from '../db/client';

export async function listNotifications(userId?: string) {
  const supabase = getDbClient();
  let query = supabase.from(SUPABASE_TABLES.NOTIFICATIONS).select('*');

  if (userId) {
    query = query.or(`user_id.eq.${userId},is_global.eq.true`);
  } else {
    query = query.eq('is_global', true);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) return [];
  return data || [];
}

export async function markNotificationRead(id: string) {
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.NOTIFICATIONS)
    .update({ is_read: true })
    .eq('id', id)
    .select()
    .single();

  if (error) return null;
  return data;
}
