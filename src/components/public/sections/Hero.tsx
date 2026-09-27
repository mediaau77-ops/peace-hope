import React, { useState } from 'react';
import {
  Play,
  BookOpen,
  Radio,
  Heart,
  ArrowRight,
  Calendar,
  Sparkles,
  MessageSquare,
  Users,
  Compass,
} from 'lucide-react';
import { useI18n } from '../../../lib/i18n';
import { PublicHomepage } from '../../../types/public';
import { VideoModal } from '../shared/VideoModal';
import { useLiveStreamStatus } from '../../../hooks/useLiveStreamStatus';

import bibleStudyImg from '../../../assets/images/card_bible_study_1790363758746.jpg';
import sermonImg from '../../../assets/images/card_pastoral_sermon_1790363771173.jpg';
import prayerImg from '../../../assets/images/card_prayer_fellowship_1790363783092.jpg';
import communityImg from '../../../assets/images/card_community_worship_1790363792839.jpg';

interface HeroProps {
  homepage?: PublicHomepage | null;
}

export const Hero: React.FC<HeroProps> = ({ homepage }) => {
  const { t } = useI18n();
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const { isLive } = useLiveStreamStatus();

  const title = homepage?.hero_title;
  const subtitle =
    homepage?.hero_subtitle ||
    'A digital sanctuary where sacred scripture breathes across languages — English, Kinyarwanda, and French — uniting a global congregation in devotion, faith, and hope.';
  const imageUrl = homepage?.hero_image_url || '/sanctuary_hero.jpg';
  const videoUrl = homepage?.welcome_video_url;

  // Category Quick Navigation matching the homepage image styling
  const quickCategories = [
    {
      label: 'Holy Bible',
      subtitle: 'Read & Study',
      icon: BookOpen,
      href: '#bible',
    },
    {
      label: 'Sermons',
      subtitle: 'Watch & Listen',
      icon: Radio,
      href: '#sermons',
    },
    {
      label: 'Teachings',
      subtitle: 'Discipleship',
      icon: Compass,
      href: '#teachings',
    },
    {
      label: 'Devotionals',
      subtitle: 'Daily Bread',
      icon: Sparkles,
      href: '#devotionals',
    },
    {
      label: 'Prayer Wall',
      subtitle: 'Intercession',
      icon: Heart,
      href: '#prayer',
    },
    {
      label: 'Events',
      subtitle: 'Fellowship',
      icon: Calendar,
      href: '#events',
    },
    {
      label: 'Testimonies',
      subtitle: 'Grace Stories',
      icon: Users,
      href: '#testimonies',
    },
    {
      label: 'Live Worship',
      subtitle: isLive ? 'Streaming Now' : 'Broadcasts',
      icon: Radio,
      href: '#livestream',
      isLiveBadge: isLive,
    },
  ];

  // 4 Featured Content Cards matching the homepage image layout & aesthetic
  // Explicitly NO livestream grid here!
  const featuredContent = [
    {
      id: 'bible-exploration',
      kicker: 'John 1:1 · Sacred Text',
      title: 'The Living Word',
      description:
        'Immerse yourself in multilingual holy scriptures with parallel reading across English, Kinyarwanda, and French.',
      image: bibleStudyImg,
      href: '#bible',
      actionText: 'Read Scripture',
    },
    {
      id: 'pastoral-sermons',
      kicker: 'Romans 10:17 · Sound Doctrine',
      title: 'Proclaiming Truth',
      description:
        'Weekly Christ-centered sermons, biblical truth, and spiritual nourishment from our pastoral leadership.',
      image: sermonImg,
      href: '#sermons',
      actionText: 'Browse Sermons',
    },
    {
      id: 'global-prayer',
      kicker: 'Philippians 4:6 · Intercession',
      title: 'United in Prayer',
      description:
        'Lifting burdens and celebrating God’s answers together. Submit petitions and pray for brothers and sisters worldwide.',
      image: prayerImg,
      href: '#prayer',
      actionText: 'Enter Prayer Wall',
    },
    {
      id: 'community-fellowship',
      kicker: 'Hebrews 10:24 · Fellowship',
      title: 'Walking Together',
      description:
        'Discover upcoming Sabbath programs, youth symposiums, health ministries, and compassionate community outreach.',
      image: communityImg,
      href: '#events',
      actionText: 'View Gatherings',
    },
  ];

  return (
    <div className="relative w-full overflow-hidden bg-[#FAF7F2] dark:bg-[#0D182E] transition-colors">
      {/* ------------------------------------------------------------- */}
      {/* HERO BANNER SECTION */}
      {/* ------------------------------------------------------------- */}
      <section
        aria-label="Welcome Hero"
        className="relative w-full min-h-[560px] sm:min-h-[640px] lg:min-h-[700px] flex items-center justify-center overflow-hidden"
      >
        {/* Background Sanctuary Photography with warm golden light beams */}
        <div className="absolute inset-0 z-0">
          <img
            src={imageUrl}
            alt="Peace & Hope Digital Sanctuary"
            loading="eager"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center scale-105"
          />
          {/* Soft warm light overlays ensuring pristine contrast and reverent mood */}
          <div className="absolute inset-0 bg-linear-to-b from-[#FAF7F2]/60 via-black/40 to-[#FAF7F2] dark:from-[#0D182E]/70 dark:via-black/60 dark:to-[#0D182E]" />
          <div className="absolute inset-0 bg-radial-to-c from-transparent via-black/25 to-black/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pb-32 text-center flex flex-col items-center">
          {/* Kicker Pill Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/60 dark:bg-black/75 backdrop-blur-md border border-white/20 text-xs text-white shadow-sm mb-6 sm:mb-8">
            <span className="w-2 h-2 rounded-full bg-[#DFB15B] animate-pulse" />
            <span className="tracking-[0.25em] uppercase text-[10px] sm:text-[11px] font-semibold text-slate-100">
              Seventh-day Adventist Digital Sanctuary
            </span>
          </div>

          {/* Hero Headline: Grand Classical Serif with Golden Italic Accent */}
          {title ? (
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-white dark:text-slate-100 leading-[1.06] max-w-4xl text-balance drop-shadow-md">
              {title}
            </h1>
          ) : (
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-[#0F1E3D] dark:text-white leading-[1.04] max-w-4xl text-balance drop-shadow-sm font-normal">
              Where Light Becomes
              <span className="block font-serif italic text-[#C5A059] dark:text-[#DFB15B] font-normal mt-1 sm:mt-2">
                the Word
              </span>
            </h1>
          )}

          {/* Subtitle */}
          <p className="mt-5 sm:mt-6 text-sm sm:text-base md:text-lg lg:text-xl text-slate-800 dark:text-slate-200 font-normal max-w-2xl text-balance leading-relaxed drop-shadow-xs">
            {subtitle}
          </p>

          {/* Dual Action Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto">
            <a
              href="#bible"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#11203D] hover:bg-[#1A2E56] text-white text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#DFB15B]" />
              <span>Explore Holy Scriptures</span>
            </a>

            <a
              href="#sermons"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#FAF7F2]/90 hover:bg-[#FAF7F2] dark:bg-slate-900/85 dark:hover:bg-slate-900 border border-slate-300/80 dark:border-slate-700 text-[#11203D] dark:text-white text-sm font-medium backdrop-blur-md transition-all duration-200 hover:scale-[1.02] shadow-sm cursor-pointer"
            >
              <Radio className="w-4 h-4 text-[#C5A059]" />
              <span>Browse Sermons</span>
            </a>

            {videoUrl && (
              <button
                type="button"
                onClick={() => setVideoModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#C5A059] hover:bg-[#B38D45] text-slate-950 text-sm font-semibold shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{t('hero_watch_video')}</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* QUICK CATEGORY NAVIGATION STRIP (Circular Blue Icons) */}
      {/* ------------------------------------------------------------- */}
      <section
        aria-label="Sanctuary Ministries Navigation"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-14 relative z-20"
      >
        <div className="bg-white dark:bg-[#11203D] rounded-3xl border border-[#EAE2D7] dark:border-slate-800 shadow-[0_16px_48px_rgba(0,0,0,0.06)] p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-6">
            {quickCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <a
                  key={cat.label}
                  href={cat.href}
                  className="flex flex-col items-center text-center group cursor-pointer p-2 rounded-2xl hover:bg-[#FAF7F2] dark:hover:bg-slate-800/50 transition-all duration-200"
                >
                  {/* Circular Icon with Sapphire Blue / Navy & Gold Accents */}
                  <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-linear-to-b from-[#11203D] to-[#0A1428] text-[#DFB15B] flex items-center justify-center shadow-md border border-[#C5A059]/30 group-hover:scale-110 group-hover:border-[#DFB15B] group-hover:shadow-[0_8px_20px_rgba(17,32,61,0.25)] transition-all duration-200 shrink-0">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.8} />

                    {cat.isLiveBadge && (
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600" />
                      </span>
                    )}
                  </div>

                  <span className="mt-2.5 font-serif text-xs sm:text-sm font-semibold text-[#11203D] dark:text-white group-hover:text-[#C5A059] transition-colors line-clamp-1">
                    {cat.label}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-light truncate">
                    {cat.subtitle}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* FEATURED CONTENT 4-CARD SECTION (Homepage Image Style) */}
      {/* Explicitly NO livestream grid here! */}
      {/* ------------------------------------------------------------- */}
      <section
        aria-label="Featured Spiritual Ministries"
        className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 gap-4">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#C5A059] block">
              FEATURING FAITH & TRUTH
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#11203D] dark:text-white tracking-tight">
              Spiritual Nourishment & Community
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-light max-w-2xl leading-relaxed">
              Explore weekly teachings, intercessory prayer, pastoral messages, and joyful Sabbath fellowship.
            </p>
          </div>

          <a
            href="#bible"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C5A059] hover:text-[#A8823E] transition-colors group shrink-0"
          >
            <span>Explore All Ministries</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* 4 Cards Grid matching the design from the uploaded image */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {featuredContent.map((card) => (
            <article
              key={card.id}
              className="bg-white dark:bg-[#11203D]/70 rounded-3xl border border-[#EAE3D9] dark:border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(197,160,89,0.14)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Card Cover Image */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-900">
                  <img
                    src={card.image}
                    alt={card.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Kicker badge over photo */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-white/95 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                      {card.kicker}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-2.5">
                  <h3 className="font-serif text-xl font-bold text-[#11203D] dark:text-white tracking-tight group-hover:text-[#C5A059] transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-light leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              {/* Card Footer with Circular Arrow Icon */}
              <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-xs font-semibold text-[#11203D] dark:text-slate-200 group-hover:text-[#C5A059] transition-colors">
                  {card.actionText}
                </span>

                <div className="w-8 h-8 rounded-full bg-[#FAF4EA] dark:bg-amber-950/40 text-[#C5A059] flex items-center justify-center group-hover:bg-[#C5A059] group-hover:text-slate-950 transition-all duration-200 group-hover:scale-105 shadow-xs">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Clickable full-card anchor for accessibility */}
              <a
                href={card.href}
                className="absolute inset-0 z-10"
                aria-label={`Navigate to ${card.title}`}
              >
                <span className="sr-only">{card.title}</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* Video Modal if video is provided */}
      {videoUrl && (
        <VideoModal
          isOpen={videoModalOpen}
          onClose={() => setVideoModalOpen(false)}
          videoUrl={videoUrl}
          title={title || 'Welcome to Peace & Hope'}
        />
      )}
    </div>
  );
};
