import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Video,
  Image as ImageIcon,
  Music,
  Star,
  Trash2,
  Edit2,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  ArrowUp,
  ArrowDown,
  Layers,
  HardDrive,
} from 'lucide-react';
import { SupabaseBucketName, uploadToSupabaseStorage } from '../../lib/supabase';
import { importGoogleDriveFileToSupabase, initiateGoogleDriveAuth } from '../../lib/googleDrive';
import { ContentStatus } from '../../types';

export interface UploadedFileItem {
  id: string;
  url: string;
  name: string;
  sizeBytes?: number;
  sizeText?: string;
  type: 'image' | 'video' | 'audio' | 'pdf' | 'document' | string;
  source: 'device' | 'google-drive';
  isCover?: boolean;
  status?: ContentStatus;
  sortOrder?: number;
}

interface InlineUploadWidgetProps {
  bucket: SupabaseBucketName | string;
  parentTable?: string;
  parentId?: string;
  currentCoverUrl?: string;
  label?: string;
  description?: string;
  accept?: string; // e.g. "image/*", "video/*", "audio/*", ".pdf,.docx", "*/*"
  fileCategory?: 'image' | 'video' | 'audio' | 'document' | 'any';
  multiple?: boolean;
  value?: UploadedFileItem[];
  onChange?: (items: UploadedFileItem[]) => void;
  onCoverChange?: (coverUrl: string) => void;
  coverUrl?: string;
  maxFiles?: number;
  showCoverSelector?: boolean;
  showStatusSelector?: boolean;
  compact?: boolean;
}

export const InlineUploadWidget: React.FC<InlineUploadWidgetProps> = ({
  bucket,
  parentTable,
  parentId,
  currentCoverUrl,
  label = 'Upload Media & Files',
  description = 'Upload files directly from your device or import from Google Drive.',
  accept = '*/*',
  fileCategory = 'any',
  multiple = false,
  value = [],
  onChange,
  onCoverChange,
  coverUrl: propCoverUrl,
  maxFiles = 10,
  showCoverSelector = true,
  showStatusSelector = false,
  compact = false,
}) => {
  const coverUrl = currentCoverUrl || propCoverUrl;
  const [sourceTab, setSourceTab] = useState<'device' | 'gdrive'>('device');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activePreviewUrl, setActivePreviewUrl] = useState<{ url: string; type: string; name: string } | null>(null);

  // Google Drive Modal State
  const [gdriveFileId, setGdriveFileId] = useState('');
  const [gdriveFileName, setGdriveFileName] = useState('');
  const [gdriveIsImporting, setGdriveIsImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isCancelledRef = useRef(false);

  // Helper to categorize file type
  const detectType = (file: File | { type: string; name: string }): 'image' | 'video' | 'audio' | 'pdf' | 'document' => {
    const mime = file.type.toLowerCase();
    const name = file.name.toLowerCase();
    if (mime.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(name)) return 'image';
    if (mime.startsWith('video/') || /\.(mp4|mov|webm|mkv|avi)$/i.test(name)) return 'video';
    if (mime.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac)$/i.test(name)) return 'audio';
    if (mime.includes('pdf') || name.endsWith('.pdf')) return 'pdf';
    return 'document';
  };

  // Format file size
  const formatSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Chunked upload handler
  const handleDeviceUpload = async (files: FileList | File[]) => {
    setUploadError(null);
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    const filesToUpload = multiple ? fileList.slice(0, maxFiles - value.length) : [fileList[0]];

    for (const file of filesToUpload) {
      isCancelledRef.current = false;
      setUploadProgress(10);

      try {
        // Progress simulation for responsive UX
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev === null || prev >= 85 || isCancelledRef.current) return prev;
            return prev + 15;
          });
        }, 120);

        const cleanName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const res = await uploadToSupabaseStorage(bucket as any, file, cleanName);
        clearInterval(interval);

        if (isCancelledRef.current) {
          setUploadProgress(null);
          return;
        }

        if (res.error || !res.url) {
          throw new Error(res.error || 'Upload failed');
        }

        setUploadProgress(100);
        setTimeout(() => setUploadProgress(null), 300);

        const detected = detectType(file);
        const isFirstItem = value.length === 0;
        const newItem: UploadedFileItem = {
          id: `upl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          url: res.url,
          name: file.name,
          sizeBytes: file.size,
          sizeText: formatSize(file.size),
          type: detected,
          source: 'device',
          isCover: isFirstItem && detected === 'image',
          status: 'published',
          sortOrder: value.length,
        };

        if (isFirstItem && detected === 'image' && onCoverChange) {
          onCoverChange(res.url);
        }

        if (multiple) {
          onChange?.([...value, newItem]);
        } else {
          onChange?.([newItem]);
          if (detected === 'image' && onCoverChange) {
            onCoverChange(res.url);
          }
        }
      } catch (err: any) {
        setUploadProgress(null);
        setUploadError(err.message || 'File upload failed. Check Supabase connection.');
      }
    }
  };

  // Google Drive Import Handler
  const handleGoogleDriveImport = async () => {
    if (!gdriveFileId.trim()) {
      setUploadError('Please provide a valid Google Drive File ID or public link.');
      return;
    }

    setUploadError(null);
    setGdriveIsImporting(true);

    try {
      // Extract File ID if full Google Drive URL was pasted
      let fileId = gdriveFileId.trim();
      const urlMatch = fileId.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (urlMatch && urlMatch[1]) {
        fileId = urlMatch[1];
      }

      const storedToken = localStorage.getItem('google_drive_access_token');
      if (!storedToken) {
        initiateGoogleDriveAuth();
        throw new Error('Redirecting to Google Drive authentication. Please connect your account.');
      }

      const fileName = gdriveFileName.trim() || `gdrive_file_${fileId.substring(0, 8)}`;
      const result = await importGoogleDriveFileToSupabase(storedToken, fileId, fileName, bucket as any);

      if (!result.success || !result.url) {
        throw new Error(result.error || 'Failed to import file from Google Drive');
      }

      const newItem: UploadedFileItem = {
        id: `gdrive_${Date.now()}`,
        url: result.url,
        name: fileName,
        sizeText: 'Google Drive Asset',
        type: fileCategory === 'video' ? 'video' : fileCategory === 'audio' ? 'audio' : 'document',
        source: 'google-drive',
        isCover: value.length === 0,
        status: 'published',
        sortOrder: value.length,
      };

      if (value.length === 0 && onCoverChange) {
        onCoverChange(result.url);
      }

      if (multiple) {
        onChange?.([...value, newItem]);
      } else {
        onChange?.([newItem]);
      }

      setGdriveFileId('');
      setGdriveFileName('');
    } catch (err: any) {
      setUploadError(err.message || 'Google Drive import failed.');
    } finally {
      setGdriveIsImporting(false);
    }
  };

  const handleSetAsCover = (item: UploadedFileItem) => {
    const updated = value.map((f) => ({
      ...f,
      isCover: f.id === item.id,
    }));
    onChange?.(updated);
    if (onCoverChange) {
      onCoverChange(item.url);
    }
  };

  const handleRemove = (id: string) => {
    const updated = value.filter((f) => f.id !== id);
    onChange?.(updated);
    // If removed item was cover, assign cover to next available image
    const wasCover = value.find((f) => f.id === id)?.isCover;
    if (wasCover && onCoverChange) {
      const nextImage = updated.find((f) => f.type === 'image');
      onCoverChange(nextImage ? nextImage.url : '');
    }
  };

  const handleRename = (id: string) => {
    const item = value.find((f) => f.id === id);
    if (!item) return;
    const newName = prompt('Enter new file name:', item.name);
    if (newName && newName.trim()) {
      const updated = value.map((f) => (f.id === id ? { ...f, name: newName.trim() } : f));
      onChange?.(updated);
    }
  };

  const handleStatusChange = (id: string, status: ContentStatus) => {
    const updated = value.map((f) => (f.id === id ? { ...f, status } : f));
    onChange?.(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === value.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...value];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange?.(updated);
  };

  return (
    <div className="w-full space-y-3">
      {/* Header & Source Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          {label && <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{label}</h4>}
          {description && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
        </div>

        {/* Source Toggle Pills */}
        <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSourceTab('device')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium ${
              sourceTab === 'device'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Upload from Device</span>
          </button>
          <button
            type="button"
            onClick={() => setSourceTab('gdrive')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium ${
              sourceTab === 'gdrive'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Google Drive</span>
          </button>
        </div>
      </div>

      {/* Upload Zone (Device) */}
      {sourceTab === 'device' && (
        <div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files) handleDeviceUpload(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-4 sm:p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-500/10'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 hover:border-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple={multiple}
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleDeviceUpload(e.target.files);
              }}
            />

            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                  <span className="text-amber-600 dark:text-amber-400 font-semibold underline">Click to upload</span> or drag and drop files here
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Direct upload to <span className="font-mono text-amber-600/80">{bucket}</span>. Supports all formats.
                </p>
              </div>
            </div>

            {/* Chunked Upload Progress Bar */}
            {uploadProgress !== null && (
              <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-4 z-10">
                <div className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                      Uploading chunk...
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-150 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      isCancelledRef.current = true;
                      setUploadProgress(null);
                    }}
                    className="text-[11px] text-rose-500 hover:text-rose-600 hover:underline mx-auto block pt-1"
                  >
                    Cancel upload
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Zone (Google Drive Import) */}
      {sourceTab === 'gdrive' && (
        <div className="p-4 bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/60 rounded-xl space-y-3">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200">Import from Google Drive (OAuth 2.0)</h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Paste the Google Drive File ID or shareable link to import binary directly to Supabase storage.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Google Drive File ID or URL
              </label>
              <input
                type="text"
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OIvE2up0"
                value={gdriveFileId}
                onChange={(e) => setGdriveFileId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Asset Name (Optional)
              </label>
              <input
                type="text"
                placeholder="sermon_video_hd.mp4"
                value={gdriveFileName}
                onChange={(e) => setGdriveFileName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => initiateGoogleDriveAuth()}
              className="text-[11px] font-medium text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" /> Connect / Refresh Drive Access
            </button>
            <button
              type="button"
              disabled={gdriveIsImporting || !gdriveFileId.trim()}
              onClick={handleGoogleDriveImport}
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {gdriveIsImporting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Import to Supabase</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Error alert */}
      {uploadError && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{uploadError}</span>
          <button type="button" onClick={() => setUploadError(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Uploaded Items List & Preview */}
      {value.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Uploaded Files ({value.length})
            </span>
            {coverUrl && showCoverSelector && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                Cover image designated
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2">
            {value.map((item, idx) => {
              const isCover = item.isCover || (coverUrl && item.url === coverUrl);

              return (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-2.5 rounded-xl border transition-all gap-3 ${
                    isCover
                      ? 'border-amber-400 dark:border-amber-600/80 bg-amber-50/40 dark:bg-amber-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90'
                  }`}
                >
                  {/* Left: Thumbnail Preview & Metadata */}
                  <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                    {/* Media Thumbnail / Icon */}
                    <div
                      onClick={() => setActivePreviewUrl({ url: item.url, type: item.type, name: item.name })}
                      className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden group relative"
                    >
                      {item.type === 'image' ? (
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : item.type === 'video' ? (
                        <Video className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      ) : item.type === 'audio' ? (
                        <Music className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : item.type === 'pdf' ? (
                        <FileText className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                      ) : (
                        <FileText className="w-5 h-5 text-slate-500" />
                      )}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Eye className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs" title={item.name}>
                          {item.name}
                        </p>
                        {isCover && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950">
                            <Star className="w-2.5 h-2.5 fill-current" /> Cover
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-slate-400 dark:text-slate-400 font-mono">
                        {item.sizeText && <span>{item.sizeText}</span>}
                        <span>•</span>
                        <span className="uppercase text-[10px]">{item.type}</span>
                        <span>•</span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {item.source === 'google-drive' ? 'Google Drive' : 'Device'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions & Status */}
                  <div className="flex items-center flex-wrap gap-1.5 self-end sm:self-auto">
                    {/* Cover Toggle Button */}
                    {showCoverSelector && (item.type === 'image' || !item.type) && (
                      <button
                        type="button"
                        onClick={() => handleSetAsCover(item)}
                        className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                          isCover
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/60'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-600'
                        }`}
                        title="Designate as item cover image"
                      >
                        <Star className={`w-3.5 h-3.5 ${isCover ? 'fill-amber-500 text-amber-500' : ''}`} />
                        <span className="hidden sm:inline">{isCover ? 'Main Cover' : 'Set Cover'}</span>
                      </button>
                    )}

                    {/* Status Toggle Selector */}
                    {showStatusSelector && (
                      <select
                        value={item.status || 'published'}
                        onChange={(e) => handleStatusChange(item.id, e.target.value as ContentStatus)}
                        className="text-[11px] px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-slate-800 dark:text-slate-200"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="archived">Archived</option>
                      </select>
                    )}

                    {/* Reorder Buttons */}
                    {multiple && value.length > 1 && (
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, 'up')}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === value.length - 1}
                          onClick={() => handleMove(idx, 'down')}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Rename button */}
                    <button
                      type="button"
                      onClick={() => handleRename(item.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md"
                      title="Rename file"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Open link */}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md"
                      title="Open file in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md"
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Modal Preview */}
      {activePreviewUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-4 overflow-hidden shadow-2xl relative space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-sm">
                {activePreviewUrl.name}
              </span>
              <button
                type="button"
                onClick={() => setActivePreviewUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-center min-h-[220px] max-h-[70vh] overflow-auto bg-slate-950 rounded-xl p-2">
              {activePreviewUrl.type === 'image' ? (
                <img src={activePreviewUrl.url} alt={activePreviewUrl.name} className="max-h-[60vh] object-contain rounded-lg" />
              ) : activePreviewUrl.type === 'video' ? (
                <video src={activePreviewUrl.url} controls autoPlay className="max-h-[60vh] w-full rounded-lg" />
              ) : activePreviewUrl.type === 'audio' ? (
                <div className="w-full p-6 text-center space-y-3">
                  <Music className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
                  <audio src={activePreviewUrl.url} controls className="w-full" />
                </div>
              ) : (
                <div className="text-center p-6 space-y-2">
                  <FileText className="w-12 h-12 text-rose-400 mx-auto" />
                  <p className="text-xs text-slate-300">Document ready for download or view.</p>
                  <a
                    href={activePreviewUrl.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-slate-950 rounded-lg text-xs font-medium"
                  >
                    Open in browser <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
