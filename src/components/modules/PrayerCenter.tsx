import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { PrayerRequest } from '../../types';
import { SUPABASE_BUCKETS } from '../../lib/supabase';
import { EmptyState } from '../common/EmptyState';
import { InlineUploadWidget } from '../common/InlineUploadWidget';
import { PublishStatusBadge } from '../common/PublishStatusControl';
import {
  HeartHandshake,
  Pin,
  CheckCircle,
  XCircle,
  Trash2,
  Flame,
  ThumbsUp,
  Filter,
  Plus,
  ShieldCheck,
  MapPin,
  Mail,
  User,
  X,
  Image,
} from 'lucide-react';

export const PrayerCenter: React.FC = () => {
  const {
    prayerRequests,
    approvePrayer,
    rejectPrayer,
    deletePrayer,
    pinPrayer,
    addPrayerRequest,
    lightCandle,
    reactAmen,
    userCandles,
    userAmens,
  } = useAdmin();

  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New prayer form
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [location, setLocation] = useState('Kigali, Rwanda');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PrayerRequest['category']>('Health & Healing');
  const [coverUrl, setCoverUrl] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const filtered = prayerRequests.filter((p) => {
    if (filterStatus === 'All') return true;
    if (filterStatus === 'Pinned') return p.isPinned;
    return p.status === filterStatus;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    addPrayerRequest({
      authorName: isAnonymous ? 'Anonymous Church Member' : authorName || 'Church Member',
      authorEmail: authorEmail || 'member@peaceandhope.org',
      isAnonymous,
      location,
      title,
      content,
      category,
    });

    setIsAddOpen(false);
    setTitle('');
    setContent('');
    setAuthorName('');
    setCoverUrl('');
    setFeedbackMsg('Prayer request submitted and placed in moderation review.');
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleCandleClick = (id: string) => {
    const res = lightCandle(id);
    setFeedbackMsg(res.message);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const handleAmenClick = (id: string) => {
    const res = reactAmen(id);
    setFeedbackMsg(res.message);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-6xl pb-16">
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-[0.22em] text-[#b4832e] dark:text-amber-400 uppercase mb-1">
            INTERCESSORY MINISTRY
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-slate-900 dark:text-white font-normal tracking-tight">
            Prayer Request Center ({prayerRequests.length})
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Moderate, approve, and pin member supplications with virtual prayer candle intercession and per-module media.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#b4832e] hover:bg-[#9c6a1e] text-white font-medium text-xs shadow-xs transition-colors shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Prayer Request</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#ece8df] dark:border-slate-800 pb-3">
        {['All', 'Pending', 'Approved', 'Rejected', 'Pinned'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              filterStatus === status
                ? 'bg-[#fef9ee] dark:bg-amber-950/40 text-[#b4832e] dark:text-amber-400 border border-[#f5e6c8] dark:border-amber-800/60 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {status}
            {status === 'Pending' && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-[10px] font-bold">
                {prayerRequests.filter((p) => p.status === 'Pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Submit Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-[#e8e4db] dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#ece8df] dark:border-slate-800">
              <h3 className="font-serif text-lg font-medium text-slate-900 dark:text-white">
                Log New Prayer Request
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Member Name
                  </label>
                  <input
                    type="text"
                    disabled={isAnonymous}
                    placeholder="e.g. Brother Jean"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonCheck"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-amber-600"
                />
                <label htmlFor="anonCheck" className="text-slate-700 dark:text-slate-300 font-medium">
                  Submit Anonymously (Display as Anonymous Church Member)
                </label>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="Health & Healing">Health &amp; Healing</option>
                  <option value="Family & Marriage">Family &amp; Marriage</option>
                  <option value="Spiritual Growth">Spiritual Growth</option>
                  <option value="Financial & Job">Financial &amp; Employment</option>
                  <option value="Church Mission">Church Evangelism Mission</option>
                  <option value="Youth & Education">Youth &amp; Education</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Prayer Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Healing for my Mother in Hospital"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Supplication Details *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain prayer need..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              {/* Per-Module Prayer Media Upload */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Prayer Photo / Card Attachment (`prayer-media` Bucket)
                </label>
                <InlineUploadWidget
                  bucket={SUPABASE_BUCKETS.PRAYER_MEDIA}
                  parentTable="prayers"
                  parentId="new-prayer"
                  currentCoverUrl={coverUrl}
                  onCoverChange={(url) => setCoverUrl(url)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece8df] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#b4832e] hover:bg-[#9c6a1e] text-white font-medium"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prayers List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <EmptyState
            title="No content has been published yet."
            description="No community prayer requests found in Supabase. Click 'Submit Prayer Request' to log and share a prayer request."
            actionLabel="Submit Prayer Request"
            onAction={() => setIsAddOpen(true)}
            tableName="prayers"
          />
        ) : (
          filtered.map((prayer) => {
            const hasLitCandle = Boolean(userCandles[prayer.id]);
            const hasSaidAmen = Boolean(userAmens[prayer.id]);

            return (
              <div
                key={prayer.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 sm:p-5 shadow-xs transition-all ${
                  prayer.isPinned
                    ? 'border-amber-300 dark:border-amber-700/70 bg-[#fefcf8] dark:bg-amber-950/10'
                    : 'border-[#e8e4db] dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ece8df] dark:border-slate-800">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#b4832e] dark:text-amber-400 bg-[#fef9ee] dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-[#f5e6c8] dark:border-amber-800/60">
                      {prayer.category}
                    </span>

                    <PublishStatusBadge
                      status={prayer.status === 'Approved' ? 'published' : prayer.status === 'Pending' ? 'draft' : 'archived'}
                    />

                    {prayer.isPinned && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-1">
                        <Pin className="w-2.5 h-2.5" /> PINNED
                      </span>
                    )}
                  </div>

                  {/* Admin Moderation Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => pinPrayer(prayer.id)}
                      className={`p-1.5 rounded-lg border text-xs ${
                        prayer.isPinned
                          ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      title={prayer.isPinned ? 'Unpin' : 'Pin to Sanctuary Prayer Board'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    {prayer.status !== 'Approved' && (
                      <button
                        onClick={() => approvePrayer(prayer.id)}
                        className="px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Approve</span>
                      </button>
                    )}

                    {prayer.status !== 'Rejected' && (
                      <button
                        onClick={() => rejectPrayer(prayer.id)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium"
                      >
                        Reject
                      </button>
                    )}

                    <button
                      onClick={() => deletePrayer(prayer.id)}
                      className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="py-3 space-y-1.5">
                  <h4 className="font-serif text-base font-medium text-slate-900 dark:text-white">
                    {prayer.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {prayer.content}
                  </p>
                </div>

                {/* Footer Intercession & Metadata */}
                <div className="pt-3 border-t border-[#ece8df] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 flex-wrap">
                    <span>
                      {prayer.isAnonymous ? 'Anonymous Church Member' : prayer.authorName}
                    </span>
                    <span>&bull;</span>
                    <span>{prayer.location}</span>
                  </div>

                  {/* Intercession reactions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCandleClick(prayer.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        hasLitCandle
                          ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-amber-50 hover:border-amber-200'
                      }`}
                    >
                      <Flame className={`w-3.5 h-3.5 ${hasLitCandle ? 'text-amber-600 fill-amber-600' : 'text-slate-400'}`} />
                      <span>{prayer.candleCount} Candles Lit</span>
                    </button>

                    <button
                      onClick={() => handleAmenClick(prayer.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        hasSaidAmen
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 hover:border-emerald-200'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${hasSaidAmen ? 'text-emerald-600 fill-emerald-600' : 'text-slate-400'}`} />
                      <span>{prayer.amenCount} Amens</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
