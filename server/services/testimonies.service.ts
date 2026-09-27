import { getDbClient, SUPABASE_TABLES } from '../db/client';

export async function listTestimonies(page = 1, limit = 12, approvedOnly = true) {
  const supabase = getDbClient();
  let query = supabase.from(SUPABASE_TABLES.TESTIMONIES).select('*', { count: 'exact' });

  if (approvedOnly) {
    query = query.eq('status', 'approved');
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

export async function getTestimonyById(id: string) {
  const supabase = getDbClient();
  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.TESTIMONIES)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST125' || error.code === '42P01') return null;
      throw error;
    }
    return data;
  } catch (err: any) {
    if (err?.code === 'PGRST125' || err?.code === '42P01') return null;
    throw err;
  }
}

export async function submitTestimony(params: {
  title: string;
  content: string;
  authorName: string;
}, userId?: string) {
  const supabase = getDbClient();
  const newRow = {
    title: params.title,
    content: params.content,
    author_name: params.authorName,
    status: 'approved',
    user_id: userId || null,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(SUPABASE_TABLES.TESTIMONIES)
    .insert(newRow)
    .select()
    .single();

  if (error) throw error;
  return data;
}
