/**
 * Google Drive API OAuth 2.0 Integration & Supabase Storage Importer
 * Peace & Hope Admin CMS
 *
 * Facilitates OAuth 2.0 authentication, browsing Google Drive assets,
 * and importing files directly into Supabase Storage buckets.
 */

import { GoogleDriveFile, GoogleDriveToken } from '../types';
import { uploadToSupabaseStorage, SUPABASE_BUCKETS } from './supabase';

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const DRIVE_FILES_ENDPOINT = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

/**
 * Initiates the Google OAuth 2.0 popup / redirect flow
 */
export function initiateGoogleDriveAuth(
  clientId: string = (typeof window !== 'undefined' && (window as any).__GDRIVE_CLIENT_ID__) || 'peace-and-hope-gdrive-client-id',
  redirectUri: string = typeof window !== 'undefined' ? window.location.origin : ''
) {
  const state = Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem('gdrive_oauth_state', state);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'token',
    scope: DRIVE_SCOPES,
    state,
    prompt: 'consent',
    include_granted_scopes: 'true',
  });

  const authUrl = `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
  return authUrl;
}

/**
 * Fetch file list from connected Google Drive account
 */
export async function listGoogleDriveFiles(
  accessToken: string,
  query?: string
): Promise<GoogleDriveFile[]> {
  try {
    const q = query
      ? `trashed = false and name contains '${query}'`
      : 'trashed = false and mimeType != "application/vnd.google-apps.folder"';

    const url = new URL(DRIVE_FILES_ENDPOINT);
    url.searchParams.append('q', q);
    url.searchParams.append('fields', 'files(id, name, mimeType, size, iconLink, thumbnailLink, modifiedTime)');
    url.searchParams.append('pageSize', '50');
    url.searchParams.append('orderBy', 'modifiedTime desc');

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to fetch Google Drive files');
    }

    const data = await res.json();
    return (data.files || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      sizeBytes: parseInt(f.size || '0', 10),
      iconUrl: f.iconLink,
      thumbnailUrl: f.thumbnailLink,
      modifiedTime: f.modifiedTime,
    }));
  } catch (error: any) {
    console.warn('Error querying Google Drive API:', error.message);
    throw error;
  }
}

/**
 * Downloads a binary file from Google Drive and uploads it directly to Supabase Storage
 */
export async function importGoogleDriveFileToSupabase(
  accessToken: string,
  fileId: string,
  fileName: string,
  targetBucket = SUPABASE_BUCKETS.GOOGLE_DRIVE_IMPORTS || 'google-drive-imports'
): Promise<{ url: string; supabaseUrl: string; success: boolean; error?: string }> {
  try {
    const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const res = await fetch(downloadUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to download file from Google Drive (HTTP ${res.status})`);
    }

    const blob = await res.blob();
    const cleanFileName = `gdrive_${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    const uploadRes = await uploadToSupabaseStorage(targetBucket, blob, cleanFileName);
    return {
      url: uploadRes.url,
      supabaseUrl: uploadRes.url,
      success: !!uploadRes.url,
      error: uploadRes.error,
    };
  } catch (err: any) {
    return { url: '', supabaseUrl: '', success: false, error: err.message || 'Import failed' };
  }
}

export const importFromGoogleDrive = async (
  fileId: string,
  accessToken: string,
  targetBucket: string,
  fileName: string
) => {
  return importGoogleDriveFileToSupabase(accessToken, fileId, fileName, targetBucket as any);
};

export const initiateGoogleDriveOAuth = initiateGoogleDriveAuth;
