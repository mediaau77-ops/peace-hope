import React, { useState, useEffect } from 'react';
import { I18nProvider } from '../../lib/i18n';
import { Header, HeaderFallback } from './shared/Header';
import { Footer } from './shared/Footer';
import { AnnouncementBar } from './shared/AnnouncementBar';
import { SectionErrorBoundary } from '../SectionErrorBoundary';
import { usePublicSettings } from '../../hooks/usePublicSettings';
import { AdminLoginPage } from '../AdminLoginPage';
import { AdminProvider } from '../../context/AdminContext';

// Public Pages
import { PublicHomePage } from './PublicHomePage';
import { TeachingsPage } from './pages/TeachingsPage';
import { TeachingDetailPage } from './pages/TeachingDetailPage';
import { SermonsPage } from './pages/SermonsPage';
import { SermonDetailPage } from './pages/SermonDetailPage';
import { DevotionalsPage } from './pages/DevotionalsPage';
import { DevotionalDetailPage } from './pages/DevotionalDetailPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { PrayerWallPage } from './pages/PrayerWallPage';
import { TestimoniesPage } from './pages/TestimoniesPage';
import { TestimonyDetailPage } from './pages/TestimonyDetailPage';
import { BibleReaderPage } from './pages/BibleReaderPage';
import { LivestreamPage } from './pages/LivestreamPage';
import { MeetLandingPage } from './pages/MeetLandingPage';
import { MeetingRoomPage } from './pages/MeetingRoomPage';
import { ChatRoomsPage } from './pages/ChatRoomsPage';
import { ChatRoomDetailPage } from './pages/ChatRoomDetailPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { AnnouncementDetailPage } from './pages/AnnouncementDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { GivingPage } from './pages/GivingPage';
import { AuthPages } from './pages/AuthPages';
import { ProfilePage } from './pages/ProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { GlobalSearchPage } from './pages/GlobalSearchPage';

interface PublicAppProps {
  onOpenAdmin: () => void;
}

export const PublicApp: React.FC<PublicAppProps> = ({ onOpenAdmin }) => {
  const { settings } = usePublicSettings();
  const [currentHash, setCurrentHash] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.hash.replace(/^#\/?/, '') || 'home';
    }
    return 'home';
  });

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '') || 'home';
      setCurrentHash(hash);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHash);
    window.addEventListener('popstate', handleHash);
    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('popstate', handleHash);
    };
  }, []);

  // Dynamic Document Title and SEO Metadata synchronization
  useEffect(() => {
    const [segment, sub] = currentHash.split('/');

    // Guard: Never expose admin title on public pages
    if (segment === 'admin-login' || (segment === 'auth' && sub === 'admin-login')) {
      document.title = 'Peace & Hope | Sanctuary Gateway';
      return;
    }

    const titles: Record<string, string> = {
      home: 'Peace & Hope | Seventh-day Adventist Church',
      teachings: 'Biblical Teachings & Discipleship | Peace & Hope',
      sermons: 'Sermons Archive & Word of Truth | Peace & Hope',
      devotionals: 'Daily Devotionals & Quiet Time | Peace & Hope',
      events: 'Upcoming Events & Fellowships | Peace & Hope',
      prayer: 'Prayer Wall & Intercession | Peace & Hope',
      testimonies: 'Stories of Hope & God’s Grace | Peace & Hope',
      bible: 'Scripture Reader & Holy Bible | Peace & Hope',
      livestream: 'Live Worship Broadcast | Peace & Hope',
      meet: 'Fellowship Video Rooms | Peace & Hope',
      chat: 'Community Fellowship Chat | Peace & Hope',
      announcements: 'Announcements & Bulletin | Peace & Hope',
      about: 'About Our Mission & Heritage | Peace & Hope',
      contact: 'Contact & Sanctuary Location | Peace & Hope',
      giving: 'Tithe & Ministry Giving | Peace & Hope',
      give: 'Tithe & Ministry Giving | Peace & Hope',
      tithe: 'Tithe & Ministry Giving | Peace & Hope',
      auth: 'Member Sign In | Peace & Hope',
      login: 'Member Sign In | Peace & Hope',
      register: 'Join Our Sanctuary | Peace & Hope',
      profile: 'Member Sanctuary Profile | Peace & Hope',
      notifications: 'Church Notifications | Peace & Hope',
      search: 'Search Archive & Scripture | Peace & Hope',
    };

    document.title = titles[segment] || 'Peace & Hope | Seventh-day Adventist Church';
  }, [currentHash]);

  const navigate = (route: string) => {
    window.location.hash = route ? `#${route}` : '#';
  };

  // Parse path and params
  const [routeSegment, ...params] = currentHash.split('/');
  const subParam = params.join('/');

  // Helper for Bible verse chips (e.g. "John 3:16" or "Genesis 1")
  const handleBibleRefNavigate = (ref: string) => {
    const match = ref.match(/^([1-3]?\s?[A-Za-z]+)\s*(\d+)?/);
    if (match) {
      const book = match[1].trim();
      const chapter = match[2] ? match[2].trim() : '1';
      navigate(`bible/${encodeURIComponent(book)}/${chapter}`);
    } else {
      navigate('bible');
    }
  };

  const isAdminLoginRoute =
    (routeSegment === 'auth' && subParam === 'admin-login') ||
    routeSegment === 'admin-login';

  const renderCurrentView = () => {
    switch (routeSegment) {
      // Hidden admin login route
      case 'admin-login':
        return (
          <AdminLoginPage
            onSuccess={() => onOpenAdmin()}
            onCancel={() => navigate('home')}
          />
        );

      case 'teachings':
        if (subParam) {
          return (
            <TeachingDetailPage
              slug={subParam}
              onBack={() => navigate('teachings')}
              onSelectTeaching={(slug) => navigate(`teachings/${slug}`)}
              onSelectBibleRef={handleBibleRefNavigate}
            />
          );
        }
        return <TeachingsPage onSelectTeaching={(slug) => navigate(`teachings/${slug}`)} />;

      case 'sermons':
        if (subParam) {
          return (
            <SermonDetailPage
              slug={subParam}
              onBack={() => navigate('sermons')}
              onSelectBibleRef={handleBibleRefNavigate}
            />
          );
        }
        return <SermonsPage onSelectSermon={(slug) => navigate(`sermons/${slug}`)} />;

      case 'devotionals':
      case 'devotional':
        if (subParam) {
          return (
            <DevotionalDetailPage
              slug={subParam}
              onBack={() => navigate('devotionals')}
              onSelectBibleRef={handleBibleRefNavigate}
            />
          );
        }
        return (
          <DevotionalsPage onSelectDevotional={(slug) => navigate(`devotionals/${slug}`)} />
        );

      case 'events':
        if (subParam) {
          return <EventDetailPage slug={subParam} onBack={() => navigate('events')} />;
        }
        return <EventsPage onSelectEvent={(slug) => navigate(`events/${slug}`)} />;

      case 'prayer':
      case 'prayer-wall':
        return <PrayerWallPage />;

      case 'testimonies':
        if (subParam) {
          return <TestimonyDetailPage slug={subParam} onBack={() => navigate('testimonies')} />;
        }
        return <TestimoniesPage onSelectTestimony={(slug) => navigate(`testimonies/${slug}`)} />;

      case 'bible':
        return (
          <BibleReaderPage
            initialBook={params[0] ? decodeURIComponent(params[0]) : 'Genesis'}
            initialChapter={params[1] ? Number(params[1]) : 1}
          />
        );

      // Consolidate duplicate Broadcast/Live worship: canonical is livestream with permanent redirect
      case 'broadcast':
      case 'live':
      case 'live-worship':
        if (typeof window !== 'undefined' && window.location.hash !== '#livestream') {
          window.location.hash = '#livestream';
        }
        return <LivestreamPage />;

      case 'livestream':
        return <LivestreamPage />;

      case 'meet':
        if (subParam) {
          return <MeetingRoomPage roomId={subParam} onLeave={() => navigate('meet')} />;
        }
        return <MeetLandingPage onJoinMeeting={(roomId) => navigate(`meet/${roomId}`)} />;

      case 'chat':
        if (subParam) {
          return <ChatRoomDetailPage roomId={subParam} onBack={() => navigate('chat')} />;
        }
        return <ChatRoomsPage onSelectRoom={(roomId) => navigate(`chat/${roomId}`)} />;

      case 'announcements':
      case 'bulletin':
        if (subParam) {
          return <AnnouncementDetailPage id={subParam} onBack={() => navigate('announcements')} />;
        }
        return (
          <AnnouncementsPage onSelectAnnouncement={(id) => navigate(`announcements/${id}`)} />
        );

      case 'about':
        return <AboutPage />;

      case 'contact':
        return <ContactPage />;

      case 'giving':
      case 'give':
      case 'tithe':
        return <GivingPage />;

      case 'auth':
        if (subParam === 'admin-login') {
          return (
            <AdminLoginPage
              onSuccess={() => onOpenAdmin()}
              onCancel={() => navigate('home')}
            />
          );
        }
        return (
          <AuthPages
            initialMode="login"
            onSuccess={() => navigate('profile')}
            onNavigateMode={(m) => navigate(m)}
          />
        );

      case 'login':
      case 'register':
        return (
          <AuthPages
            initialMode={routeSegment === 'register' ? 'register' : 'login'}
            onSuccess={() => navigate('profile')}
            onNavigateMode={(m) => navigate(m)}
          />
        );

      case 'profile':
        return (
          <ProfilePage
            onSignOut={() => navigate('home')}
            onNavigateAuth={() => navigate('auth')}
          />
        );

      case 'notifications':
        return <NotificationsPage />;

      case 'search':
        return (
          <GlobalSearchPage
            initialQuery={subParam ? decodeURIComponent(subParam) : ''}
            onNavigateItem={(type, id) => {
              if (type === 'teaching') navigate(`teachings/${id}`);
              else if (type === 'sermon') navigate(`sermons/${id}`);
              else if (type === 'devotional') navigate(`devotionals/${id}`);
              else if (type === 'event') navigate(`events/${id}`);
              else if (type === 'bible') navigate('bible');
            }}
          />
        );

      case 'home':
      default:
        return (
          <PublicHomePage
            hideHeaderFooter={true}
            onSelectTeaching={(slug) => navigate(`teachings/${slug}`)}
            onSelectSermon={(slug) => navigate(`sermons/${slug}`)}
            onSelectDevotional={(slug) => navigate(`devotionals/${slug}`)}
            onSelectEvent={(slug) => navigate(`events/${slug}`)}
            onSelectTestimony={(slug) => navigate(`testimonies/${slug}`)}
            onJoinMeet={(roomId) => navigate(`meet/${roomId}`)}
            onOpenPrayerWall={() => navigate('prayer')}
          />
        );
    }
  };

  const isMeetingRoom = routeSegment === 'meet' && Boolean(subParam);

  if (isAdminLoginRoute) {
    return (
      <AdminProvider>
        <I18nProvider>
          <main className="min-h-screen">
            <SectionErrorBoundary sectionName="AdminLoginContent">
              {renderCurrentView()}
            </SectionErrorBoundary>
          </main>
        </I18nProvider>
      </AdminProvider>
    );
  }

  return (
    <I18nProvider>
      <div className="min-h-screen flex flex-col bg-[#FAF7F2] dark:bg-[#0D182E] text-slate-800 dark:text-slate-100 font-sans antialiased selection:bg-[#C5A059] selection:text-white transition-colors duration-300">
        {!isMeetingRoom && <AnnouncementBar />}

        {!isMeetingRoom && (
          <SectionErrorBoundary sectionName="Header" fallback={<HeaderFallback />}>
            <Header
              settings={settings}
              currentHash={currentHash}
              onNavigate={(r) => navigate(r)}
            />
          </SectionErrorBoundary>
        )}

        <main className="flex-1">
          <SectionErrorBoundary sectionName="PublicPageContent">
            {renderCurrentView()}
          </SectionErrorBoundary>
        </main>

        {!isMeetingRoom && (
          <SectionErrorBoundary sectionName="Footer">
            <Footer settings={settings} onNavigate={(r) => navigate(r)} />
          </SectionErrorBoundary>
        )}
      </div>
    </I18nProvider>
  );
};
