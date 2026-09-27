import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { SUPABASE_BUCKETS } from '../../lib/supabase';
import { InlineUploadWidget } from '../common/InlineUploadWidget';
import { Meeting, MeetingRecording } from '../../types';
import {
  Video,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Users,
  Copy,
  Check,
  Play,
  Mic,
  MicOff,
  Radio,
  ExternalLink,
  Shield,
  UploadCloud,
  FileVideo,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const MeetingManager: React.FC = () => {
  const {
    meetings,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    meetingRecordings,
    addMeetingRecording,
    deleteMeetingRecording,
    currentUser,
  } = useAdmin();

  const [activeView, setActiveView] = useState<'scheduled' | 'recordings'>('scheduled');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Meeting['type']>('Bible study');
  const [hostName, setHostName] = useState(currentUser?.name || 'Pastor Emmanuel');
  const [scheduledAt, setScheduledAt] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  );
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [waitingRoomEnabled, setWaitingRoomEnabled] = useState(true);
  const [isRecorded, setIsRecorded] = useState(true);

  // Upload Recording Form state
  const [isUploadRecOpen, setIsUploadRecOpen] = useState(false);
  const [recTitle, setRecTitle] = useState('');
  const [recSpeaker, setRecSpeaker] = useState(currentUser?.name || 'Pastor Emmanuel');
  const [recUrl, setRecUrl] = useState('');
  const [recDuration, setRecDuration] = useState('45 min');

  const showNotice = (msg: string) => {
    setAdminNotice(msg);
    setTimeout(() => setAdminNotice(null), 3500);
  };

  const handleCopyLink = (meetingId: string, passcode?: string) => {
    const code = passcode || 'HOPE';
    const link = `${window.location.origin}/meet/${meetingId}?code=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedId(meetingId);
    showNotice('Meeting link copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    await addMeeting({
      title: title.trim(),
      type,
      hostName: hostName.trim(),
      scheduledAt,
      durationMinutes,
      status: 'scheduled',
      passcode: randomCode,
      waitingRoomEnabled,
      isRecorded,
    });

    setTitle('');
    setIsScheduleOpen(false);
    showNotice(`Meeting "${title}" scheduled.`);
  };

  const handleCreateRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recTitle.trim() || !recUrl.trim()) return;

    await addMeetingRecording({
      meetingId: 'custom-rec',
      title: recTitle.trim(),
      speaker: recSpeaker.trim(),
      videoUrl: recUrl.trim(),
      duration: recDuration.trim(),
      publishedToSermons: false,
    });

    setRecTitle('');
    setRecUrl('');
    setIsUploadRecOpen(false);
    showNotice(`Recording "${recTitle}" added.`);
  };

  return (
    <div className="space-y-6 max-w-7xl animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="text-[11px] font-bold tracking-[0.22em] text-[#b4832e] dark:text-amber-400 uppercase mb-1">
            COMMUNION &amp; CALLS
          </div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Meet Call Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Schedule virtual Bible studies, pastoral counseling sessions, church conferences, and recordings.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsScheduleOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#b4832e] hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {adminNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{adminNotice}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveView('scheduled')}
          className={`pb-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeView === 'scheduled'
              ? 'border-[#b4832e] text-[#b4832e] dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Scheduled Meetings ({meetings.length})</span>
        </button>

        <button
          onClick={() => setActiveView('recordings')}
          className={`pb-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeView === 'recordings'
              ? 'border-[#b4832e] text-[#b4832e] dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileVideo className="w-4 h-4" />
          <span>Call Recordings ({meetingRecordings.length})</span>
        </button>
      </div>

      {/* SCHEDULED MEETINGS VIEW */}
      {activeView === 'scheduled' && (
        <div className="space-y-4">
          {meetings.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <Video className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                No meetings have been scheduled yet.
              </div>
              <button
                onClick={() => setIsScheduleOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#b4832e] hover:bg-amber-700 text-white text-xs font-semibold"
              >
                Schedule First Meeting
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1 ${
                          meeting.status === 'live'
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {meeting.status === 'live' ? 'LIVE NOW' : meeting.type.replace('_', ' ')}
                      </span>
                      <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                        {meeting.title}
                      </h3>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Cancel meeting "${meeting.title}"?`)) {
                          deleteMeeting(meeting.id);
                          showNotice('Meeting cancelled.');
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Delete / Cancel Meeting"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {new Date(meeting.scheduledAt || meeting.date || meeting.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        ({meeting.durationMinutes} min)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Host: {meeting.hostName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Passcode: <code className="font-mono font-bold text-[#b4832e]">{meeting.passcode}</code>
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => handleCopyLink(meeting.id, meeting.passcode)}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#b4832e]"
                    >
                      {copiedId === meeting.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Invitation</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() =>
                        updateMeeting(meeting.id, {
                          status: meeting.status === 'live' ? 'ended' : 'live',
                        })
                      }
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        meeting.status === 'live'
                          ? 'bg-rose-600 text-white hover:bg-rose-700'
                          : 'bg-[#b4832e] text-white hover:bg-amber-700'
                      }`}
                    >
                      {meeting.status === 'live' ? 'End Call' : 'Start Call'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CALL RECORDINGS VIEW */}
      {activeView === 'recordings' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsUploadRecOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Record / Attach Video</span>
            </button>
          </div>

          {meetingRecordings.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <FileVideo className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                No meeting recordings stored yet.
              </div>
              <p className="text-xs text-slate-400">
                Recordings from live Bible studies and conferences will be archived here and in Supabase Storage.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meetingRecordings.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5"
                >
                  <div className="aspect-video rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative overflow-hidden group">
                    <Play className="w-8 h-8 text-[#b4832e] group-hover:scale-110 transition-transform" />
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] bg-black/70 text-white font-mono">
                      {rec.duration}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {rec.title}
                      </h4>
                      <p className="text-xs text-slate-500">Speaker: {rec.speaker}</p>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Delete recording "${rec.title}"?`)) {
                          deleteMeetingRecording(rec.id);
                          showNotice('Recording deleted.');
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono">
                    Recorded: {new Date(rec.recordedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Schedule Meeting */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Schedule Meet Call</h3>

            <form onSubmit={handleCreateMeeting} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Midweek Prayer & Bible Study"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Meeting Purpose / Category
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="Bible study">Virtual Bible Study</option>
                  <option value="pastoral counseling">Pastoral Counseling (Private)</option>
                  <option value="church conference">Church Board / Conference</option>
                  <option value="group meeting">Ministry Group Meeting</option>
                  <option value="private call">Private Fellowship Call</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Host Name
                </label>
                <input
                  type="text"
                  required
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Scheduled Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={15}
                    step={15}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={waitingRoomEnabled}
                    onChange={(e) => setWaitingRoomEnabled(e.target.checked)}
                    className="rounded text-[#b4832e]"
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Enable Waiting Room (Host admits participants)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecorded}
                    onChange={(e) => setIsRecorded(e.target.checked)}
                    className="rounded text-[#b4832e]"
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Auto-record session to Supabase Storage
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#b4832e] hover:bg-amber-700 text-white font-semibold"
                >
                  Schedule Call
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload / Link Recording */}
      {isUploadRecOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Call Recording</h3>

            <form onSubmit={handleCreateRecording} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Recording Title *
                </label>
                <input
                  type="text"
                  required
                  value={recTitle}
                  onChange={(e) => setRecTitle(e.target.value)}
                  placeholder="e.g., Revelation Prophecy Study #4"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Speaker
                </label>
                <input
                  type="text"
                  required
                  value={recSpeaker}
                  onChange={(e) => setRecSpeaker(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Upload Recording File or Enter Video URL (`meeting-recordings` Bucket) *
                </label>
                <div className="mb-2">
                  <InlineUploadWidget
                    bucket={SUPABASE_BUCKETS.MEETING_RECORDINGS}
                    parentTable="meeting_recordings"
                    parentId="custom-rec"
                    currentCoverUrl={recUrl}
                    onCoverChange={(url) => setRecUrl(url)}
                  />
                </div>
                <input
                  type="url"
                  required
                  value={recUrl}
                  onChange={(e) => setRecUrl(e.target.value)}
                  placeholder="https://... or uploaded file URL above"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Duration (e.g., 52 min)
                </label>
                <input
                  type="text"
                  value={recDuration}
                  onChange={(e) => setRecDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsUploadRecOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#b4832e] hover:bg-amber-700 text-white font-semibold"
                >
                  Save Recording
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
