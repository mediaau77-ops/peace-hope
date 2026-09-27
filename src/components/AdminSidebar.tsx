import React from 'react';
import { useAdmin, AdminTab } from '../context/AdminContext';
import {
  LayoutGrid,
  Home,
  BookOpen,
  BookMarked,
  Library,
  HeartHandshake,
  MessageSquare,
  Video,
  Sparkles,
  Radio,
  SunMedium,
  CalendarDays,
  Users,
  Megaphone,
  ShieldAlert,
  Settings,
  X,
  Shield,
} from 'lucide-react';

interface SidebarItem {
  id: AdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

export const AdminSidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    prayerRequests,
    testimonies,
    streamState,
    chatReports,
    meetings,
    isMobileNavOpen,
    setIsMobileNavOpen,
  } = useAdmin();

  const pendingPrayers = prayerRequests.filter((p) => p.status === 'Pending').length;
  const pendingTestimonies = testimonies.filter((t) => t.status === 'Pending').length;
  const pendingReports = chatReports.filter((r) => r.status === 'pending').length;
  const activeMeetings = meetings.filter((m) => m.status === 'live').length;

  // Exact 16 modules specified in Section 1 (Per-Module Upload Model)
  const primaryMenuItems: SidebarItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'homepage', label: 'Homepage', icon: Home },
    { id: 'teachings', label: 'Teachings', icon: BookMarked },
    { id: 'sermons', label: 'Sermons', icon: Library },
    { id: 'devotionals', label: 'Devotionals', icon: SunMedium },
    {
      id: 'prayers',
      label: 'Prayer Requests',
      icon: HeartHandshake,
      badge: pendingPrayers > 0 ? pendingPrayers : undefined,
    },
    {
      id: 'testimonies',
      label: 'Testimonies',
      icon: Sparkles,
      badge: pendingTestimonies > 0 ? pendingTestimonies : undefined,
    },
    { id: 'events', label: 'Events', icon: CalendarDays },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    {
      id: 'live',
      label: 'Livestreams',
      icon: Radio,
      badge: streamState.isLive ? 'LIVE' : undefined,
    },
    { id: 'bible', label: 'Holy Bible', icon: BookOpen },
    {
      id: 'chat',
      label: 'Chat Management',
      icon: MessageSquare,
      badge: pendingReports > 0 ? `${pendingReports}` : undefined,
    },
    {
      id: 'meetings',
      label: 'Meet Call Management',
      icon: Video,
      badge: activeMeetings > 0 ? 'LIVE' : undefined,
    },
  ];

  const systemMenuItems: SidebarItem[] = [
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'audit', label: 'Audit Log', icon: ShieldAlert },
  ];

  const handleSelectTab = (tabId: AdminTab) => {
    setActiveTab(tabId);
    if (setIsMobileNavOpen) {
      setIsMobileNavOpen(false);
    }
  };

  const renderNavList = (items: SidebarItem[]) => (
    <nav className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => handleSelectTab(item.id)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm min-h-[44px] transition-all text-left ${
              isActive
                ? 'bg-[#fef9ee] dark:bg-amber-950/40 text-[#b4832e] dark:text-amber-400 border border-[#f5e6c8] dark:border-amber-800/60 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60 border border-transparent font-normal'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-[#b4832e] dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </div>

            {item.badge !== undefined && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                  item.badge === 'LIVE'
                    ? 'bg-red-500 text-white animate-pulse'
                    : isActive
                    ? 'bg-[#b4832e] text-white'
                    : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileNavOpen && (
        <div
          onClick={() => setIsMobileNavOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container: Fixed drawer on mobile/tablet, Static column on desktop */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-64 shrink-0 h-full bg-white dark:bg-slate-900 border-r border-[#ece8df] dark:border-slate-800 flex flex-col select-none overflow-y-auto custom-scrollbar p-3.5 transition-transform duration-300 ease-in-out ${
          isMobileNavOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header with close button */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#ece8df] dark:border-slate-800 lg:hidden">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500 fill-amber-500/10" />
            <span className="font-serif text-base font-bold text-slate-900 dark:text-white">
              Peace &amp; Hope
            </span>
          </div>
          <button
            onClick={() => setIsMobileNavOpen(false)}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white"
            aria-label="Close Navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Content Modules Navigation */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400 dark:text-slate-500 px-3.5 mb-1.5">
            Content &amp; Community
          </div>
          {renderNavList(primaryMenuItems)}
        </div>

        {/* Divider */}
        <div className="my-3.5 border-t border-[#ece8df]/80 dark:border-slate-800" />

        {/* System & Administration Modules */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400 dark:text-slate-500 px-3.5 mb-1.5">
            System &amp; Governance
          </div>
          {renderNavList(systemMenuItems)}
        </div>

        {/* Footer info */}
        <div className="mt-auto pt-4 text-center text-[10px] text-slate-400 dark:text-slate-500 font-mono">
          Peace &amp; Hope Super Admin &bull; 2026
        </div>
      </aside>
    </>
  );
};

