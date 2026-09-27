import { getDbClient, SUPABASE_TABLES } from '../db/client';

export async function listTeachings(page = 1, limit = 12, search?: string, category?: string) {
  const supabase = getDbClient();
  let query = supabase.from(SUPABASE_TABLES.TEACHINGS).select('*', { count: 'exact' });

  if (search) {
    query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%,description.ilike.%${search}%`);
  }
  if (category && category !== 'all') {
    query = query.eq('category', category);
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

export async function getTeachingBySlug(slug: string) {
  const supabase = getDbClient();
  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.TEACHINGS)
      .select('*')
      .or(`id.eq.${slug},slug.eq.${slug}`)
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

export async function createTeaching(item: Record<string, any>) {
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.TEACHINGS)
    .insert({ ...item, created_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTeaching(id: string, updates: Record<string, any>) {
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.TEACHINGS)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTeaching(id: string) {
  const supabase = getDbClient();
  const { error } = await supabase.from(SUPABASE_TABLES.TEACHINGS).delete().eq('id', id);
  if (error) throw error;
  return true;
}
