import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Devotional, ContentStatus } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { SUPABASE_BUCKETS } from '../../lib/supabase';
import { InlineUploadWidget } from '../common/InlineUploadWidget';
import { PublishStatusBadge, PublishStatusSelect } from '../common/PublishStatusControl';
import {
  SunMedium,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  X,
  BookOpen,
  User,
  HeartHandshake,
} from 'lucide-react';

export const DevotionalManager: React.FC = () => {
  const { devotionals, addDevotional, updateDevotional, deleteDevotional } = useAdmin();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [verseRef, setVerseRef] = useState('');
  const [verseText, setVerseText] = useState('');
  const [meditation, setMeditation] = useState('');
  const [prayer, setPrayer] = useState('');
  const [author, setAuthor] = useState('Pastor Emmanuel Mugabo');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<ContentStatus>('published');

  const handleOpenCreate = () => {
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setVerseRef('');
    setVerseText('');
    setMeditation('');
    setPrayer('');
    setAuthor('Pastor Emmanuel Mugabo');
    setImageUrl('');
    setStatus('published');
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (d: Devotional) => {
    setTitle(d.title);
    setDate(d.date);
    setVerseRef(d.verseReference);
    setVerseText(d.verseText);
    setMeditation(d.meditation);
    setPrayer(d.prayer);
    setAuthor(d.author);
    setImageUrl(d.cover_image_url || d.imageUrl || '');
    setStatus((d.status as ContentStatus) || 'published');
    setEditingId(d.id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingId) {
      updateDevotional(editingId, {
        title,
        date,
        verseReference: verseRef,
        verseText,
        meditation,
        prayer,
        author,
        imageUrl,
        cover_image_url: imageUrl,
        status: status as any,
      });
    } else {
      addDevotional({
        title,
        date,
        verseReference: verseRef,
        verseText,
        meditation,
        prayer,
        author,
        imageUrl,
        cover_image_url: imageUrl,
        status: status as any,
      });
    }

    setIsFormOpen(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-[0.22em] text-[#b4832e] dark:text-amber-400 uppercase mb-1">
            DAILY MEDITATIONS
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-slate-900 dark:text-white font-normal tracking-tight">
            Devotionals ({devotionals.length})
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Morning inspiration, daily Scripture verses, and spiritual reflection entries with per-module media.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#b4832e] hover:bg-[#9c6a1e] text-white font-medium text-xs shadow-xs transition-colors shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Daily Devotional</span>
        </button>
      </div>

      {/* Form Drawer */}
      {isFormOpen && (
        <div className="bg-white dark:bg-slate-900 border border-[#e8e4db] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-md space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#ece8df] dark:border-slate-800">
            <h3 className="font-serif text-lg font-medium text-slate-900 dark:text-white">
              {editingId ? 'Edit Devotional Entry' : 'Create Daily Devotional Entry'}
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
                  Devotional Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Morning Mercies and Unfailing Love"
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
                  Scheduled Date
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
                  Scripture Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g., Lamentations 3:22-23"
                  value={verseRef}
                  onChange={(e) => setVerseRef(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Author / Contributor
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Full Scripture Verse Quotation
              </label>
              <textarea
                rows={2}
                placeholder="Quote the full Bible verse..."
                value={verseText}
                onChange={(e) => setVerseText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500 italic"
              />
            </div>

            {/* Per-Module Devotional Media Upload Widget */}
            <div className="pt-2">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                Devotional Cover Image (`devotional-media` Bucket)
              </label>
              <InlineUploadWidget
                bucket={SUPABASE_BUCKETS.DEVOTIONAL_MEDIA}
                parentTable="devotionals"
                parentId={editingId || 'temp-devotional'}
                currentCoverUrl={imageUrl}
                onCoverChange={(url) => setImageUrl(url)}
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Spiritual Meditation Message *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Write the reflection thoughts, life application, and encouragement..."
                value={meditation}
                onChange={(e) => setMeditation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500 leading-relaxed text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Concluding Daily Prayer
              </label>
              <textarea
                rows={2}
                placeholder="Father in Heaven, guide our steps today..."
                value={prayer}
                onChange={(e) => setPrayer(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
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
                {editingId ? 'Save Changes' : 'Publish Devotional'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Devotionals Grid / Empty State */}
      {devotionals.length === 0 ? (
        <EmptyState
          title="No content has been published yet."
          description="No daily devotionals found in Supabase. Click 'New Daily Devotional' to publish your first entry."
          actionLabel="New Daily Devotional"
          onAction={handleOpenCreate}
          tableName="devotionals"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {devotionals.map((d) => (
            <div
              key={d.id}
              className="bg-white dark:bg-slate-900 border border-[#e8e4db] dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {(d.cover_image_url || d.imageUrl) && (
                  <div className="h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                    <img
                      src={d.cover_image_url || d.imageUrl}
                      alt={d.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <PublishStatusBadge status={d.status || 'published'} />
                    </div>
                  </div>
                )}

                <div className="p-4 sm:p-5 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3 h-3 text-[#b4832e] dark:text-amber-400" />
                      <span>{d.date}</span>
                    </span>
                    {!(d.cover_image_url || d.imageUrl) && (
                      <PublishStatusBadge status={d.status || 'published'} />
                    )}
                  </div>

                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {d.title}
                  </h3>

                  {d.verseReference && (
                    <div className="text-xs text-[#b4832e] dark:text-amber-400 font-medium font-serif italic">
                      {d.verseReference}
                    </div>
                  )}

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {d.meditation}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                  By {d.author}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(d)}
                    className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
                    title="Edit Devotional"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteDevotional(d.id)}
                    className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    title="Delete Devotional"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
