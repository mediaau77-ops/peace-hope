import React, { useState, useEffect } from 'react';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { ThemeProvider } from './context/ThemeContext';
import { AdminLoginPage } from './components/AdminLoginPage';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { PublicApp } from './components/public/PublicApp';

// Admin Modules
import { OverviewModule } from './components/modules/OverviewModule';
import { HomepageManager } from './components/modules/HomepageManager';
import { BibleManager } from './components/modules/BibleManager';
import { TeachingManager } from './components/modules/TeachingManager';
import { SermonManager } from './components/modules/SermonManager';
import { LiveWorshipControl } from './components/modules/LiveWorshipControl';
import { PrayerCenter } from './components/modules/PrayerCenter';
import { TestimoniesManager } from './components/modules/TestimoniesManager';
import { DevotionalManager } from './components/modules/DevotionalManager';
import { EventsManager } from './components/modules/EventsManager';
import { AnnouncementManager } from './components/modules/AnnouncementManager';
import { ChatModeration } from './components/modules/ChatModeration';
import { MeetingManager } from './components/modules/MeetingManager';
import { MediaManager } from './components/modules/MediaManager';
import { UserManager } from './components/modules/UserManager';
import { NotificationCenter } from './components/modules/NotificationCenter';
import { AnalyticsReports } from './components/modules/AnalyticsReports';
import { AuditLogManager } from './components/modules/AuditLogManager';
import { SettingsManager } from './components/modules/SettingsManager';

interface AppContentProps {
  onViewPublic: () => void;
}

const AdminWorkspace: React.FC<AppContentProps> = ({ onViewPublic }) => {
  const { isAuthenticated, viewMode, activeTab, theme } = useAdmin();

  // Middleware: Protect /dashboard/* & /admin routes, silently redirect unauthenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        if (!isAuthenticated) {
          onViewPublic();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, onViewPublic]);

  // If unauthenticated, render the secure AdminLoginPage
  if (!isAuthenticated || viewMode === 'login') {
    return (
      <AdminLoginPage
        onSuccess={() => {}}
        onCancel={onViewPublic}
      />
    );
  }

  // Render module based on activeTab
  const renderActiveModule = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewModule />;
      case 'homepage':
        return <HomepageManager />;
      case 'bible':
        return <BibleManager />;
      case 'teachings':
        return <TeachingManager />;
      case 'sermons':
        return <SermonManager />;
      case 'live':
        return <LiveWorshipControl />;
      case 'prayers':
        return <PrayerCenter />;
      case 'testimonies':
        return <TestimoniesManager />;
      case 'devotionals':
        return <DevotionalManager />;
      case 'events':
        return <EventsManager />;
      case 'announcements':
        return <AnnouncementManager />;
      case 'chat':
        return <ChatModeration />;
      case 'meetings':
        return <MeetingManager />;
      case 'media':
        return <MediaManager />;
      case 'users':
        return <UserManager />;
      case 'notifications':
        return <NotificationCenter />;
      case 'analytics':
        return <AnalyticsReports />;
      case 'audit':
        return <AuditLogManager />;
      case 'settings':
        return <SettingsManager />;
      default:
        return <OverviewModule />;
    }
  };

  return (
    <div
      className={`flex flex-col h-screen w-screen overflow-hidden ${
        theme === 'dark' ? 'dark bg-[#0D182E] text-slate-100' : 'bg-[#FAF7F2] text-slate-800'
      } antialiased font-sans select-none transition-colors`}
    >
      {/* Top Navigation Bar with View Public Site link */}
      <AdminHeader onViewPublic={onViewPublic} />

      {/* Main Workspace below Top Header: Sidebar on Left, Content on Right */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Admin Sidebar */}
        <AdminSidebar />

        {/* Scrollable Module Workspace */}
        <main
          className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 ${
            theme === 'dark' ? 'bg-[#0A1224]' : 'bg-[#FAF7F2]'
          } custom-scrollbar`}
        >
          <div className="max-w-7xl mx-auto">{renderActiveModule()}</div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  const checkIsAdminRoute = () => {
    if (typeof window === 'undefined') return false;
    const hash = window.location.hash.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    return (
      hash === '#admin' ||
      hash.startsWith('#dashboard') ||
      path.startsWith('/dashboard')
    );
  };

  const [isAdminMode, setIsAdminMode] = useState<boolean>(checkIsAdminRoute);

  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminMode(checkIsAdminRoute());
    };
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  const handleOpenAdmin = () => {
    window.location.hash = '#admin';
    setIsAdminMode(true);
  };

  const handleViewPublic = () => {
    window.location.hash = '';
    setIsAdminMode(false);
  };

  return (
    <ThemeProvider>
      {isAdminMode ? (
        <AdminProvider>
          <AdminWorkspace onViewPublic={handleViewPublic} />
        </AdminProvider>
      ) : (
        <PublicApp onOpenAdmin={handleOpenAdmin} />
      )}
    </ThemeProvider>
  );
}
