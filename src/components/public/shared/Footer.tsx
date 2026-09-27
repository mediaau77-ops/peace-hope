import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Heart, BookOpen } from 'lucide-react';
import { useI18n, Locale } from '../../../lib/i18n';
import { PublicSettings } from '../../../types/public';
import { subscribeNewsletter } from '../../../lib/publicQueries';
import { ThemeToggle } from './ThemeToggle';
import { useLongPressLogo } from '../../../hooks/useLongPressLogo';

interface FooterProps {
  settings?: PublicSettings | null;
  onNavigate?: (hash: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  const { t, locale, setLocale } = useI18n();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribedSuccess, setSubscribedSuccess] = useState(false);

  // Hidden admin gesture on the footer logo: 15 seconds continuous hold
  const longPressProps = useLongPressLogo(() => {
    if (onNavigate) {
      onNavigate('auth/admin-login');
    } else {
      window.location.hash = '#auth/admin-login';
    }
  }, 15000);

  const churchName = settings?.churchName || 'Peace & Hope';
  const mission =
    settings?.missionStatement ||
    'Sharing the Word of God with the world. A Seventh-day Adventist digital ministry where the Scriptures breathe across languages — English, Kinyarwanda, and French — uniting a global congregation in devotion and hope.';

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setIsSubscribing(true);
    const success = await subscribeNewsletter(email);
    setIsSubscribing(false);
    if (success) {
      setSubscribedSuccess(true);
      setEmail('');
    }
  };

  const navLinks = [
    { label: 'Home', href: '#' },
    { label: 'Holy Bible', href: '#bible' },
    { label: 'Live Worship', href: '#livestream' }, // Canonical route
    { label: 'Teaching', href: '#teachings' },
    { label: 'Sermons', href: '#sermons' },
    { label: 'Devotional', href: '#devotionals' },
    { label: 'Prayer', href: '#prayer' },
    { label: 'Testimonies', href: '#testimonies' },
    { label: 'Chat Room', href: '#chat' },
    { label: 'Events', href: '#events' },
  ];

  const languages: { code: Locale; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'rw', name: 'Kinyarwanda' },
    { code: 'fr', name: 'Français' },
  ];

  return (
    <footer className="relative bg-[#0D182E] text-slate-300 pt-16 sm:pt-20 pb-10 border-t border-[#1C2C4E] overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-14 pb-14 border-b border-[#1C2C4E]">
          {/* Column 1: Brand & Ministry Description (Col span 5) */}
          <div className="lg:col-span-5 space-y-5">
            <a
              href="#"
              {...longPressProps}
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('home');
                else window.location.hash = '#';
              }}
              className="inline-flex items-center gap-3 select-none"
            >
              <BookOpen className="w-8 h-8 text-[#C5A059] pointer-events-none" strokeWidth={1.5} />
              <div className="flex flex-col pointer-events-none">
                <span className="font-serif text-2xl font-bold tracking-tight text-white leading-tight">
                  {churchName}
                </span>
                <span className="text-[10px] tracking-[0.25em] uppercase font-semibold text-[#C5A059] leading-tight mt-0.5">
                  SEVENTH-DAY ADVENTIST MINISTRY
                </span>
              </div>
            </a>

            <p className="text-sm text-slate-300/90 font-light leading-relaxed max-w-md">
              {mission}
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2 max-w-sm">
              <p className="text-xs font-semibold text-slate-300 mb-2">
                Stay connected with weekly scriptures
              </p>
              {subscribedSuccess ? (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#DFB15B] shrink-0" />
                  <span>{t('footer_subscribed_success')}</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#11203D] border border-[#22355A] text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-[#C5A059] transition-colors pr-10"
                  />
                  <button
                    type="submit"
                    disabled={isSubscribing}
                    aria-label="Subscribe"
                    className="absolute right-1 top-1 bottom-1 px-3 rounded-lg bg-[#C5A059] hover:bg-[#B38D45] text-slate-950 font-medium transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Column 2: Explore Navigation Links (Col span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A059]">
              Explore
            </h4>
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      onNavigate(link.href.replace(/^#/, ''));
                    }
                  }}
                  className="text-slate-300 hover:text-[#C5A059] transition-colors cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#giving"
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    onNavigate('giving');
                  }
                }}
                className="text-slate-300 hover:text-[#C5A059] transition-colors cursor-pointer"
              >
                Giving &amp; Tithes
              </a>
              <a
                href="#about"
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    onNavigate('about');
                  }
                }}
                className="text-slate-300 hover:text-[#C5A059] transition-colors cursor-pointer"
              >
                About Ministry
              </a>
            </div>
          </div>

          {/* Column 3: Languages & Appearance Settings (Col span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A059]">
              Languages
            </h4>
            <div className="space-y-2 text-xs">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLocale(lang.code)}
                  className={`block text-left w-full transition-colors cursor-pointer ${
                    locale === lang.code
                      ? 'text-[#C5A059] font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {lang.name} {locale === lang.code && '✓'}
                </button>
              ))}
            </div>

            {/* Appearance Mode */}
            <div className="pt-4 border-t border-[#1C2C4E] space-y-2">
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Theme
              </h5>
              <ThemeToggle variant="footer" />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {churchName}. All rights reserved.</p>

          <span className="text-[10px] tracking-[0.25em] uppercase font-semibold text-slate-400">
            SEVENTH-DAY ADVENTIST MINISTRY
          </span>
        </div>
      </div>
    </footer>
  );
};
