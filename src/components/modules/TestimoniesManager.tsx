import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Testimony, ContentStatus } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { SUPABASE_BUCKETS } from '../../lib/supabase';
import { InlineUploadWidget } from '../common/InlineUploadWidget';
import { PublishStatusBadge, PublishStatusSelect } from '../common/PublishStatusControl';
import {
  Sparkles,
  CheckCircle,
  XCircle,
  Trash2,
  MapPin,
  Calendar,
  Plus,
  X,
  User,
  Image as ImageIcon,
} from 'lucide-react';

export const TestimoniesManager: React.FC = () => {
  const { testimonies, approveTestimony, rejectTestimony, deleteTestimony, addTestimony } = useAdmin();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [location, setLocation] = useState('Kigali, Rwanda');
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [status, setStatus] = useState<ContentStatus>('published');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !story.trim()) return;

    addTestimony({
      authorName: authorName || 'Faithful Member',
      location: location || 'Rwanda',
      title,
      story,
      cover_image_url: coverImageUrl,
      imageUrl: coverImageUrl,
      status: (status === 'published' ? 'Approved' : 'Pending') as any,
    });

    setAuthorName('');
    setTitle('');
    setStory('');
    setCoverImageUrl('');
    setStatus('published');
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-[0.22em] text-[#b4832e] dark:text-amber-400 uppercase mb-1">
            PRAISE &amp; THANKSGIVING
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-slate-900 dark:text-white font-normal tracking-tight">
            Testimonies &amp; Praise Reports ({testimonies.length})
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Review incoming Sabbath keeping miracles, answered prayers, and healing testimonies with per-module media.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#b4832e] hover:bg-[#9c6a1e] text-white font-medium text-xs shadow-xs transition-colors shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Testimony</span>
        </button>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-[#e8e4db] dark:border-slate-800 rounded-3xl w-full max-w-xl p-5 sm:p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#ece8df] dark:border-slate-800">
              <h3 className="font-serif text-lg font-medium text-slate-900 dark:text-white">
                Record Member Praise Report
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Member Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Sister Keza"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Location / Branch
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Testimony Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Miracle Healing after 3 Days of Fasting"
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
              </div>

              {/* Per-Module Testimony Media Upload Widget */}
              <div className="pt-2">
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                  Testimony Photo &amp; Audio Voice Note (`testimony-media` Bucket)
                </label>
                <InlineUploadWidget
                  bucket={SUPABASE_BUCKETS.TESTIMONY_MEDIA}
                  parentTable="testimonies"
                  parentId="temp-testimony"
                  currentCoverUrl={coverImageUrl}
                  onCoverChange={(url) => setCoverImageUrl(url)}
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Full Story of God's Deliverance *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail the circumstances, prayers offered, and praise to God..."
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500 leading-relaxed text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece8df] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#b4832e] hover:bg-[#9c6a1e] text-white font-medium"
                >
                  Save Praise Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Testimonies Grid / Empty State */}
      {testimonies.length === 0 ? (
        <EmptyState
          title="No content has been published yet."
          description="No praise reports or testimonies recorded in Supabase yet. Click 'Record Testimony' to add member praises."
          actionLabel="Record Testimony"
          onAction={() => setIsAddOpen(true)}
          tableName="testimonies"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonies.map((t) => (
            <div
              key={t.id}
              className="bg-white dark:bg-slate-900 border border-[#e8e4db] dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {(t.cover_image_url || t.imageUrl) && (
                  <div className="h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                    <img
                      src={t.cover_image_url || t.imageUrl}
                      alt={t.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <PublishStatusBadge
                        status={t.status === 'Approved' ? 'published' : t.status === 'Rejected' ? 'archived' : 'draft'}
                      />
                    </div>
                  </div>
                )}

                <div className="p-4 sm:p-5 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>{t.date}</span>
                    </span>
                    {!(t.cover_image_url || t.imageUrl) && (
                      <PublishStatusBadge
                        status={t.status === 'Approved' ? 'published' : t.status === 'Rejected' ? 'archived' : 'draft'}
                      />
                    )}
                  </div>

                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {t.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-4 leading-relaxed">
                    {t.story}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-medium truncate max-w-[140px]">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{t.authorName}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{t.location}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {t.status !== 'Approved' && (
                    <button
                      onClick={() => approveTestimony(t.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold hover:bg-emerald-100 flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Publish</span>
                    </button>
                  )}
                  {t.status !== 'Rejected' && (
                    <button
                      onClick={() => rejectTestimony(t.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-medium hover:bg-slate-200 flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Unpublish</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => deleteTestimony(t.id)}
                  className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200"
                  title="Delete Testimony"
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
