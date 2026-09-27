import React, { useState, useEffect } from 'react';
import { I18nProvider } from '../../lib/i18n';
import { Header, HeaderFallback } from './shared/Header';
import { Footer } from './shared/Footer';
import { AnnouncementBar } from './shared/AnnouncementBar';
import { Hero } from './sections/Hero';
import { WelcomeVideo } from './sections/WelcomeVideo';
import { FeaturedSections } from './sections/FeaturedSections';
import { LatestSermons } from './sections/LatestSermons';
import { DevotionalHighlight } from './sections/DevotionalHighlight';
import { UpcomingEvents } from './sections/UpcomingEvents';
import { VerseOfTheDay } from './sections/VerseOfTheDay';
import { PrayerWallPreview } from './sections/PrayerWallPreview';
import { TestimoniesPreview } from './sections/TestimoniesPreview';
import { LivestreamBanner } from './sections/LivestreamBanner';
import { MeetCallHighlight } from './sections/MeetCallHighlight';
import { CTASection } from './sections/CTASection';
import { HeroSkeleton, CardGridSkeleton, QuoteSkeleton } from './shared/LoadingSkeleton';
import { SectionErrorBoundary } from '../SectionErrorBoundary';
import { useLiveStreamStatus } from '../../hooks/useLiveStreamStatus';
import { usePublicSettings } from '../../hooks/usePublicSettings';

import {
  fetchPublicSettings,
  fetchPublicHomepage,
  fetchPublicHomepageSections,
  fetchPublicSermons,
  fetchPublicTodayDevotional,
  fetchPublicUpcomingEvents,
  fetchPublicVerseOfTheDay,
  fetchPublicPrayerRequests,
  fetchPublicTestimonies,
  fetchPublicMeeting,
  subscribeToPublicRealtime,
} from '../../lib/publicQueries';

import {
  PublicHomepage,
  PublicHomepageSection,
  PublicSermon,
  PublicDevotional,
  PublicEvent,
  PublicBibleVerse,
  PublicPrayerRequest,
  PublicTestimony,
  PublicMeeting,
} from '../../types/public';

interface PublicHomePageProps {
  onOpenAdmin?: () => void;
  hideHeaderFooter?: boolean;
  onSelectTeaching?: (slug: string) => void;
  onSelectSermon?: (slug: string) => void;
  onSelectDevotional?: (slug: string) => void;
  onSelectEvent?: (slug: string) => void;
  onSelectTestimony?: (slug: string) => void;
  onJoinMeet?: (roomId: string) => void;
  onOpenPrayerWall?: () => void;
}

export const PublicHomePage: React.FC<PublicHomePageProps> = ({
  onOpenAdmin,
  hideHeaderFooter = false,
}) => {
  const [loading, setLoading] = useState(true);

  // Hook for settings with resilient fallback defaults
  const { settings: hookSettings } = usePublicSettings();

  // State slices populated directly from live Supabase tables
  const [settings, setSettings] = useState(hookSettings);
  const [homepage, setHomepage] = useState<PublicHomepage | null>(null);
  const [sections, setSections] = useState<PublicHomepageSection[]>([]);
  const [sermons, setSermons] = useState<PublicSermon[]>([]);
  const [devotional, setDevotional] = useState<PublicDevotional | null>(null);
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [verse, setVerse] = useState<PublicBibleVerse | null>(null);
  const [prayers, setPrayers] = useState<PublicPrayerRequest[]>([]);
  const [testimonies, setTestimonies] = useState<PublicTestimony[]>([]);
  const [meeting, setMeeting] = useState<PublicMeeting | null>(null);

  // Singleton livestream status shared with Header
  const { liveStream: livestream } = useLiveStreamStatus();

  const loadData = async () => {
    try {
      const [
        fetchedSettings,
        fetchedHomepage,
        fetchedSections,
        fetchedSermons,
        fetchedDevotional,
        fetchedEvents,
        fetchedVerse,
        fetchedPrayers,
        fetchedTestimonies,
        fetchedMeeting,
      ] = await Promise.all([
        fetchPublicSettings(),
        fetchPublicHomepage(),
        fetchPublicHomepageSections(),
        fetchPublicSermons(3),
        fetchPublicTodayDevotional(),
        fetchPublicUpcomingEvents(3),
        fetchPublicVerseOfTheDay(),
        fetchPublicPrayerRequests(4),
        fetchPublicTestimonies(3),
        fetchPublicMeeting(),
      ]);

      if (fetchedSettings) setSettings(fetchedSettings);
      setHomepage(fetchedHomepage);
      setSections(fetchedSections);
      setSermons(fetchedSermons);
      setDevotional(fetchedDevotional);
      setEvents(fetchedEvents);
      setVerse(fetchedVerse);
      setPrayers(fetchedPrayers);
      setTestimonies(fetchedTestimonies);
      setMeeting(fetchedMeeting);
    } catch (err) {
      console.debug('Handled error loading public homepage content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to prayer count changes non-blockingly
    const unsubscribe = subscribeToPublicRealtime({
      onPrayerChange: () => {
        fetchPublicPrayerRequests(4).then(setPrayers).catch(() => {});
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Generate Schema.org JSON-LD Structured Data
  const effectiveSettings = settings || hookSettings;
  const churchName = effectiveSettings?.churchName || 'Peace & Hope SDA Church';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Church',
    name: churchName,
    description:
      effectiveSettings?.missionStatement ||
      'Proclaiming the Everlasting Gospel, Christ our Righteousness, and the Hope of His Soon Return.',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://peacehope.org',
    telephone: effectiveSettings?.contactPhone || '+250 788 000 000',
    email: effectiveSettings?.contactEmail || 'contact@peacehope.org',
    address: {
      '@type': 'PostalAddress',
      streetAddress: effectiveSettings?.address || 'Kigali',
      addressLocality: 'Kigali',
      addressCountry: effectiveSettings?.country || 'RW',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '16:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Wednesday',
        opens: '18:00',
        closes: '19:30',
      },
    ],
  };

  const content = (
    <main className="flex-1">
      {loading ? (
        <div className="space-y-16 pb-20">
          <HeroSkeleton />
          <div className="max-w-7xl mx-auto px-4 space-y-12">
            <CardGridSkeleton count={3} />
            <QuoteSkeleton />
          </div>
        </div>
      ) : (
        <>
          {/* 3. Hero Section */}
          <SectionErrorBoundary sectionName="Hero">
            <Hero homepage={homepage} />
          </SectionErrorBoundary>

          {/* 4. Active Livestream Banner (Only shown if live) */}
          <SectionErrorBoundary sectionName="LivestreamBanner">
            <LivestreamBanner livestream={livestream} />
          </SectionErrorBoundary>

          {/* 5. Welcome Video Section (Only shown if welcome_video_url exists) */}
          <SectionErrorBoundary sectionName="WelcomeVideo">
            <WelcomeVideo homepage={homepage} />
          </SectionErrorBoundary>

          {/* 6. Featured Sections (From homepage_sections table) */}
          <SectionErrorBoundary sectionName="FeaturedSections">
            <FeaturedSections sections={sections} />
          </SectionErrorBoundary>

          {/* 7. Latest Sermons Preview */}
          <SectionErrorBoundary sectionName="LatestSermons">
            <LatestSermons sermons={sermons} />
          </SectionErrorBoundary>

          {/* 8. Daily Devotional Highlight */}
          <SectionErrorBoundary sectionName="DevotionalHighlight">
            <DevotionalHighlight devotional={devotional} />
          </SectionErrorBoundary>

          {/* 9. Upcoming Events Preview */}
          <SectionErrorBoundary sectionName="UpcomingEvents">
            <UpcomingEvents events={events} />
          </SectionErrorBoundary>

          {/* 10. Bible Verse of the Day */}
          <SectionErrorBoundary sectionName="VerseOfTheDay">
            <VerseOfTheDay verse={verse} />
          </SectionErrorBoundary>

          {/* 11. Prayer Wall Preview */}
          <SectionErrorBoundary sectionName="PrayerWallPreview">
            <PrayerWallPreview prayers={prayers} />
          </SectionErrorBoundary>

          {/* 12. Stories of Hope / Testimonies Preview */}
          <SectionErrorBoundary sectionName="TestimoniesPreview">
            <TestimoniesPreview testimonies={testimonies} />
          </SectionErrorBoundary>

          {/* 13. Meet Call Highlight (Only shown if scheduled & public) */}
          <SectionErrorBoundary sectionName="MeetCallHighlight">
            <MeetCallHighlight meeting={meeting} />
          </SectionErrorBoundary>

          {/* 14. Call to Action (CTA) Section */}
          <SectionErrorBoundary sectionName="CTASection">
            <CTASection />
          </SectionErrorBoundary>
        </>
      )}
    </main>
  );

  if (hideHeaderFooter) {
    return (
      <>
        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {content}
      </>
    );
  }

  return (
    <I18nProvider defaultLocale="en">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#0D182E] text-slate-900 dark:text-slate-100 selection:bg-[#C5A059] selection:text-white flex flex-col font-sans transition-colors">
        {/* 1. Announcement Bar (above header) */}
        <SectionErrorBoundary sectionName="AnnouncementBar">
          <AnnouncementBar />
        </SectionErrorBoundary>

        {/* 2. Site Header with SectionErrorBoundary and Static Fallback */}
        <SectionErrorBoundary sectionName="Header" fallback={<HeaderFallback />}>
          <Header settings={effectiveSettings} />
        </SectionErrorBoundary>

        {/* Main Public Content */}
        {content}

        {/* 15. Footer (Multi-column with language switcher) */}
        <SectionErrorBoundary sectionName="Footer">
          <Footer settings={effectiveSettings} />
        </SectionErrorBoundary>
      </div>
    </I18nProvider>
  );
};

