import React, { useState, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { MediaItem } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { SUPABASE_BUCKETS } from '../../lib/supabase';
import { importFromGoogleDrive, initiateGoogleDriveOAuth } from '../../lib/googleDrive';
import {
  FolderOpen,
  Upload,
  Copy,
  Check,
  Trash2,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  HardDrive,
  Search,
  Plus,
  X,
  Loader2,
  Cloud,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

export const MediaManager: React.FC = () => {
  const { mediaItems, addMediaItem, deleteMediaItem, uploadMediaFile, isSupabaseActive } = useAdmin();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isDriveImportOpen, setIsDriveImportOpen] = useState(false);
  const [driveFileId, setDriveFileId] = useState('');
  const [driveAccessToken, setDriveAccessToken] = useState('');
  const [importingDrive, setImportingDrive] = useState(false);
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // New item states
  const [name, setName] = useState('');
  const [type, setType] = useState<MediaItem['type']>('image');
  const [url, setUrl] = useState('');
  const [size, setSize] = useState('2.4 MB');
  const [targetBucket, setTargetBucket] = useState<string>(SUPABASE_BUCKETS.SERMON_MEDIA);

  const showNotice = (msg: string) => {
    setAdminNotice(msg);
    setTimeout(() => setAdminNotice(null), 3500);
  };

  const filtered = mediaItems.filter((item) => {
    if (filterType !== 'All' && item.type !== filterType) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCopy = (item: MediaItem) => {
    navigator.clipboard?.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    addMediaItem({
      name,
      type,
      url,
      size: size || '1.8 MB',
      sizeBytes: 1800000,
      cdnStatus: 'Active',
    });

    setName('');
    setUrl('');
    setIsUploading(false);
    showNotice(`Media asset "${name}" registered.`);
  };

  const handleGoogleDriveImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveFileId.trim()) return;

    setImportingDrive(true);
    const token = driveAccessToken.trim() || 'oauth_bearer_token';
    const res = await importFromGoogleDrive(
      driveFileId.trim(),
      token,
      targetBucket,
      name.trim() || `drive-import-${Date.now()}`
    );
    setImportingDrive(false);

    if (res.success && res.supabaseUrl) {
      addMediaItem({
        name: name.trim() || `Google-Drive-${driveFileId.substring(0, 8)}`,
        type,
        url: res.supabaseUrl,
        size: '15.4 MB',
        sizeBytes: 16148000,
        cdnStatus: 'Active',
      });
      setIsDriveImportOpen(false);
      setDriveFileId('');
      showNotice('File imported from Google Drive to Supabase Storage.');
    } else {
      alert(`Google Drive import failed: ${res.error || 'Token expired or file inaccessible'}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="text-[11px] font-bold tracking-[0.22em] text-[#b4832e] dark:text-amber-400 uppercase mb-1">
            ASSET REPOSITORY &amp; CLOUD STORAGE
          </div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Media &amp; Asset Library ({mediaItems.length})
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage high-resolution worship graphics, PDF songbooks, hymn audio, and import sermon video from Google Drive.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsDriveImportOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition-colors"
          >
            <Cloud className="w-4 h-4 text-sky-500" />
            <span>Import from Google Drive</span>
          </button>

          <button
            onClick={() => setIsUploading(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#b4832e] hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Asset</span>
          </button>
        </div>
      </div>

      {adminNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{adminNotice}</span>
        </div>
      )}

      {/* Storage Buckets Telemetry Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
          <HardDrive className="w-4 h-4 text-[#b4832e]" />
          <span>Active Supabase Buckets:</span>
          <span className="font-mono text-[11px] text-slate-500">
            sermon-media, hymn-audio, bulletin-pdfs, meeting-recordings
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Status:</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {isSupabaseActive ? 'CDN Edge Active' : 'Local / CDN Ready'}
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {['All', 'image', 'video', 'audio', 'document'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                filterType === t
                  ? 'bg-[#b4832e] text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              {t === 'All' ? 'All Assets' : t}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-[#b4832e]"
          />
        </div>
      </div>

      {/* Media Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No content has been published yet."
          description="No media assets found in Supabase storage. Click 'Upload Media' or 'Import from Google Drive' to upload worship bulletins, sermon covers, or audio files."
          actionLabel="Upload Media"
          onAction={() => setIsUploading(true)}
          tableName="media_assets"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="aspect-video relative bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                  {item.type === 'image' ? (
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-400">
                      {item.type === 'video' && <Video className="w-8 h-8" />}
                      {item.type === 'audio' && <Music className="w-8 h-8" />}
                      {item.type === 'document' && <FileText className="w-8 h-8" />}
                    </div>
                  )}
                  <span className="absolute top-2 left-2 bg-white/90 dark:bg-slate-900/90 text-[#b4832e] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border border-amber-200 dark:border-amber-800">
                    {item.type}
                  </span>
                </div>

                <div className="p-4 space-y-1">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate" title={item.name}>
                    {item.name}
                  </h4>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {item.size} &bull; {item.cdnStatus}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleCopy(item)}
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 text-[11px]"
                  title="Copy Direct URL"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => deleteMediaItem(item.id)}
                  className="p-1 rounded text-rose-500 hover:text-rose-700"
                  title="Delete Asset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploading && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                Register Media Asset
              </h3>
              <button
                onClick={() => setIsUploading(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMedia} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Asset Title / Filename *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sabbath-School-Lesson-Q3.pdf"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Asset Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="image">Image (PNG/JPG)</option>
                    <option value="video">Video (MP4)</option>
                    <option value="audio">Audio (MP3/WAV)</option>
                    <option value="document">Document (PDF/DOC)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Target Bucket
                  </label>
                  <select
                    value={targetBucket}
                    onChange={(e) => setTargetBucket(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value={SUPABASE_BUCKETS.SERMON_MEDIA}>Sermon Media</option>
                    <option value={SUPABASE_BUCKETS.HYMN_AUDIO}>Hymn Audio</option>
                    <option value={SUPABASE_BUCKETS.BULLETIN_PDFS}>Bulletin PDFs</option>
                    <option value={SUPABASE_BUCKETS.MEETING_RECORDINGS}>Meeting Recordings</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                    File URL / Supabase Storage Path *
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFile}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-[#b4832e] text-[11px] font-medium border border-amber-200"
                  >
                    {uploadingFile ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3 h-3" />
                        <span>Choose File</span>
                      </>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadingFile(true);
                      const res = await uploadMediaFile(targetBucket as any, file);
                      setUploadingFile(false);
                      if (res.url) {
                        setUrl(res.url);
                        if (!name) setName(file.name);
                        const mb = (file.size / (1024 * 1024)).toFixed(1);
                        setSize(`${mb} MB`);
                        if (file.type.startsWith('image/')) setType('image');
                        else if (file.type.startsWith('video/')) setType('video');
                        else if (file.type.startsWith('audio/')) setType('audio');
                        else setType('document');
                      }
                    }}
                  />
                </div>
                <input
                  type="url"
                  required
                  placeholder="https://... or choose file above"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploading(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#b4832e] hover:bg-amber-700 text-white font-medium"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Drive Import Modal */}
      {isDriveImportOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-sky-500" />
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                  Google Drive OAuth 2.0 Import
                </h3>
              </div>
              <button
                onClick={() => setIsDriveImportOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Import recordings, sermon videos, or worship bulletins directly from Google Drive into Supabase Storage.
            </p>

            <form onSubmit={handleGoogleDriveImport} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Google Drive File ID or Share URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms or share link"
                  value={driveFileId}
                  onChange={(e) => {
                    const val = e.target.value;
                    const match = val.match(/[-\w]{25,}/);
                    setDriveFileId(match ? match[0] : val);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Target Supabase Storage Bucket
                </label>
                <select
                  value={targetBucket}
                  onChange={(e) => setTargetBucket(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value={SUPABASE_BUCKETS.SERMON_MEDIA}>Sermon Media (sermon-media)</option>
                  <option value={SUPABASE_BUCKETS.MEETING_RECORDINGS}>Meeting Recordings (meeting-recordings)</option>
                  <option value={SUPABASE_BUCKETS.BULLETIN_PDFS}>Bulletin PDFs (bulletin-pdfs)</option>
                  <option value={SUPABASE_BUCKETS.HYMN_AUDIO}>Hymn Audio (hymn-audio)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  OAuth 2.0 Access Token (Optional / Auto-granted in session)
                </label>
                <input
                  type="password"
                  placeholder="Paste Bearer token or leave blank to use configured OAuth"
                  value={driveAccessToken}
                  onChange={(e) => setDriveAccessToken(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDriveImportOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importingDrive}
                  className="px-4 py-2 rounded-xl bg-[#b4832e] hover:bg-amber-700 text-white font-semibold flex items-center gap-1.5"
                >
                  {importingDrive ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <Cloud className="w-3.5 h-3.5" />
                      <span>Import to Supabase</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
