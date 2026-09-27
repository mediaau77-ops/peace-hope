import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { SUPABASE_BUCKETS } from '../../lib/supabase';
import { InlineUploadWidget } from '../common/InlineUploadWidget';
import {
  BIBLE_BOOKS,
  SAMPLE_VERSES,
  INITIAL_READING_PLANS,
  BibleReadingPlan,
} from '../../data/bibleData';
import {
  BookOpen,
  Search,
  Volume2,
  RefreshCw,
  CheckCircle2,
  Globe2,
  Calendar,
  Bookmark,
  Highlighter,
  FileText,
  Play,
} from 'lucide-react';

export const BibleManager: React.FC = () => {
  const { settings, updateSettings } = useAdmin();
  const [selectedLang, setSelectedLang] = useState<'rw' | 'en' | 'fr'>(
    settings.defaultLanguage === 'Kinyarwanda' ? 'rw' : settings.defaultLanguage === 'Français' ? 'fr' : 'en'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isReindexing, setIsReindexing] = useState(false);
  const [reindexSuccess, setReindexSuccess] = useState(false);
  const [readingPlans, setReadingPlans] = useState<BibleReadingPlan[]>(INITIAL_READING_PLANS);
  const [activeTab, setActiveTab] = useState<'translations' | 'search_reader' | 'audio' | 'plans'>('translations');

  // Search filter across verses
  const filteredVerses = SAMPLE_VERSES.filter((v) => {
    const text = v.text[selectedLang].toLowerCase();
    const query = searchQuery.toLowerCase();
    const ref = `${v.book} ${v.chapter}:${v.verse}`.toLowerCase();
    return text.includes(query) || ref.includes(query);
  });

  const handleRebuildIndex = () => {
    setIsReindexing(true);
    setReindexSuccess(false);
    setTimeout(() => {
      setIsReindexing(false);
      setReindexSuccess(true);
      setTimeout(() => setReindexSuccess(false), 3000);
    }, 1200);
  };

  const handleLanguageChange = (lang: 'English' | 'Français' | 'Kinyarwanda') => {
    updateSettings({ defaultLanguage: lang });
    setSelectedLang(lang === 'Kinyarwanda' ? 'rw' : lang === 'Français' ? 'fr' : 'en');
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-[0.22em] text-[#b4832e] uppercase mb-1">
            SCRIPTURE REPOSITORY
          </div>
          <h1 className="font-serif text-3xl text-slate-900 font-normal tracking-tight">
            Holy Bible Manager
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage multilingual scripture texts, verse indexing, audio narration, and reading plans.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex bg-white border border-[#e8e4db] rounded-xl p-1 shadow-xs self-start sm:self-auto">
          {[
            { id: 'translations', label: 'Translations' },
            { id: 'search_reader', label: 'Scripture Search' },
            { id: 'audio', label: 'Audio Bible' },
            { id: 'plans', label: 'Reading Plans' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#fef9ee] text-[#b4832e] font-semibold border border-[#f5e6c8]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Translations Overview */}
      {activeTab === 'translations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Translation 1: Kinyarwanda */}
            <div className="bg-white border border-[#e8e4db] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#b4832e] bg-[#fef9ee] px-2 py-0.5 rounded-full border border-[#f5e6c8]">
                    PRIMARY DIALECT
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-serif text-lg font-medium text-slate-900">
                  Bibiliya Yera
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  1993 Rwanda Bible Society Translation with full 66 books and diacritics.
                </p>
              </div>

              <div className="pt-4 border-t border-[#ece8df] mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-500">Indexed Verses:</span>
                <span className="font-mono font-semibold text-slate-900">31,102</span>
              </div>
            </div>

            {/* Translation 2: English */}
            <div className="bg-white border border-[#e8e4db] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    GLOBAL ENGLISH
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-serif text-lg font-medium text-slate-900">
                  King James &amp; NIV
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Authorized standard texts for international live broadcast scripture quotes.
                </p>
              </div>

              <div className="pt-4 border-t border-[#ece8df] mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-500">Indexed Verses:</span>
                <span className="font-mono font-semibold text-slate-900">31,102</span>
              </div>
            </div>

            {/* Translation 3: French */}
            <div className="bg-white border border-[#e8e4db] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    FRANCOPHONE
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-serif text-lg font-medium text-slate-900">
                  Louis Segond 1910
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Standard French Protestant text for Great Lakes region Sabbath ministries.
                </p>
              </div>

              <div className="pt-4 border-t border-[#ece8df] mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-500">Indexed Verses:</span>
                <span className="font-mono font-semibold text-slate-900">31,102</span>
              </div>
            </div>
          </div>

          {/* Quick Index Rebuilder */}
          <div className="bg-white border border-[#e8e4db] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Full-Text In-Memory Search Index
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Re-indexes all 3 translations to support sub-10ms sermon verse lookups.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {reindexSuccess && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Index Rebuilt!
                </span>
              )}
              <button
                onClick={handleRebuildIndex}
                disabled={isReindexing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReindexing ? 'animate-spin' : ''}`} />
                <span>{isReindexing ? 'Re-indexing Verses...' : 'Rebuild Search Index'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scripture Search */}
      {activeTab === 'search_reader' && (
        <div className="bg-white border border-[#e8e4db] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search scripture text or reference (e.g. Yohana 3:16, Revelation 14, faith)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e8e4db] focus:border-amber-500 rounded-xl text-xs text-slate-900 outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Language:</span>
              <div className="flex bg-slate-100 rounded-xl p-0.5 text-xs">
                {(['rw', 'en', 'fr'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setSelectedLang(l)}
                    className={`px-3 py-1 rounded-lg uppercase font-semibold transition-colors ${
                      selectedLang === l
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {filteredVerses.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No verses found matching &ldquo;{searchQuery}&rdquo;. Try another scripture reference.
              </div>
            ) : (
              filteredVerses.map((v) => {
                const testament = BIBLE_BOOKS.find((b) => b.name === v.book)?.testament || 'Scripture';
                return (
                  <div
                    key={`${v.book}-${v.chapter}-${v.verse}`}
                    className="p-4 rounded-xl bg-[#faf9f6] border border-[#ece8df] hover:border-amber-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-serif text-sm font-semibold text-[#b4832e]">
                        {v.book} {v.chapter}:{v.verse}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">
                        {testament} Testament
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      &ldquo;{v.text[selectedLang]}&rdquo;
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Audio Bible */}
      {activeTab === 'audio' && (
        <div className="bg-white border border-[#e8e4db] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#ece8df]">
            <Volume2 className="w-5 h-5 text-[#b4832e]" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Audio Scripture Narration Library
              </h3>
              <p className="text-xs text-slate-500">
                High-quality voice recordings for prayer room and devotional background audio
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#faf9f6] rounded-xl border border-[#ece8df] space-y-2">
            <span className="text-xs font-semibold text-slate-700 block">
              Upload New Audio Chapter Narration (`teaching-media` Bucket)
            </span>
            <InlineUploadWidget
              bucket={SUPABASE_BUCKETS.TEACHING_MEDIA}
              parentTable="bible_audio"
              parentId="audio-scriptures"
            />
          </div>

          <div className="space-y-3">
            {[
              { title: 'Zaburi 23 (The Lord is My Shepherd)', duration: '1:45', lang: 'Kinyarwanda' },
              { title: 'Yohana 14 (Let Not Your Heart Be Troubled)', duration: '3:20', lang: 'Kinyarwanda' },
              { title: 'Ibyahishuwe 14 (The Three Angels Messages)', duration: '4:15', lang: 'Kinyarwanda' },
            ].map((item, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#ece8df] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">{item.title}</span>
                    <span className="text-[10px] text-slate-400">{item.lang} &bull; {item.duration}</span>
                  </div>
                </div>
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Ready
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reading Plans */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {readingPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white border border-[#e8e4db] rounded-2xl p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#b4832e] bg-[#fef9ee] px-2 py-0.5 rounded-full border border-[#f5e6c8]">
                    {plan.daysTotal} DAYS PLAN
                  </span>
                  <Calendar className="w-4 h-4 text-slate-400" />
                </div>
                <h3 className="font-serif text-lg font-medium text-slate-900">
                  {plan.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {plan.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#ece8df] mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-500">Category / Progress:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {plan.category} ({plan.completedDays}/{plan.daysTotal} days)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
