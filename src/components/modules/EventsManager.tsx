import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { ChurchEvent, ContentStatus } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { SUPABASE_BUCKETS } from '../../lib/supabase';
import { InlineUploadWidget } from '../common/InlineUploadWidget';
import { PublishStatusBadge, PublishStatusSelect } from '../common/PublishStatusControl';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Edit2,
  Clock,
  MapPin,
  Users,
  Repeat,
  X,
  Check,
} from 'lucide-react';

export const EventsManager: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent } = useAdmin();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00 AM - 12:30 PM');
  const [location, setLocation] = useState('Main Sanctuary & Online Broadcast');
  const [speaker, setSpeaker] = useState('Pastor Emmanuel Mugabo');
  const [category, setCategory] = useState<ChurchEvent['category']>('Sabbath Worship');
  const [isRecurringWeekly, setIsRecurringWeekly] = useState(true);
  const [registrationRequired, setRegistrationRequired] = useState(false);
  const [capacity, setCapacity] = useState(500);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [status, setStatus] = useState<ContentStatus>('published');

  const handleOpenCreate = () => {
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('09:00 AM - 12:30 PM');
    setLocation('Main Sanctuary & Online Broadcast');
    setSpeaker('Pastor Emmanuel Mugabo');
    setCategory('Sabbath Worship');
    setIsRecurringWeekly(true);
    setRegistrationRequired(false);
    setCapacity(500);
    setCoverImageUrl('');
    setStatus('published');
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (e: ChurchEvent) => {
    setTitle(e.title);
    setDate(e.date || e.startDate || '');
    setTime(e.time);
    setLocation(e.location);
    setSpeaker(e.speaker || e.theme || '');
    setCategory(e.category);
    setIsRecurringWeekly(e.isRecurringWeekly ?? true);
    setRegistrationRequired(e.registrationRequired ?? false);
    setCapacity(e.capacity || 500);
    setCoverImageUrl(e.cover_image_url || e.imageUrl || '');
    setStatus((e.status as ContentStatus) || 'published');
    setEditingId(e.id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingId) {
      updateEvent(editingId, {
        title,
        date,
        time,
        location,
        speaker,
        category,
        isRecurringWeekly,
        registrationRequired,
        capacity,
        imageUrl: coverImageUrl,
        cover_image_url: coverImageUrl,
        status: status as any,
      });
    } else {
      addEvent({
        title,
        date,
        time,
        location,
        speaker,
        category,
        isRecurringWeekly,
        registrationRequired,
        capacity,
        imageUrl: coverImageUrl,
        cover_image_url: coverImageUrl,
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
            CALENDAR &amp; GATHERINGS
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-slate-900 dark:text-white font-normal tracking-tight">
            Church Events ({events.length})
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Weekly worship schedules, prayer vigils, evangelistic seminars, and youth fellowship with per-module media.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#b4832e] hover:bg-[#9c6a1e] text-white font-medium text-xs shadow-xs transition-colors shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Event</span>
        </button>
      </div>

      {/* Form Drawer / Card */}
      {isFormOpen && (
        <div className="bg-white dark:bg-slate-900 border border-[#e8e4db] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-md space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#ece8df] dark:border-slate-800">
            <h3 className="font-serif text-lg font-medium text-slate-900 dark:text-white">
              {editingId ? 'Edit Scheduled Church Event' : 'Schedule New Church Event'}
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
                  Event Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Annual Camp Meeting 2026"
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
                  Event Date
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
                  Time Range
                </label>
                <input
                  type="text"
                  placeholder="09:00 AM - 12:30 PM"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Event Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                >
                  <option value="Sabbath Worship">Sabbath Worship</option>
                  <option value="Prayer Meeting">Prayer Meeting</option>
                  <option value="Youth Fellowship">Youth Fellowship</option>
                  <option value="Health Seminar">Health Seminar</option>
                  <option value="Community Outreach">Community Outreach</option>
                  <option value="Choir Practice">Choir Practice</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Location / Venue
                </label>
                <input
                  type="text"
                  placeholder="e.g., Sanctuary &amp; Online Stream"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Featured Speaker / Host
                </label>
                <input
                  type="text"
                  placeholder="e.g., Pastor Emmanuel Mugabo"
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Per-Module Event Media Upload Widget */}
            <div className="pt-2">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                Event Banner &amp; Poster Media (`event-media` Bucket)
              </label>
              <InlineUploadWidget
                bucket={SUPABASE_BUCKETS.EVENT_MEDIA}
                parentTable="events"
                parentId={editingId || 'temp-event'}
                currentCoverUrl={coverImageUrl}
                onCoverChange={(url) => setCoverImageUrl(url)}
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isRecurringWeekly}
                  onChange={(e) => setIsRecurringWeekly(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Recurring Weekly Program
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={registrationRequired}
                  onChange={(e) => setRegistrationRequired(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  RSVP / Registration Required
                </span>
              </label>
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
                {editingId ? 'Save Changes' : 'Schedule Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events Grid / Empty State */}
      {events.length === 0 ? (
        <EmptyState
          title="No content has been published yet."
          description="No church events found in Supabase. Click 'Schedule Event' to add upcoming church gatherings."
          actionLabel="Schedule Event"
          onAction={handleOpenCreate}
          tableName="events"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((e) => (
            <div
              key={e.id}
              className="bg-white dark:bg-slate-900 border border-[#e8e4db] dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {(e.cover_image_url || e.imageUrl) && (
                  <div className="h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                    <img
                      src={e.cover_image_url || e.imageUrl}
                      alt={e.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <PublishStatusBadge status={e.status || 'published'} />
                    </div>
                  </div>
                )}

                <div className="p-4 sm:p-5 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-[#b4832e] dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                      {e.category}
                    </span>
                    {!(e.cover_image_url || e.imageUrl) && (
                      <PublishStatusBadge status={e.status || 'published'} />
                    )}
                  </div>

                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {e.title}
                  </h3>

                  <div className="space-y-1.5 pt-1 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>{e.date || e.startDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{e.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{e.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                  {e.speaker}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(e)}
                    className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
                    title="Edit Event"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteEvent(e.id)}
                    className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    title="Delete Event"
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
