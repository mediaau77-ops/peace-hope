import { getDbClient, SUPABASE_TABLES } from '../db/client';

let hasWarnedPublicSettings = false;
let hasWarnedFullSettings = false;

export async function getPublicSettings(): Promise<Record<string, any> | null> {
  const supabase = getDbClient();
  try {
    // 1. Check for key-value model (key = 'public')
    const { data: kvData, error: kvError } = await supabase
      .from(SUPABASE_TABLES.SETTINGS)
      .select('value')
      .eq('key', 'public')
      .maybeSingle();

    if (!kvError && kvData?.value) {
      return kvData.value;
    }

    // 2. Fallback check for single-row model
    const { data: rowData, error: rowError } = await supabase
      .from(SUPABASE_TABLES.SETTINGS)
      .select('church_name, tagline, mission_statement, contact_email, contact_phone, address, country, default_language, supported_languages, theme, social_links')
      .limit(1)
      .maybeSingle();

    if (!rowError && rowData) {
      return rowData;
    }

    if (!hasWarnedPublicSettings) {
      hasWarnedPublicSettings = true;
      console.warn('[SETTINGS WARNING] No public settings row found in Supabase. Returning null gracefully.');
    }
    return null;
  } catch (err: any) {
    if (!hasWarnedPublicSettings) {
      hasWarnedPublicSettings = true;
      console.warn('[SETTINGS WARNING] Could not query public settings from Supabase; returning null gracefully:', err?.message || err);
    }
    return null;
  }
}

export async function getFullSettings(): Promise<Record<string, any> | null> {
  const supabase = getDbClient();
  try {
    // 1. Check for key-value model
    const { data: kvData, error: kvError } = await supabase
      .from(SUPABASE_TABLES.SETTINGS)
      .select('*')
      .eq('key', 'public')
      .maybeSingle();

    if (!kvError && kvData) {
      return kvData.value || kvData;
    }

    // 2. Fallback check for single-row model
    const { data: rowData, error: rowError } = await supabase
      .from(SUPABASE_TABLES.SETTINGS)
      .select('*')
      .limit(1)
      .maybeSingle();

    if (!rowError && rowData) {
      return rowData;
    }

    if (!hasWarnedFullSettings) {
      hasWarnedFullSettings = true;
      console.warn('[SETTINGS WARNING] No settings row found in Supabase. Returning null gracefully.');
    }
    return null;
  } catch (err: any) {
    if (!hasWarnedFullSettings) {
      hasWarnedFullSettings = true;
      console.warn('[SETTINGS WARNING] Could not query settings from Supabase; returning null gracefully:', err?.message || err);
    }
    return null;
  }
}

export async function updateSettings(updates: Record<string, any>) {
  const supabase = getDbClient();
  try {
    // 1. Try key-value table: upsert key = 'public'
    const { data: existingKv } = await supabase
      .from(SUPABASE_TABLES.SETTINGS)
      .select('id, value')
      .eq('key', 'public')
      .maybeSingle();

    if (existingKv) {
      const merged = { ...(existingKv.value || {}), ...updates };
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.SETTINGS)
        .update({ value: merged, updated_at: new Date().toISOString() })
        .eq('id', existingKv.id)
        .select()
        .single();
      if (error) throw error;
      return data.value;
    }

    // Attempt upserting key = 'public'
    const { data: upserted, error: upsertErr } = await supabase
      .from(SUPABASE_TABLES.SETTINGS)
      .upsert({
        key: 'public',
        value: updates,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' })
      .select()
      .maybeSingle();

    if (!upsertErr && upserted) {
      return upserted.value;
    }

    // 2. Fallback single-row model
    const { data: existingRow } = await supabase
      .from(SUPABASE_TABLES.SETTINGS)
      .select('id')
      .limit(1)
      .maybeSingle();

    if (existingRow) {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.SETTINGS)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', existingRow.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase
      .from(SUPABASE_TABLES.SETTINGS)
      .insert({ ...updates, created_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[SETTINGS ERROR] Failed to update settings:', err);
    throw err;
  }
}
