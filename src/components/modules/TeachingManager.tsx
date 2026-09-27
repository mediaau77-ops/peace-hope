import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Teaching, ContentStatus } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { SUPABASE_BUCKETS } from '../../lib/supabase';
import { InlineUploadWidget } from '../common/InlineUploadWidget';
import { PublishStatusBadge, PublishStatusSelect } from '../common/PublishStatusControl';
import {
  Plus,
  Trash2,
  Edit2,
  BookMarked,
  Calendar,
  Eye,
  Check,
  X,
  BookOpen,
  Clock,
  User,
  Video,
} from 'lucide-react';

export const TeachingManager: React.FC = () => {
  const { teachings, addTeaching, updateTeaching, deleteTeaching } = useAdmin();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [content, setContent] = useState('');
  const [bibleRefs, setBibleRefs] = useState('');
  const [category, setCategory] = useState<Teaching['category']>('Sabbath Truth');
  const [author, setAuthor] = useState('Pastor Emmanuel Mugabo');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<ContentStatus>('published');
  const [readTime, setReadTime] = useState(8);

  const handleOpenCreate = () => {
    setTitle('');
    setCoverImage('');
    setVideoUrl('');
    setContent('');
    setBibleRefs('');
    setCategory('Sabbath Truth');
    setAuthor('Pastor Emmanuel Mugabo');
    setPublishDate(new Date().toISOString().split('T')[0]);
    setStatus('published');
    setReadTime(5);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (t: Teaching) => {
    setTitle(t.title);
    setCoverImage(t.cover_image_url || t.coverImage || '');
    setVideoUrl(t.videoUrl || '');
    setContent(t.content);
    setBibleRefs((t.bibleReferences || []).join(', '));
    setCategory(t.category);
    setAuthor(t.author);
    setPublishDate(t.publishDate);
    setStatus((t.status as ContentStatus) || 'published');
    setReadTime(t.readTimeMinutes);
    setEditingId(t.id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const refs = bibleRefs
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    if (editingId) {
      updateTeaching(editingId, {
        title,
        coverImage,
        cover_image_url: coverImage,
        videoUrl: videoUrl || undefined,
        content,
        bibleReferences: refs,
        category,
        author,
        publishDate,
        status: status as any,
        readTimeMinutes: readTime,
      });
    } else {
      addTeaching({
        title,
        coverImage,
        cover_image_url: coverImage,
        videoUrl: videoUrl || undefined,
        content,
        bibleReferences: refs,
        category,
        author,
        publishDate,
        status: status as any,
        readTimeMinutes: readTime,
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
            DOCTRINE &amp; THEOLOGY
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-slate-900 dark:text-white font-normal tracking-tight">
            Teachings Channel ({teachings.length})
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Doctrinal Bible studies, Seventh-day Adventist fundamental beliefs, and articles with per-module media.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#b4832e] hover:bg-[#9c6a1e] text-white font-medium text-xs shadow-xs transition-colors shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Study</span>
        </button>
      </div>

      {/* Form Dialog / Drawer */}
      {isFormOpen && (
        <div className="bg-white dark:bg-slate-900 border border-[#e8e4db] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-md space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#ece8df] dark:border-slate-800">
            <h3 className="font-serif text-lg font-medium text-slate-900 dark:text-white">
              {editingId ? 'Edit Bible Study Teaching' : 'Publish New Doctrinal Study'}
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
                  Study Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., The Heavenly Sanctuary in Prophecy"
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
                  Author / Pastor
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Doctrinal Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                >
                  <option value="Sabbath Truth">Sabbath Truth</option>
                  <option value="Sanctuary">Sanctuary Message</option>
                  <option value="State of the Dead">State of the Dead</option>
                  <option value="Spirit of Prophecy">Spirit of Prophecy</option>
                  <option value="Health Reform">Health Reform</option>
                  <option value="Christian Stewardship">Christian Stewardship</option>
                  <option value="Second Coming">Second Coming</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Read Time (Minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  value={readTime}
                  onChange={(e) => setReadTime(parseInt(e.target.value) || 5)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Scripture References (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Daniel 8:14, Hebrews 9:11-14"
                  value={bibleRefs}
                  onChange={(e) => setBibleRefs(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Accompanying Video URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/... or Vimeo link"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Per-Module Teaching Media Upload Widget */}
            <div className="pt-2">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                Teaching Documents &amp; Cover Media (`teaching-media` Bucket)
              </label>
              <InlineUploadWidget
                bucket={SUPABASE_BUCKETS.TEACHING_MEDIA}
                parentTable="teachings"
                parentId={editingId || 'temp-teaching'}
                currentCoverUrl={coverImage}
                onCoverChange={(url) => setCoverImage(url)}
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Full Biblical Exposition Content *
              </label>
              <textarea
                rows={6}
                required
                placeholder="Write the full doctrinal teaching, historical context, and Ellen G. White citations..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
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
                {editingId ? 'Save Changes' : 'Publish Study'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teachings Grid / Empty State */}
      {teachings.length === 0 ? (
        <EmptyState
          title="No content has been published yet."
          description="No Bible studies or teachings found in Supabase. Click 'Publish New Study' to create your first doctrinal teaching."
          actionLabel="Publish New Study"
          onAction={handleOpenCreate}
          tableName="teachings"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teachings.map((t) => (
            <div
              key={t.id}
              className="bg-white dark:bg-slate-900 border border-[#e8e4db] dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Cover Image */}
                {(t.cover_image_url || t.coverImage) && (
                  <div className="h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                    <img
                      src={t.cover_image_url || t.coverImage}
                      alt={t.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <PublishStatusBadge status={t.status || 'published'} />
                    </div>
                  </div>
                )}

                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-[#b4832e] dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                      {t.category}
                    </span>
                    {!(t.cover_image_url || t.coverImage) && (
                      <PublishStatusBadge status={t.status || 'published'} />
                    )}
                  </div>

                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {t.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {t.content}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[120px]">{t.author}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {t.readTimeMinutes} min read
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(t)}
                  className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
                  title="Edit Study"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteTeaching(t.id)}
                  className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                  title="Delete Study"
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
