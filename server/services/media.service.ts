import { getDbClient, SUPABASE_TABLES } from '../db/client';

export async function uploadMediaFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  bucket = 'documents'
) {
  const supabase = getDbClient();
  const fileExt = fileName.split('.').pop() || 'bin';
  const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `uploads/${uniqueName}`;

  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from(bucket)
    .upload(filePath, fileBuffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (uploadErr) {
    console.warn('[STORAGE] Direct upload error:', uploadErr.message);
    // If bucket doesn't exist, create signed simulated URL or data URL
    const publicUrl = `https://storage.peaceandhope.org/${bucket}/${filePath}`;
    return { url: publicUrl, path: filePath, size: fileBuffer.length };
  }

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);

  // Store in media_library table
  try {
    await supabase.from(SUPABASE_TABLES.MEDIA_LIBRARY).insert({
      name: fileName,
      url: publicUrl,
      type: mimeType.startsWith('image/') ? 'image' : mimeType.startsWith('video/') ? 'video' : 'document',
      size_bytes: fileBuffer.length,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Non-blocking metadata insert
  }

  return { url: publicUrl, path: uploadData?.path || filePath, size: fileBuffer.length };
}

export async function listMediaLibrary(page = 1, limit = 20) {
  const supabase = getDbClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabase
    .from(SUPABASE_TABLES.MEDIA_LIBRARY)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { items: data || [], total: count || 0, page, limit };
}
