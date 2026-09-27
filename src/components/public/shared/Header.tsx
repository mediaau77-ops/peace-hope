import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Menu,
  X,
  Radio,
  User,
  Bell,
  Search,
  Gift,
  Sparkles,
} from 'lucide-react';
import { PublicSettings } from '../../../types/public';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { useLiveStreamStatus } from '../../../hooks/useLiveStreamStatus';
import { useLongPressLogo } from '../../../hooks/useLongPressLogo';
import { useI18n } from '../../../lib/i18n';

interface HeaderProps {
  settings?: PublicSettings | null;
  currentHash?: string;
  onNavigate?: (hash: string) => void;
}

const DEFAULT_PUBLIC_SETTINGS: PublicSettings = {
  churchName: 'Peace & Hope',
  tagline: 'Seventh-day Adventist Ministry',
  primaryColor: '#C5A059',
  accentColor: '#11203D',
};

export const Header: React.FC<HeaderProps> = ({ settings, currentHash = '', onNavigate }) => {
  const { t } = useI18n();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { liveStream } = useLiveStreamStatus();

  // Hidden admin gesture on the logo: 15 seconds continuous hold
  const longPressProps = useLongPressLogo(() => {
    if (onNavigate) {
      onNavigate('auth/admin-login');
    } else {
      window.location.hash = '#auth/admin-login';
    }
  }, 15000);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const churchName = settings?.churchName || DEFAULT_PUBLIC_SETTINGS.churchName;
  const logoUrl = settings?.logoUrl;

  const navLinks = [
    { label: 'Home', href: '#' },
    { label: 'Holy Bible', href: '#bible' },
    { label: 'Live Worship', href: '#livestream' }, // Canonical route: #livestream
    { label: 'Teaching', href: '#teachings' },
    { label: 'Sermons', href: '#sermons' },
    { label: 'Devotional', href: '#devotionals' },
    { label: 'Prayer', href: '#prayer' },
    { label: 'Testimonies', href: '#testimonies' },
    { label: 'Chat Room', href: '#chat' },
    { label: 'Events', href: '#events' },
  ];

  const handleLinkClick = (href: string) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(href.replace(/^#/, ''));
    } else {
      window.location.hash = href;
    }
  };

  const isActive = (href: string) => {
    const clean = href.replace(/^#/, '');
    if (!clean && (!currentHash || currentHash === '#' || currentHash === 'home')) return true;
    return currentHash.startsWith(clean);
  };

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FAF7F2]/95 dark:bg-[#0D182E]/95 backdrop-blur-md shadow-xs border-b border-[#EAE3D9] dark:border-slate-800'
          : 'bg-[#FAF7F2]/90 dark:bg-[#0D182E]/90 backdrop-blur-xs border-b border-[#EAE3D9]/60 dark:border-slate-800/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Left: Brand Identity with Hidden 15-Second Hold Gesture */}
          <a
            href="#"
            {...longPressProps}
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('#');
            }}
            className="flex items-center gap-2.5 sm:gap-3 shrink-0 group focus:outline-hidden rounded-lg p-1 select-none"
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={churchName}
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-full shadow-xs pointer-events-none"
              />
            ) : (
              <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-[#C5A059] shrink-0 pointer-events-none" strokeWidth={1.5} />
            )}
            <div className="flex flex-col pointer-events-none">
              <span className="font-serif text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-[#11203D] dark:text-white leading-tight">
                {churchName}
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase font-semibold text-[#C5A059] leading-tight mt-0.5">
                SEVENTH-DAY ADVENTIST MINISTRY
              </span>
            </div>
          </a>

          {/* Center: Desktop Navigation Links */}
          <nav
            aria-label="Main Navigation"
            className="hidden xl:flex items-center space-x-4 2xl:space-x-6 text-[13px] font-medium"
          >
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => handleLinkClick(link.href)}
                  className={`transition-colors py-1 cursor-pointer relative ${
                    active
                      ? 'text-[#C5A059] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#C5A059]'
                      : 'text-[#11203D] dark:text-slate-200 hover:text-[#C5A059]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right: Actions, Search, Giving, Theme Toggle, Language */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Live Indicator (only shown when broadcast is actively streaming) */}
            {liveStream && liveStream.status === 'live' && (
              <button
                type="button"
                onClick={() => handleLinkClick('#livestream')}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-transform hover:scale-105 cursor-pointer"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                <Radio className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('nav_watch_live')}</span>
              </button>
            )}

            {/* Giving Button */}
            <button
              type="button"
              onClick={() => handleLinkClick('#giving')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-500/20 transition-colors cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Giving</span>
            </button>

            {/* Universal Search Button */}
            <button
              type="button"
              onClick={() => handleLinkClick('#search')}
              title="Search"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notifications Button */}
            <button
              type="button"
              onClick={() => handleLinkClick('#notifications')}
              title="Notifications"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* Profile / Account Button */}
            <button
              type="button"
              onClick={() => handleLinkClick('#profile')}
              title="Member Account"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Theme Toggle (Sun/Moon) */}
            <ThemeToggle />

            {/* Language Switcher */}
            <div className="hidden sm:block">
              <LanguageSwitcher variant="header" />
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={mobileMenuOpen}
              className="xl:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-in Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 top-16 sm:top-20 z-50 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-4/5 max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-slide-right border-r border-slate-200 dark:border-slate-800">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-serif text-sm font-bold text-slate-900 dark:text-white">
                  Sanctuary Navigation
                </span>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <LanguageSwitcher variant="compact" />
                </div>
              </div>

              {/* Mobile Watch Live Badge */}
              {liveStream && liveStream.status === 'live' && (
                <button
                  type="button"
                  onClick={() => handleLinkClick('#livestream')}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-bold bg-rose-600 text-white shadow-xs cursor-pointer"
                >
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>{t('nav_watch_live')}</span>
                </button>
              )}

              {/* Navigation Links */}
              <nav className="flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => handleLinkClick(link.href)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                      isActive(link.href)
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleLinkClick('#giving')}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-500/20 cursor-pointer"
                >
                  Giving &amp; Tithes
                </button>
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <button
                type="button"
                onClick={() => handleLinkClick('#contact')}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-amber-600 text-white dark:text-slate-950 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400 dark:text-slate-950" />
                <span>Plan a Visit With Us</span>
              </button>
              <p className="text-[11px] text-center text-slate-400">
                {churchName} • Seventh-day Adventist
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export const HeaderFallback: React.FC = () => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F2] dark:bg-[#0D182E] border-b border-[#EAE3D9] dark:border-slate-800 h-16 sm:h-20 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-[#C5A059]" />
        <span className="font-serif font-bold text-lg text-slate-900 dark:text-white">Peace &amp; Hope</span>
      </div>
      <div className="w-24 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
    </header>
  );
};
