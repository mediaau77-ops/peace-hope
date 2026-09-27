import { getDbClient, SUPABASE_TABLES } from '../db/client';

export async function listPrayerRequests(page = 1, limit = 20, isPublic = true) {
  const supabase = getDbClient();
  let query = supabase.from(SUPABASE_TABLES.PRAYER_REQUESTS).select('*', { count: 'exact' });

  if (isPublic) {
    query = query.eq('is_private', false).eq('status', 'approved');
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      if (error.code === 'PGRST125' || error.code === '42P01') {
        return { items: [], total: 0, page, limit };
      }
      throw error;
    }
    return { items: data || [], total: count || 0, page, limit };
  } catch (err: any) {
    if (err?.code === 'PGRST125' || err?.code === '42P01') {
      return { items: [], total: 0, page, limit };
    }
    throw err;
  }
}

export async function submitPrayerRequest(params: {
  title: string;
  description: string;
  name?: string;
  isPrivate?: boolean;
}, userId?: string) {
  const supabase = getDbClient();
  const newRow = {
    title: params.title,
    description: params.description,
    name: params.name || 'Anonymous Believer',
    is_private: params.isPrivate ?? false,
    status: params.isPrivate ? 'pending' : 'approved',
    user_id: userId || null,
    prayer_count: 0,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(SUPABASE_TABLES.PRAYER_REQUESTS)
    .insert(newRow)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function prayForRequest(id: string) {
  const supabase = getDbClient();
  const { data: current } = await supabase
    .from(SUPABASE_TABLES.PRAYER_REQUESTS)
    .select('prayer_count')
    .eq('id', id)
    .maybeSingle();

  const count = (current?.prayer_count || 0) + 1;
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.PRAYER_REQUESTS)
    .update({ prayer_count: count })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
