import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { AppNotification } from '../../types';
import {
  Bell,
  Send,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const { notifications, sendPushNotification } = useAdmin();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<AppNotification['type']>('Live Alert');
  const [targetAudience, setTargetAudience] = useState<AppNotification['targetAudience']>('All Members');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    sendPushNotification({
      title,
      message,
      type,
      targetAudience,
    });

    setSuccessNotice(`Notification broadcast successfully to ${targetAudience}.`);
    setTitle('');
    setMessage('');
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  const handlePreset = (presetType: 'sabbath' | 'sermon' | 'prayer') => {
    if (presetType === 'sabbath') {
      setTitle('Sabbath Live Worship Starting in 15 Minutes');
      setMessage('Join our holy convocation for Divine Service, scripture reading, and hymns of praise.');
      setType('Live Alert');
    } else if (presetType === 'sermon') {
      setTitle('New Sermon Archive: The Seal of God');
      setMessage('Pastor Emmanuel Mugabo expounds Revelation 14 and the Sabbath commandment. Watch now!');
      setType('Sermon Update');
    } else {
      setTitle('Mid-Week Intercessory Prayer Hour');
      setMessage('Gather in spirit as we intercede for the sick, family restoration, and global mission.');
      setType('Prayer Reminder');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-[0.22em] text-[#b4832e] uppercase mb-1">
            CONGREGATION DISPATCH
          </div>
          <h1 className="font-serif text-3xl text-slate-900 font-normal tracking-tight">
            Push Notifications &amp; Alerts
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Broadcast emergency alerts, Sabbath countdown reminders, and prayer circle convocations.
          </p>
        </div>
      </div>

      {successNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Preset Quick Actions */}
      <div className="bg-white border border-[#e8e4db] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-semibold text-slate-900">
            Quick Template Presets
          </h4>
          <p className="text-[11px] text-slate-400">
            One-click populate high-frequency liturgical broadcast announcements
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handlePreset('sabbath')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-amber-400 bg-white hover:bg-slate-50 text-xs text-slate-700 font-medium"
          >
            Sabbath In 15m
          </button>
          <button
            onClick={() => handlePreset('sermon')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-amber-400 bg-white hover:bg-slate-50 text-xs text-slate-700 font-medium"
          >
            New Sermon
          </button>
          <button
            onClick={() => handlePreset('prayer')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-amber-400 bg-white hover:bg-slate-50 text-xs text-slate-700 font-medium"
          >
            Midweek Prayer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-2 bg-white border border-[#e8e4db] rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-serif text-base font-medium text-slate-900 pb-3 border-b border-[#ece8df]">
            Compose Broadcast Message
          </h3>

          <form onSubmit={handleSend} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Notification Category
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#e8e4db] rounded-xl text-slate-900"
                >
                  <option value="Live Alert">Live Alert (Broadcast On-Air)</option>
                  <option value="Sermon Update">Sermon Update</option>
                  <option value="Prayer Reminder">Prayer Reminder</option>
                  <option value="Event Notice">Event Notice</option>
                  <option value="Emergency Announcement">Solemn / Pastoral Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Target Audience
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#e8e4db] rounded-xl text-slate-900"
                >
                  <option value="All Members">All Registered Members</option>
                  <option value="Online Viewers">Active Live Stream Viewers</option>
                  <option value="Prayer Warriors">Prayer Intercessors Group</option>
                  <option value="Youth Fellowship">Youth Fellowship</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Notification Headline *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sabbath Live Worship Starting in 15 Minutes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#e8e4db] rounded-xl text-slate-900 outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Notification Message Body *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Write concise message displayed on phone lockscreens and desktop popups..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#e8e4db] rounded-xl text-slate-900 outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#b4832e] hover:bg-[#9c6a1e] text-white font-medium text-xs shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Broadcast Now</span>
              </button>
            </div>
          </form>
        </div>

        {/* History Column */}
        <div className="bg-white border border-[#e8e4db] rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-serif text-base font-medium text-slate-900 pb-3 border-b border-[#ece8df]">
            Recent Dispatches ({notifications.length})
          </h3>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs rounded-xl border border-dashed border-[#e8e4db] bg-[#faf9f6]">
                No push notifications broadcast yet. Compose a broadcast using the form on the left.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#ece8df] space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-[#b4832e]">
                      {n.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {n.sentAt || 'Recently'}
                    </span>
                  </div>
                  <h5 className="font-semibold text-slate-900">{n.title}</h5>
                  <p className="text-slate-500 text-[11px] line-clamp-2">{n.message}</p>
                  <div className="pt-1 text-[10px] text-slate-400">
                    Target: {n.targetAudience}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
