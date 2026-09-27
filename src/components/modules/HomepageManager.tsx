import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { HeroBanner, HomepageSection, ContentStatus } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { SUPABASE_BUCKETS } from '../../lib/supabase';
import { InlineUploadWidget } from '../common/InlineUploadWidget';
import { PublishStatusBadge, PublishStatusSelect } from '../common/PublishStatusControl';
import {
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Eye,
  EyeOff,
  Sparkles,
  Smartphone,
  Tablet,
  Monitor,
  Calendar,
  Quote,
  Layout,
  FileText,
  Grid,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const HomepageManager: React.FC = () => {
  const {
    heroBanners,
    addHeroBanner,
    updateHeroBanner,
    deleteHeroBanner,
    reorderHeroBanners,
    settings,
    updateSettings,
    events,
    testimonies,
  } = useAdmin();

  // Active view: 'editor' | 'preview'
  const [activeView, setActiveView] = useState<'editor' | 'preview'>('editor');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Welcome Greeting
  const [isEditingWelcome, setIsEditingWelcome] = useState(false);
  const [welcomeTagline, setWelcomeTagline] = useState(settings.tagline);
  const [welcomeMission, setWelcomeMission] = useState(settings.missionStatement);

  // Hero Banners
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formBgUrl, setFormBgUrl] = useState('');
  const [formCtaText, setFormCtaText] = useState('Watch Live Worship');
  const [formCtaLink, setFormCtaLink] = useState('#live');
  const [formStatus, setFormStatus] = useState<ContentStatus>('published');

  // Sections Management (Text, Media Grid, Testimonial, Callout, Upcoming Events preview)
  const [sections, setSections] = useState<HomepageSection[]>(() => {
    const saved = localStorage.getItem('ph_homepage_sections');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: 'sec-1',
        title: 'Welcome to Peace & Hope',
        subtitle: 'A sanctuary of grace, prayer, and transformative truth',
        type: 'text',
        content: 'We welcome you to experience Christ-centered worship, inspiring Biblical teachings, and a warm family of faith.',
        visible: true,
        sort_order: 1,
        status: 'published',
        cover_image_url: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1200&q=80',
      },
      {
        id: 'sec-2',
        title: 'Upcoming Fellowship & Worship',
        subtitle: 'Join us in prayer, Bible study, and praise services',
        type: 'events_preview',
        visible: true,
        sort_order: 2,
        status: 'published',
      },
      {
        id: 'sec-3',
        title: 'Stories of Transformed Lives',
        subtitle: 'Witness how prayer moves mountains in our community',
        type: 'testimonial',
        visible: true,
        sort_order: 3,
        status: 'published',
      },
      {
        id: 'sec-4',
        title: 'Need Urgent Prayer Support?',
        subtitle: 'Our intercessory pastoral team stands with you 24/7',
        type: 'callout',
        content: 'Submit your prayer request or connect directly with our pastoral prayer team in confidential prayer rooms.',
        visible: true,
        sort_order: 4,
        status: 'published',
      },
    ];
  });

  // Section Modal state
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [secTitle, setSecTitle] = useState('');
  const [secSubtitle, setSecSubtitle] = useState('');
  const [secType, setSecType] = useState<HomepageSection['type']>('text');
  const [secContent, setSecContent] = useState('');
  const [secCoverUrl, setSecCoverUrl] = useState('');
  const [secStatus, setSecStatus] = useState<ContentStatus>('published');

  const saveSections = (newSections: HomepageSection[]) => {
    setSections(newSections);
    localStorage.setItem('ph_homepage_sections', JSON.stringify(newSections));
  };

  const handleSaveWelcome = () => {
    updateSettings({
      tagline: welcomeTagline,
      missionStatement: welcomeMission,
    });
    setIsEditingWelcome(false);
  };

  const handleOpenAddBanner = () => {
    setFormTitle('');
    setFormSubtitle('');
    setFormTagline('');
    setFormBgUrl('https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1600&q=80');
    setFormCtaText('Watch Live Worship');
    setFormCtaLink('#live');
    setFormStatus('published');
    setEditingBannerId(null);
    setIsAddingBanner(true);
  };

  const handleOpenEditBanner = (banner: HeroBanner) => {
    setFormTitle(banner.title);
    setFormSubtitle(banner.subtitle);
    setFormTagline(banner.tagline);
    setFormBgUrl(banner.bgImageUrl);
    setFormCtaText(banner.ctaText);
    setFormCtaLink(banner.ctaLink);
    setFormStatus(banner.status || (banner.active ? 'published' : 'draft'));
    setEditingBannerId(banner.id);
    setIsAddingBanner(true);
  };

  const handleSubmitBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingBannerId) {
      updateHeroBanner(editingBannerId, {
        title: formTitle,
        subtitle: formSubtitle,
        tagline: formTagline,
        bgImageUrl: formBgUrl,
        ctaText: formCtaText,
        ctaLink: formCtaLink,
        status: formStatus,
        active: formStatus === 'published',
      });
    } else {
      addHeroBanner({
        title: formTitle,
        subtitle: formSubtitle,
        tagline: formTagline,
        bgImageUrl: formBgUrl,
        ctaText: formCtaText,
        ctaLink: formCtaLink,
        active: formStatus === 'published',
        status: formStatus,
        order: heroBanners.length + 1,
      });
    }

    setIsAddingBanner(false);
    setEditingBannerId(null);
  };

  // Section handlers
  const handleOpenAddSection = () => {
    setSecTitle('');
    setSecSubtitle('');
    setSecType('text');
    setSecContent('');
    setSecCoverUrl('');
    setSecStatus('published');
    setEditingSectionId(null);
    setIsAddingSection(true);
  };

  const handleOpenEditSection = (section: HomepageSection) => {
    setSecTitle(section.title);
    setSecSubtitle(section.subtitle || '');
    setSecType(section.type);
    setSecContent(section.content || '');
    setSecCoverUrl(section.cover_image_url || '');
    setSecStatus(section.status || 'published');
    setEditingSectionId(section.id);
    setIsAddingSection(true);
  };

  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secTitle.trim()) return;

    if (editingSectionId) {
      const updated = sections.map((s) =>
        s.id === editingSectionId
          ? {
              ...s,
              title: secTitle,
              subtitle: secSubtitle,
              description: secSubtitle || secContent || secTitle,
              type: secType,
              content: secContent,
              cover_image_url: secCoverUrl,
              status: secStatus,
            }
          : s
      );
      saveSections(updated);
    } else {
      const newSec: HomepageSection = {
        id: `sec-${Date.now()}`,
        title: secTitle,
        subtitle: secSubtitle,
        description: secSubtitle || secContent || secTitle,
        type: secType,
        content: secContent,
        cover_image_url: secCoverUrl,
        visible: true,
        sort_order: sections.length + 1,
        status: secStatus,
      };
      saveSections([...sections, newSec]);
    }

    setIsAddingSection(false);
    setEditingSectionId(null);
  };

  const toggleSectionVisibility = (id: string) => {
    const updated = sections.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s));
    saveSections(updated);
  };

  const deleteSection = (id: string) => {
    const updated = sections.filter((s) => s.id !== id);
    saveSections(updated);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const clone = [...sections];
    const temp = clone[index];
    clone[index] = clone[targetIdx];
    clone[targetIdx] = temp;
    saveSections(clone);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl pb-16">
      {/* Top Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-[0.22em] text-[#b4832e] dark:text-amber-400 uppercase mb-1">
            HOMEPAGE CMS MODULE
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-slate-900 dark:text-white font-normal tracking-tight">
            Homepage &amp; Hero Sections
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Manage church hero banners, welcome greetings, and dynamic sections with per-module media.
          </p>
        </div>

        {/* Action Controls: Switch between Editor and Preview */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveView('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === 'editor'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              onClick={() => setActiveView('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === 'preview'
                  ? 'bg-white dark:bg-slate-900 text-[#b4832e] dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Preview</span>
            </button>
          </div>

          {activeView === 'editor' && (
            <button
              onClick={handleOpenAddBanner}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#b4832e] hover:bg-[#9c6a1e] text-white font-medium text-xs shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Hero Banner</span>
              <span className="sm:hidden">Banner</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================= LIVE PREVIEW MODE ======================= */}
      {activeView === 'preview' && (
        <div className="space-y-4">
          {/* Device Mockup Toolbar */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Viewing interactive public visitor simulation</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setPreviewDevice('desktop')}
                title="Desktop View"
                className={`p-1.5 rounded-lg text-xs ${
                  previewDevice === 'desktop'
                    ? 'bg-white dark:bg-slate-900 text-[#b4832e] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                title="Tablet View"
                className={`p-1.5 rounded-lg text-xs ${
                  previewDevice === 'tablet'
                    ? 'bg-white dark:bg-slate-900 text-[#b4832e] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                title="Mobile View"
                className={`p-1.5 rounded-lg text-xs ${
                  previewDevice === 'mobile'
                    ? 'bg-white dark:bg-slate-900 text-[#b4832e] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Device Screen Frame */}
          <div className="flex justify-center bg-slate-100 dark:bg-slate-950 p-4 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
            <div
              className={`bg-white dark:bg-slate-900 shadow-2xl rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 transition-all duration-300 ${
                previewDevice === 'desktop'
                  ? 'w-full'
                  : previewDevice === 'tablet'
                  ? 'w-[768px]'
                  : 'w-[375px]'
              }`}
            >
              {/* Mock Browser Header */}
              <div className="h-8 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-3 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                <span className="ml-3 text-[10px] text-slate-400 font-mono">
                  peaceandhope.church
                </span>
              </div>

              {/* Simulated Hero Section */}
              {heroBanners.length > 0 ? (
                <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-slate-900 text-white flex items-center justify-center p-6 text-center">
                  <img
                    src={heroBanners[0]?.bgImageUrl}
                    alt={heroBanners[0]?.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                  />
                  <div className="relative z-10 max-w-2xl space-y-3">
                    <span className="text-[11px] font-bold tracking-[0.2em] text-amber-300 uppercase">
                      {heroBanners[0]?.tagline || settings.tagline}
                    </span>
                    <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
                      {heroBanners[0]?.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-lg mx-auto">
                      {heroBanners[0]?.subtitle}
                    </p>
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg cursor-pointer">
                        {heroBanners[0]?.ctaText || 'Watch Live Worship'}
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No hero banner published.
                </div>
              )}

              {/* Simulated Welcome & Mission */}
              <div className="p-6 sm:p-10 text-center border-b border-slate-100 dark:border-slate-800 bg-[#fdfbf7] dark:bg-slate-900/50">
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#b4832e] uppercase">
                  OUR SACRED CALLING
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  &ldquo;{settings.tagline}&rdquo;
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mt-2 leading-relaxed">
                  {settings.missionStatement}
                </p>
              </div>

              {/* Simulated Sections */}
              <div className="p-6 sm:p-8 space-y-8">
                {sections
                  .filter((s) => s.visible)
                  .map((sec) => (
                    <div
                      key={sec.id}
                      className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            {(sec.type || 'section').replace('_', ' ')}
                          </span>
                          <h4 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                            {sec.title}
                          </h4>
                        </div>
                      </div>
                      {sec.subtitle && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                          {sec.subtitle}
                        </p>
                      )}
                      {sec.content && (
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {sec.content}
                        </p>
                      )}
                      {sec.type === 'events_preview' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                          {events.slice(0, 2).map((ev) => (
                            <div
                              key={ev.id}
                              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs flex items-center justify-between"
                            >
                              <span className="font-medium text-slate-800 dark:text-slate-200">
                                {ev.title}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {ev.date}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {sec.type === 'testimonial' && (
                        <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl mt-3 text-xs italic text-slate-700 dark:text-slate-300">
                          {testimonies[0]?.testimonyText ? (
                            <p>&ldquo;{testimonies[0].testimonyText.slice(0, 140)}...&rdquo;</p>
                          ) : (
                            <p>&ldquo;The Lord has brought boundless peace and strength to my home.&rdquo;</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= EDITOR MODE ======================= */}
      {activeView === 'editor' && (
        <div className="space-y-8">
          {/* Welcome Greeting & Mission Statement Card */}
          <div className="bg-white dark:bg-slate-900 border border-[#e8e4db] dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#ece8df] dark:border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Welcome Greeting &amp; Mission Statement
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Displayed prominently to members and visitors arriving on the church platform
                </p>
              </div>

              {!isEditingWelcome ? (
                <button
                  onClick={() => setIsEditingWelcome(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Greeting</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingWelcome(false)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveWelcome}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#b4832e] hover:bg-[#9c6a1e] text-white text-xs font-medium shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </div>

            {!isEditingWelcome ? (
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Official Tagline:{' '}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 font-serif italic text-sm">
                    &ldquo;{settings.tagline}&rdquo;
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Mission Statement:{' '}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {settings.missionStatement}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Official Tagline
                  </label>
                  <input
                    type="text"
                    value={welcomeTagline}
                    onChange={(e) => setWelcomeTagline(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Mission Statement
                  </label>
                  <textarea
                    rows={3}
                    value={welcomeMission}
                    onChange={(e) => setWelcomeMission(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Hero Banners Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Hero Banners ({heroBanners.length})
                </h2>
                <span className="text-xs text-slate-400">
                  Reorder banners or edit background images and CTA links
                </span>
              </div>
            </div>

            {heroBanners.length === 0 ? (
              <EmptyState
                title="No content has been published yet."
                description="No homepage hero banners found in Supabase. Click 'Add Hero Banner' to create your first banner."
                actionLabel="Add Hero Banner"
                onAction={handleOpenAddBanner}
                tableName="homepage"
              />
            ) : (
              <div className="space-y-3">
                {heroBanners.map((banner, index) => (
                  <div
                    key={banner.id}
                    className="bg-white dark:bg-slate-900 border border-[#e8e4db] dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                        <img
                          src={banner.bgImageUrl}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#b4832e] dark:text-amber-400">
                            {banner.tagline || 'HERO BANNER'}
                          </span>
                          <PublishStatusBadge
                            status={banner.status || (banner.active ? 'published' : 'draft')}
                          />
                        </div>

                        <h4 className="font-serif text-base text-slate-900 dark:text-white font-medium">
                          {banner.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {banner.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => reorderHeroBanners(index, index - 1)}
                        disabled={index === 0}
                        className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => reorderHeroBanners(index, index + 1)}
                        disabled={index === heroBanners.length - 1}
                        className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditBanner(banner)}
                        className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        title="Edit Banner"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteHeroBanner(banner.id)}
                        className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section Management (Reorder, Visibility, Add New Sections) */}
          <div className="space-y-4 pt-4 border-t border-[#ece8df] dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Homepage Section Management
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Control sections, reorder homepage flow, and manage module visibility.
                </p>
              </div>

              <button
                onClick={handleOpenAddSection}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#b4832e] text-[#b4832e] dark:text-amber-400 hover:bg-[#b4832e]/10 text-xs font-medium self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Section</span>
              </button>
            </div>

            <div className="space-y-3">
              {sections.map((sec, idx) => (
                <div
                  key={sec.id}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                    sec.visible
                      ? 'border-[#e8e4db] dark:border-slate-800'
                      : 'border-dashed border-slate-300 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                      {sec.type === 'text' && <FileText className="w-4 h-4" />}
                      {sec.type === 'media_grid' && <Grid className="w-4 h-4" />}
                      {sec.type === 'testimonial' && <Quote className="w-4 h-4" />}
                      {sec.type === 'callout' && <Sparkles className="w-4 h-4" />}
                      {sec.type === 'events_preview' && <Calendar className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                          {(sec.type || 'section').replace('_', ' ')}
                        </span>
                        <PublishStatusBadge status={sec.status || 'published'} />
                        {!sec.visible && (
                          <span className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md font-semibold">
                            Hidden
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {sec.title}
                      </h4>
                      {sec.subtitle && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {sec.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      onClick={() => toggleSectionVisibility(sec.id)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      title={sec.visible ? 'Hide Section' : 'Show Section'}
                    >
                      {sec.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => moveSection(idx, 'up')}
                      disabled={idx === 0}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveSection(idx, 'down')}
                      disabled={idx === sections.length - 1}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditSection(sec)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      title="Edit Section"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteSection(sec.id)}
                      className="p-2 rounded-xl border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                      title="Delete Section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================= HERO BANNER MODAL ======================= */}
      {isAddingBanner && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-[#e8e4db] dark:border-slate-800 rounded-3xl w-full max-w-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#ece8df] dark:border-slate-800">
              <h3 className="font-serif text-lg text-slate-900 dark:text-white font-medium">
                {editingBannerId ? 'Edit Hero Banner' : 'Create New Hero Banner'}
              </h3>
              <button
                onClick={() => setIsAddingBanner(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBanner} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Tagline (Gold Eyebrow)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., SEVENTH-DAY ADVENTIST CHURCH"
                    value={formTagline}
                    onChange={(e) => setFormTagline(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Publish Status
                  </label>
                  <PublishStatusSelect
                    status={formStatus}
                    onChange={(st) => setFormStatus(st)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Main Banner Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Walking in Faith &amp; Truth"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Subtitle Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter descriptive subtitle..."
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              {/* Per-Module Inline Upload Widget for Homepage */}
              <div className="pt-2">
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                  Hero Banner Media (Direct `homepage-media` Bucket)
                </label>
                <InlineUploadWidget
                  bucket={SUPABASE_BUCKETS.HOMEPAGE_MEDIA}
                  parentTable="homepage_banners"
                  parentId={editingBannerId || 'temp-hero'}
                  currentCoverUrl={formBgUrl}
                  onCoverChange={(url) => setFormBgUrl(url)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={formCtaText}
                    onChange={(e) => setFormCtaText(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    CTA Button Link
                  </label>
                  <input
                    type="text"
                    value={formCtaLink}
                    onChange={(e) => setFormCtaLink(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece8df] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingBanner(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#b4832e] hover:bg-[#9c6a1e] text-white font-medium"
                >
                  {editingBannerId ? 'Save Changes' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= SECTION MODAL ======================= */}
      {isAddingSection && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-[#e8e4db] dark:border-slate-800 rounded-3xl w-full max-w-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#ece8df] dark:border-slate-800">
              <h3 className="font-serif text-lg text-slate-900 dark:text-white font-medium">
                {editingSectionId ? 'Edit Homepage Section' : 'Add New Homepage Section'}
              </h3>
              <button
                onClick={() => setIsAddingSection(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Section Type
                  </label>
                  <select
                    value={secType}
                    onChange={(e) => setSecType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="text">Text / Welcome Block</option>
                    <option value="media_grid">Media Grid Showcase</option>
                    <option value="testimonial">Testimonial Quote</option>
                    <option value="callout">Prayer &amp; Pastoral Callout</option>
                    <option value="events_preview">Upcoming Events Preview</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Status
                  </label>
                  <PublishStatusSelect
                    status={secStatus}
                    onChange={(st) => setSecStatus(st)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Section Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Welcome to Our Church Family"
                  value={secTitle}
                  onChange={(e) => setSecTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g., A brief summary or context..."
                  value={secSubtitle}
                  onChange={(e) => setSecSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              {secType !== 'events_preview' && secType !== 'testimonial' && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Body Content
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter section description or message..."
                    value={secContent}
                    onChange={(e) => setSecContent(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-[#e8e4db] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {/* Upload widget for section cover / media */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                  Section Media (`homepage-media` Bucket)
                </label>
                <InlineUploadWidget
                  bucket={SUPABASE_BUCKETS.HOMEPAGE_MEDIA}
                  parentTable="homepage_sections"
                  parentId={editingSectionId || 'temp-section'}
                  currentCoverUrl={secCoverUrl}
                  onCoverChange={(url) => setSecCoverUrl(url)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece8df] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingSection(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#b4832e] hover:bg-[#9c6a1e] text-white font-medium"
                >
                  {editingSectionId ? 'Save Section' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
