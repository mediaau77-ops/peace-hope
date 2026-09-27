import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Sermon, ContentStatus } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { SUPABASE_BUCKETS } from '../../lib/supabase';
import { InlineUploadWidget } from '../common/InlineUploadWidget';
import { PublishStatusBadge, PublishStatusSelect } from '../common/PublishStatusControl';
import {
  Plus,
  Trash2,
  Edit2,
  Video,
  Play,
  FileText,
  Sparkles,
  CheckCircle2,
  X,
  Clock,
  Calendar,
  User,
  BookOpen,
} from 'lucide-react';

export const SermonManager: React.FC = () => {
  const { sermons, addSermon, updateSermon, deleteSermon } = useAdmin();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [speaker, setSpeaker] = useState('Pastor Emmanuel Mugabo');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [bibleRef, setBibleRef] = useState('');
  const [category, setCategory] = useState<Sermon['category']>('Divine Service');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [duration, setDuration] = useState('45:00');
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<ContentStatus>('published');
  const [isGeneratingTranscript, setIsGeneratingTranscript] = useState(false);

  const handleOpenCreate = () => {
    setTitle('');
    setSpeaker('Pastor Emmanuel Mugabo');
    setDate(new Date().toISOString().split('T')[0]);
    setBibleRef('');
    setCategory('Divine Service');
    setVideoUrl('');
    setThumbnailUrl('');
    setDuration('45:00');
    setTranscript('');
    setStatus('published');
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (s: Sermon) => {
    setTitle(s.title);
    setSpeaker(s.speaker);
    setDate(s.date);
    setBibleRef(s.bibleReference);
    setCategory(s.category);
    setVideoUrl(s.videoUrl);
    setThumbnailUrl(s.cover_image_url || s.thumbnailUrl || '');
    setDuration(s.duration);
    setTranscript(s.transcript);
    setStatus((s.status as ContentStatus) || 'published');
    setEditingId(s.id);
    setIsFormOpen(true);
  };

  const handleAutoGenerateTranscript = () => {
    setIsGeneratingTranscript(true);
    setTimeout(() => {
      setTranscript(
        `[00:01] Sabbath blessings congregation. Today as we examine ${bibleRef || 'the Word of God'}, we are reminded of God's sanctuary truth and faithful commandment-keeping. In Ellen G. White's writings, we find solemn encouragement that Christ's second coming draws nigh. Let us open our Bibles and pray together...`
      );
      setIsGeneratingTranscript(false);
    }, 900);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingId) {
      updateSermon(editingId, {
        title,
        speaker,
        date,
        bibleReference: bibleRef,
        category,
        videoUrl,
        thumbnailUrl,
        cover_image_url: thumbnailUrl,
        duration,
        transcript: transcript || 'Transcript pending verification.',
        status: status as any,
      });
    } else {
      addSermon({
        title,
        speaker,
        date,
        bibleReference: bibleRef,
        category,
        videoUrl,
        thumbnailUrl,
        cover_image_url: thumbnailUrl,
        duration,
        transcript: transcript || 'Transcript pending verification.',
        status: status as any,
      });
    }

    setIsFormOpen(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-6xl pb-16">
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-[0.22em] text-[#b4832e] dark:text-amber-400 uppercase mb-1">
            WORSHIP ARCHIVE
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-slate-900 dark:text-white font-normal tracking-tight">
            Sermons Library ({sermons.length})
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Video &amp; audio sermons, divine worship archives, and sermon notes with per-module media.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#b4832e] hover:bg-[#9c6a1e] text-white font-medium text-xs shadow-xs transition-colors shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Sermon</span>
        </button>
      </div>

      {/* Form Drawer / Card */}
      {isFormOpen && (
        <div className="bg-white dark:bg-slate-900 border border-[#e8e4db] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-md space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#ece8df] dark:border-slate-800">
            <h3 className="font-serif text-lg font-medium text-slate-900 dark:text-white">
              {editingId ? 'Edit Sermon Record' : 'Upload New Church Sermon'}
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Sermon Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., The Midnight Cry &amp; Modern Signs"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Publication Status
                </label>
                <PublishStatusSelect
                  status={status}
                  onChange={(st) => setStatus(st)}
                  size="md"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Preacher / Speaker
                </label>
                <input
                  type="text"
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Date Preached
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Sermon Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                >
                  <option value="Divine Service">Divine Service</option>
                  <option value="Sabbath School">Sabbath School</option>
                  <option value="Prayer Meeting">Wednesday Prayer Meeting</option>
                  <option value="Evangelistic Series">Evangelistic Series</option>
                  <option value="Youth Service">Youth Ministry Service</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Key Bible Text
                </label>
                <input
                  type="text"
                  placeholder="e.g., Revelation 14:6-12"
                  value={bibleRef}
                  onChange={(e) => setBibleRef(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Video Stream URL / HLS Link
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/... or Vimeo / MP4"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Duration (mm:ss)
                </label>
                <input
                  type="text"
                  placeholder="45:00"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Per-Module Sermon Media Upload Widget */}
            <div className="pt-2">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                Sermon Video, Audio &amp; Cover Media (`sermon-media` Bucket)
              </label>
              <InlineUploadWidget
                bucket={SUPABASE_BUCKETS.SERMON_MEDIA}
                parentTable="sermons"
                parentId={editingId || 'temp-sermon'}
                currentCoverUrl={thumbnailUrl}
                onCoverChange={(url) => setThumbnailUrl(url)}
              />
            </div>

            {/* Sermon Notes & Transcript */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                  Sermon Outline / Auto-Transcript
                </label>
                <button
                  type="button"
                  onClick={handleAutoGenerateTranscript}
                  disabled={isGeneratingTranscript}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-[#b4832e] dark:text-amber-400 text-[11px] font-medium border border-amber-200 dark:border-amber-800 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{isGeneratingTranscript ? 'Synthesizing...' : 'Generate AI Notes'}</span>
                </button>
              </div>
              <textarea
                rows={4}
                placeholder="Key sermon outline points, Scripture verses quoted, and pastoral message..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500 font-mono text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#ece8df] dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#b4832e] hover:bg-[#9c6a1e] text-white font-medium"
              >
                {editingId ? 'Save Changes' : 'Save Sermon'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sermon Archive Grid */}
      {sermons.length === 0 ? (
        <EmptyState
          title="No content has been published yet."
          description="No worship sermons found in Supabase. Click 'Upload Sermon' to record your first message."
          actionLabel="Upload Sermon"
          onAction={handleOpenCreate}
          tableName="sermons"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sermons.map((s) => (
            <div
              key={s.id}
              className="bg-white dark:bg-slate-900 border border-[#e8e4db] dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail / Video Preview */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden group">
                  {s.cover_image_url || s.thumbnailUrl ? (
                    <img
                      src={s.cover_image_url || s.thumbnailUrl}
                      alt={s.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                      <Video className="w-10 h-10 stroke-1" />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-2.5 right-2.5">
                    <PublishStatusBadge status={s.status || 'published'} />
                  </div>

                  <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{s.duration}</span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-[#b4832e] dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                      {s.category}
                    </span>
                    <span className="text-slate-400 text-xs">&bull;</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {s.date}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {s.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1">
                    <span className="flex items-center gap-1 font-medium truncate">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{s.speaker}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 shrink-0 font-mono">
                      <BookOpen className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>{s.bibleReference}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(s)}
                  className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
                  title="Edit Sermon"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteSermon(s.id)}
                  className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                  title="Delete Sermon"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
