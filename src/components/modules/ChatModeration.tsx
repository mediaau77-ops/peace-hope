import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { SUPABASE_BUCKETS } from '../../lib/supabase';
import { InlineUploadWidget } from '../common/InlineUploadWidget';
import {
  ChatRoom,
  ChatMessage,
  ChatReport,
  ChatRoomMember,
} from '../../types';
import {
  MessageSquare,
  Users,
  ShieldAlert,
  Settings,
  Plus,
  Trash2,
  Pin,
  Archive,
  RotateCcw,
  CheckCircle2,
  Lock,
  Download,
  Search,
  Filter,
  VolumeX,
  UserX,
  Award,
  Clock,
  Radio,
  FileText,
  Image,
  Mic,
  Activity,
  Send,
  Sliders,
  AlertTriangle,
  FolderLock,
  Check,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

type ActiveChatSubTab = 'overview' | 'conversations' | 'groups' | 'moderation' | 'users' | 'settings';

export const ChatModeration: React.FC = () => {
  const {
    chatRooms,
    addChatRoom,
    updateChatRoom,
    deleteChatRoom,
    archiveChatRoom,
    chatReports,
    reviewChatReport,
    deleteChatReport,
    chatMessages,
    deleteChatMessage,
    pinChatMessage,
    sendChatMessage,
    users,
    updateUserRole,
    updateUserStatus,
    chatSettings,
    updateChatSettings,
    currentUser,
    isSupabaseActive,
  } = useAdmin();

  const [activeSubTab, setActiveSubTab] = useState<ActiveChatSubTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    chatRooms.length > 0 ? chatRooms[0].id : null
  );
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  // Modal / Form state for creating a new room/group
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [newRoomType, setNewRoomType] = useState<ChatRoom['type']>('group');
  const [newRoomMinistry, setNewRoomMinistry] = useState('Youth Ministry');
  const [newRoomIsE2EE, setNewRoomIsE2EE] = useState(false);
  const [newRoomCoverUrl, setNewRoomCoverUrl] = useState('');

  // Message input for active room
  const [inputMessage, setInputMessage] = useState('');
  const [isPastorNote, setIsPastorNote] = useState(false);

  // Selected messages for bulk moderation
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);

  const showNotice = (msg: string) => {
    setAdminNotice(msg);
    setTimeout(() => setAdminNotice(null), 4000);
  };

  const selectedRoom = chatRooms.find((r) => r.id === selectedRoomId);

  // Calculate live statistics
  const activeMembersCount = users.filter((u) => u.status === 'Active').length;
  const messagesTodayCount = chatMessages.length;
  const groupsCount = chatRooms.filter((r) => r.type === 'group' || r.type === 'ministry').length;
  const pendingReportsCount = chatReports.filter((r) => r.status === 'pending').length;

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    await addChatRoom({
      name: newRoomName.trim(),
      description: newRoomDescription.trim(),
      type: newRoomType,
      ministryGroup: newRoomType === 'ministry' ? newRoomMinistry : undefined,
      status: 'active',
      isE2EE: newRoomIsE2EE,
      welcomeMessage: `Welcome to ${newRoomName.trim()}! Please adhere to Adventist fellowship principles.`,
    });

    setNewRoomName('');
    setNewRoomDescription('');
    setIsCreateRoomOpen(false);
    showNotice(`Chat conversation "${newRoomName}" created successfully.`);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    await sendChatMessage(
      inputMessage.trim(),
      currentUser?.name || 'Administrator',
      isPastorNote
    );
    setInputMessage('');
    showNotice('Broadcast message posted.');
  };

  const handleBulkDelete = async () => {
    if (selectedMessageIds.length === 0) return;
    if (confirm(`Delete ${selectedMessageIds.length} selected message(s)?`)) {
      for (const id of selectedMessageIds) {
        await deleteChatMessage(id);
      }
      setSelectedMessageIds([]);
      showNotice('Selected messages deleted.');
    }
  };

  const handleExportChatLogs = () => {
    const logs = chatMessages.map((m) => ({
      id: m.id,
      sender: m.senderName,
      role: m.senderRole,
      text: m.text,
      time: m.timestamp,
      pinned: m.isPinned,
    }));
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `peace-hope-chat-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice('Chat export downloaded.');
  };

  return (
    <div className="space-y-6 max-w-7xl animate-fade-in">
      {/* Header with Sub-tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="text-[11px] font-bold tracking-[0.22em] text-[#b4832e] dark:text-amber-400 uppercase mb-1">
            MEMBER FELLOWSHIP &amp; CHAT MANAGEMENT
          </div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Admin Chat Room CMS
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage church conversations, ministry groups, E2EE verification, auto-moderation, and live chat telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCreateRoomOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#b4832e] hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat Room / Group</span>
          </button>
        </div>
      </div>

      {adminNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{adminNotice}</span>
        </div>
      )}

      {/* Navigation Sub-tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: '1. Chat Overview', icon: Activity },
          { id: 'conversations', label: '2. Conversations', icon: MessageSquare },
          { id: 'groups', label: '3. Ministry Groups', icon: Users },
          {
            id: 'moderation',
            label: '4. Moderation & Reports',
            icon: ShieldAlert,
            badge: pendingReportsCount > 0 ? pendingReportsCount : undefined,
          },
          { id: 'users', label: '5. Permissions & Badges', icon: Award },
          { id: 'settings', label: '6. System Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as ActiveChatSubTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-[#b4832e] text-[#b4832e] dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: CHAT OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Live Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Active Members
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {activeMembersCount.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online &amp; Connected
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Messages Today
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {messagesTodayCount.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Across all ministries &amp; live chat
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Groups &amp; Ministries
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {groupsCount}
              </div>
              <div className="text-[11px] text-[#b4832e] dark:text-amber-400 mt-2 font-medium">
                Choir, Youth, Pathfinders, etc.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Reported Messages
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {pendingReportsCount}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                {pendingReportsCount > 0 ? 'Requires admin action' : 'Zero flags currently'}
              </div>
            </div>
          </div>

          {/* Telemetry and Channel Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 lg:col-span-2 shadow-xs space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                Live Network &amp; Channel Status
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Realtime Sync
                  </span>
                  <span className="text-slate-800 dark:text-slate-100 font-mono font-medium">
                    Supabase Channels (Active)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Voice Notes
                  </span>
                  <span className="text-slate-800 dark:text-slate-100 font-mono font-medium">
                    AAC 64kbps / Audio Bucket
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Shared Media
                  </span>
                  <span className="text-slate-800 dark:text-slate-100 font-mono font-medium">
                    CDN Cached / 50MB Cap
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    E2EE Encryption
                  </span>
                  <span className="text-sky-600 dark:text-sky-400 font-mono font-medium flex items-center gap-1">
                    <Lock className="w-3 h-3" /> ECDH P-256
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveSubTab('conversations')}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium"
                >
                  View All Conversations &rarr;
                </button>
                <button
                  onClick={() => setActiveSubTab('groups')}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium"
                >
                  Manage Ministry Groups &rarr;
                </button>
                <button
                  onClick={handleExportChatLogs}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export All Chat Logs
                </button>
              </div>
            </div>

            {/* Reported Messages Summary Widget */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="font-semibold text-slate-900 dark:text-white text-base flex items-center justify-between">
                <span>Recent Reports</span>
                <span className="text-xs font-normal text-[#b4832e]">
                  {pendingReportsCount} pending
                </span>
              </h3>
              {chatReports.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No reported content. Fellowship chat is peaceful.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {chatReports.slice(0, 3).map((r) => (
                    <div
                      key={r.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-rose-600">{r.reason}</span>
                        <span className="text-[10px] text-slate-400">{r.status}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] truncate">
                        "{r.messageSnippet}"
                      </p>
                      <div className="text-[10px] text-slate-400">
                        Reported: {r.reportedUserName} by {r.reporterName}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CONVERSATION MANAGEMENT */}
      {activeSubTab === 'conversations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversation List */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                All Conversations ({chatRooms.length})
              </h3>
              <button
                onClick={() => setIsCreateRoomOpen(true)}
                className="text-xs font-semibold text-[#b4832e] hover:underline"
              >
                + Create
              </button>
            </div>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
              {chatRooms.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No conversation created yet. Click "+ Create" above.
                </div>
              ) : (
                chatRooms.map((room) => {
                  const isSelected = room.id === selectedRoomId;
                  return (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`w-full text-left p-3 rounded-xl text-xs transition-all border ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-[#b4832e] text-slate-900 dark:text-white font-medium'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold truncate">{room.name}</span>
                        {room.isE2EE && (
                          <span
                            title="End-to-End Encrypted"
                            className="px-1.5 py-0.5 rounded text-[9px] bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 flex items-center gap-0.5"
                          >
                            <Lock className="w-2.5 h-2.5" /> E2EE
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                        <span className="capitalize">{room.type}</span>
                        <span>{room.status}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Conversation Detail & Actions */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 lg:col-span-2 shadow-xs space-y-4">
            {selectedRoom ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {selectedRoom.name}
                      {selectedRoom.isE2EE && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-mono">
                          Private E2EE
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedRoom.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => archiveChatRoom(selectedRoom.id)}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-xs"
                      title={selectedRoom.status === 'archived' ? 'Restore Chat' : 'Archive Chat'}
                    >
                      {selectedRoom.status === 'archived' ? (
                        <RotateCcw className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Archive className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete conversation "${selectedRoom.name}"?`)) {
                          deleteChatRoom(selectedRoom.id);
                          setSelectedRoomId(null);
                          showNotice('Conversation deleted.');
                        }
                      }}
                      className="p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs"
                      title="Delete Conversation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Live Chat Stream inside Conversation */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Recent Messages ({chatMessages.length})</span>
                    <span className="text-[11px] text-slate-400">Live Supabase Sync</span>
                  </div>

                  <div className="h-64 overflow-y-auto space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    {chatMessages.length === 0 ? (
                      <div className="py-16 text-center text-slate-400 text-xs">
                        No messages in this chat room yet. Send a broadcast note below.
                      </div>
                    ) : (
                      chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-2.5 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                            msg.isPastorNote
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 text-amber-900 dark:text-amber-200'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{msg.senderName}</span>
                              <span className="text-[10px] text-slate-400">({msg.senderRole})</span>
                              {msg.isPinned && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-200 text-amber-800 font-bold">
                                  PINNED
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-mono">
                                {msg.timestamp}
                              </span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300">{msg.text}</p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => pinChatMessage(msg.id)}
                              title="Pin / Unpin"
                              className="p-1 text-slate-400 hover:text-amber-600"
                            >
                              <Pin className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteChatMessage(msg.id)}
                              title="Delete Message"
                              className="p-1 text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Broadcast Form */}
                  <form onSubmit={handleSendMessage} className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Broadcast message as Admin..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-[#b4832e]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-[#b4832e] text-white text-xs font-semibold hover:bg-amber-700 flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </button>
                    </div>

                    <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPastorNote}
                        onChange={(e) => setIsPastorNote(e.target.checked)}
                        className="rounded text-[#b4832e] focus:ring-[#b4832e]"
                      />
                      <span>Mark as Official Pastoral / Ministry Announcement</span>
                    </label>
                  </form>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs">
                Select a conversation on the left to view details and live messages.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: GROUP MANAGEMENT */}
      {activeSubTab === 'groups' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Church Ministry Groups
              </h3>
              <p className="text-xs text-slate-500">
                Manage group admins, permissions, media upload limits, and member rosters.
              </p>
            </div>
            <button
              onClick={() => {
                setNewRoomType('ministry');
                setIsCreateRoomOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#b4832e] text-white text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Create Ministry Group</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: 'Youth Ministry',
                desc: 'AY society fellowship, activities, and Sabbath discussions',
                members: 142,
                admin: 'Pastor Alex & Youth Leaders',
              },
              {
                name: 'Choir & Praise Team',
                desc: 'Music rehearsal schedules, hymns, and audio rehearsals',
                members: 68,
                admin: 'Sister Grace',
              },
              {
                name: 'Pathfinders & Adventurers',
                desc: 'Club honors, camping notices, and parent communications',
                members: 95,
                admin: 'Director Eric',
              },
              {
                name: 'Prayer Team & Intercessors',
                desc: 'Continuous intercession for church sick and mission work',
                members: 120,
                admin: 'Elder Moses',
              },
              {
                name: 'Sabbath School Classes',
                desc: 'Weekly lesson study quarterly insights and discussion',
                members: 310,
                admin: 'SS Superintendent',
              },
              {
                name: 'Family Ministry',
                desc: 'Couples, singles, parenting seminars, and home devotionals',
                members: 180,
                admin: 'Family Life Dept',
              },
            ].map((group, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {group.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-[#b4832e] border border-amber-200">
                    {group.members} Members
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{group.desc}</p>
                <div className="text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Lead:</span>{' '}
                  {group.admin}
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-emerald-600 font-medium">Auto-moderated</span>
                  <button
                    onClick={() => {
                      setSelectedRoomId(chatRooms[0]?.id || null);
                      setActiveSubTab('conversations');
                    }}
                    className="text-[#b4832e] hover:underline font-semibold"
                  >
                    Manage Group &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: MESSAGE MODERATION & REPORTS */}
      {activeSubTab === 'moderation' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Reported Messages &amp; Bulk Moderation
              </h3>
              <p className="text-xs text-slate-500">
                Review flagged messages, enforce Adventist community guidelines, and purge spam.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {selectedMessageIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedMessageIds.length})</span>
                </button>
              )}
              <button
                onClick={handleExportChatLogs}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Chat Logs</span>
              </button>
            </div>
          </div>

          {/* Reports Table */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Flagged Reports Queue
            </h4>

            {chatReports.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No active reported messages found. All church conversations are clean.
              </div>
            ) : (
              <div className="space-y-2">
                {chatReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          {report.reason}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          Reported User: {report.reportedUserName}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          By: {report.reporterName}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-200 italic truncate">
                        "{report.messageSnippet}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => reviewChatReport(report.id, 'resolved')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => reviewChatReport(report.id, 'dismissed')}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-[11px]"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => deleteChatReport(report.id)}
                        className="p-1 text-rose-500 hover:text-rose-700"
                        title="Delete Report"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: USER MANAGEMENT & PERMISSIONS */}
      {activeSubTab === 'users' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Chat Roles &amp; Verification Badges
            </h3>
            <p className="text-xs text-slate-500">
              Assign roles (Super Admin, Group Admin, Moderator, Member) and badges (Pastor, Elder, Deacon).
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Member</th>
                    <th className="p-3">Current Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3 font-medium text-slate-900 dark:text-white">
                        <div>{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{u.email}</div>
                      </td>
                      <td className="p-3">
                        <select
                          value={u.role}
                          onChange={(e) => updateUserRole(u.id, e.target.value as any)}
                          className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#b4832e]"
                        >
                          <option value="Super Admin">Super Admin</option>
                          <option value="Admin">Admin</option>
                          <option value="Pastor">Pastor</option>
                          <option value="Elder">Elder</option>
                          <option value="Moderator">Moderator</option>
                          <option value="Member">Member</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            u.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateUserStatus(u.id, u.status === 'Active' ? 'Suspended' : 'Active')
                            }
                            className={`px-2 py-1 rounded text-[10px] font-medium border ${
                              u.status === 'Active'
                                ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {u.status === 'Active' ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: SYSTEM SETTINGS */}
      {activeSubTab === 'settings' && (
        <div className="space-y-6 max-w-3xl">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Chat System Configuration
            </h3>
            <p className="text-xs text-slate-500">
              Message retention, media restrictions, slow mode, and automated filters stored in Supabase.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Enable Chat System
                </span>
                <span className="text-slate-400 text-[11px]">
                  Toggles live chat access across website and mobile apps
                </span>
              </div>
              <input
                type="checkbox"
                checked={chatSettings.enableChat}
                onChange={(e) => updateChatSettings({ enableChat: e.target.checked })}
                className="w-4 h-4 text-[#b4832e] rounded"
              />
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Message Retention Policy
                </span>
                <span className="text-slate-400 text-[11px]">
                  Automatically purge chat logs older than specified days
                </span>
              </div>
              <select
                value={chatSettings.messageRetentionDays}
                onChange={(e) =>
                  updateChatSettings({ messageRetentionDays: parseInt(e.target.value, 10) })
                }
                className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <option value={90}>90 Days</option>
                <option value={180}>180 Days</option>
                <option value={365}>1 Year (365 Days)</option>
                <option value={730}>2 Years</option>
              </select>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Slow Mode Delay
                </span>
                <span className="text-slate-400 text-[11px]">
                  Seconds members must wait between sending messages
                </span>
              </div>
              <select
                value={chatSettings.slowModeDelaySeconds}
                onChange={(e) =>
                  updateChatSettings({ slowModeDelaySeconds: parseInt(e.target.value, 10) })
                }
                className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <option value={0}>Off (Instant)</option>
                <option value={5}>5 Seconds</option>
                <option value={15}>15 Seconds</option>
                <option value={30}>30 Seconds</option>
                <option value={60}>1 Minute</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Emoji Reactions &amp; Typing Indicators
                </span>
                <span className="text-slate-400 text-[11px]">
                  Allow live reactions (Amen, Praying Hands, Heart) on messages
                </span>
              </div>
              <input
                type="checkbox"
                checked={chatSettings.enableEmojiReactions}
                onChange={(e) => updateChatSettings({ enableEmojiReactions: e.target.checked })}
                className="w-4 h-4 text-[#b4832e] rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Chat Room / Ministry Group */}
      {isCreateRoomOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Create New Chat Conversation
            </h3>

            <form onSubmit={handleCreateRoom} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Name / Title *
                </label>
                <input
                  type="text"
                  required
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g., Youth Sabbath Discussion"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Conversation Type
                </label>
                <select
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="group">Public / Group Chat</option>
                  <option value="ministry">Church Ministry Group</option>
                  <option value="private">Private 1:1 Chat (E2EE)</option>
                  <option value="broadcast">Announcement Broadcast Channel</option>
                </select>
              </div>

              {newRoomType === 'ministry' && (
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Ministry Department
                  </label>
                  <select
                    value={newRoomMinistry}
                    onChange={(e) => setNewRoomMinistry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Youth Ministry">Youth Ministry</option>
                    <option value="Choir">Choir</option>
                    <option value="Pathfinders">Pathfinders</option>
                    <option value="Prayer Team">Prayer Team</option>
                    <option value="Sabbath School">Sabbath School</option>
                    <option value="Family Ministry">Family Ministry</option>
                  </select>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Description / Purpose
                </label>
                <textarea
                  rows={2}
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  placeholder="Describe the fellowship guidelines..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Group Avatar / Banner Media (`chat-attachments` Bucket)
                </label>
                <InlineUploadWidget
                  bucket={SUPABASE_BUCKETS.CHAT_ATTACHMENTS}
                  parentTable="chat_rooms"
                  parentId="new-chat-room"
                  currentCoverUrl={newRoomCoverUrl}
                  onCoverChange={(url) => setNewRoomCoverUrl(url)}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newRoomIsE2EE}
                  onChange={(e) => setNewRoomIsE2EE(e.target.checked)}
                  className="rounded text-[#b4832e]"
                />
                <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-sky-600" />
                  Enable End-to-End Encryption (Web Crypto ECDH)
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateRoomOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#b4832e] hover:bg-amber-700 text-white font-semibold"
                >
                  Create Conversation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
