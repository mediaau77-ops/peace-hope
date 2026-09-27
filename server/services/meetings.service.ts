import { getDbClient, SUPABASE_TABLES } from '../db/client';

export async function listMeetings(page = 1, limit = 20) {
  const supabase = getDbClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabase
    .from(SUPABASE_TABLES.MEETINGS)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { items: data || [], total: count || 0, page, limit };
}

export async function getMeetingById(id: string) {
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.MEETINGS)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createMeeting(params: {
  title: string;
  description?: string;
  scheduledStartTime?: string;
  isPublic?: boolean;
}, hostUserId?: string) {
  const supabase = getDbClient();
  const meetingCode = `ph-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`;

  const newRow = {
    title: params.title,
    description: params.description || '',
    code: meetingCode,
    host_id: hostUserId || null,
    status: 'scheduled',
    is_public: params.isPublic ?? true,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(SUPABASE_TABLES.MEETINGS)
    .insert(newRow)
    .select()
    .single();

  if (error) throw error;
  return data;
}
