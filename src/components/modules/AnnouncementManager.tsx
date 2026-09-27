import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Announcement, ContentStatus } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { SUPABASE_BUCKETS } from '../../lib/supabase';
import { InlineUploadWidget } from '../common/InlineUploadWidget';
import { PublishStatusBadge, PublishStatusSelect } from '../common/PublishStatusControl';
import {
  Bell,
  Plus,
  Search,
  Calendar,
  Users,
  Radio,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Send,
  AlertTriangle,
  X,
} from 'lucide-react';

export const AnnouncementManager: React.FC = () => {
  const {
    announcements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetAudience, setTargetAudience] = useState<Announcement['targetAudience']>('All Members');
  const [priority, setPriority] = useState<Announcement['priority']>('Normal');
  const [channels, setChannels] = useState<Announcement['channels']>(['Website', 'App Push']);
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [status, setStatus] = useState<ContentStatus>('published');

  const showNotice = (msg: string) => {
    setAdminNotice(msg);
    setTimeout(() => setAdminNotice(null), 3500);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setBody('');
    setTargetAudience('All Members');
    setPriority('Normal');
    setChannels(['Website', 'App Push']);
    setPublishDate(new Date().toISOString().split('T')[0]);
    setExpiryDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    setCoverImageUrl('');
    setStatus('published');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a: Announcement) => {
    setEditingId(a.id);
    setTitle(a.title);
    setBody(a.body);
    setTargetAudience(a.targetAudience);
    setPriority(a.priority);
    setChannels(a.channels || ['Website']);
    setPublishDate(a.publishDate);
    setExpiryDate(a.expiryDate || '');
    setCoverImageUrl(a.cover_image_url || '');
    setStatus((a.status as ContentStatus) || 'published');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    if (editingId) {
      updateAnnouncement(editingId, {
        title,
        body,
        targetAudience,
        priority,
        channels,
        publishDate,
        expiryDate,
        cover_image_url: coverImageUrl,
        status: status as any,
      });
      showNotice('Bulletin announcement updated successfully.');
    } else {
      addAnnouncement({
        title,
        body,
        targetAudience,
        priority,
        channels,
        publishDate,
        expiryDate,
        cover_image_url: coverImageUrl,
        status: status as any,
      });
      showNotice('New church bulletin announcement published.');
    }

    setIsModalOpen(false);
    setEditingId(null);
  };

  const filteredAnnouncements = announcements.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.targetAudience.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-6xl pb-16">
      {/* Toast Notice */}
      {adminNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-amber-950 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 dark:border-amber-800 flex items-center gap-3 text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{adminNotice}</span>
        </div>
      )}

      {/* Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-[0.22em] text-[#b4832e] dark:text-amber-400 uppercase mb-1">
            BULLETIN &amp; COMMUNIQUE
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-slate-900 dark:text-white font-normal tracking-tight">
            Official Announcements ({announcements.length})
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Church notices, pastoral pastoral letters, and department alerts with per-module media.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#b4832e] hover:bg-[#9c6a1e] text-white font-medium text-xs shadow-xs transition-colors shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Bulletin Notice</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-[#e8e4db] dark:border-slate-800 rounded-2xl px-3.5 py-2">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter announcements by title, department, or keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none w-full"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-slate-400 hover:text-slate-600 text-xs"
          >
            Clear
          </button>
        )}
      </div>

      {/* Form Dialog */}
      {isModalOpen && (
        <div className="bg-white dark:bg-slate-900 border border-[#e8e4db] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-md space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#ece8df] dark:border-slate-800">
            <h3 className="font-serif text-lg font-medium text-slate-900 dark:text-white">
              {editingId ? 'Edit Bulletin Announcement' : 'Draft Official Announcement'}
            </h3>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Combined Fellowship Potluck &amp; Sabbath Vespers"
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
                  Target Audience
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                >
                  <option value="All Members">All Members &amp; Public</option>
                  <option value="Youth">Youth Ministry</option>
                  <option value="Pathfinders">Pathfinders &amp; Adventurers</option>
                  <option value="Parents">Parents &amp; Family Life</option>
                  <option value="Choir">Music &amp; Choir</option>
                  <option value="Leaders Only">Church Board &amp; Elders</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Urgency Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                >
                  <option value="Normal">Normal Notice</option>
                  <option value="Important">Important Reminder</option>
                  <option value="Urgent">Urgent / Emergency Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Expiration Date
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Per-Module Announcement Media Upload Widget */}
            <div className="pt-2">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                Bulletin Media &amp; Flyer (`announcement-media` Bucket)
              </label>
              <InlineUploadWidget
                bucket={SUPABASE_BUCKETS.ANNOUNCEMENT_MEDIA}
                parentTable="announcements"
                parentId={editingId || 'temp-announcement'}
                currentCoverUrl={coverImageUrl}
                onCoverChange={(url) => setCoverImageUrl(url)}
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Announcement Body Content *
              </label>
              <textarea
                rows={5}
                required
                placeholder="Full details of the announcement, contacts, times, and departmental instructions..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500 font-mono text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#ece8df] dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#b4832e] hover:bg-[#9c6a1e] text-white font-medium"
              >
                {editingId ? 'Save Changes' : 'Broadcast Announcement'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements List / Empty State */}
      {filteredAnnouncements.length === 0 ? (
        <EmptyState
          title="No content has been published yet."
          description="No official church announcements found in Supabase. Click 'New Bulletin Notice' to create your first broadcast."
          actionLabel="New Bulletin Notice"
          onAction={handleOpenCreate}
          tableName="announcements"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAnnouncements.map((a) => (
            <div
              key={a.id}
              className="bg-white dark:bg-slate-900 border border-[#e8e4db] dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {a.cover_image_url && (
                  <div className="h-36 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2">
                    <img
                      src={a.cover_image_url}
                      alt={a.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                        a.priority === 'Urgent'
                          ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900'
                          : a.priority === 'High'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900'
                          : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {a.priority}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      To: {a.targetAudience}
                    </span>
                  </div>

                  <PublishStatusBadge status={a.status || 'published'} />
                </div>

                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {a.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  {a.body}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3" />
                  {a.publishDate}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(a)}
                    className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    title="Edit Announcement"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteAnnouncement(a.id)}
                    className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    title="Delete Announcement"
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
