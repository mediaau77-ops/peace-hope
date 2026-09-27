import React, { useState, useEffect } from 'react';
import {
  Church,
  Heart,
  Compass,
  Users,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Award,
  Globe,
} from 'lucide-react';
import { PageHero } from '../PageHero';
import { ImageGallery } from '../ImageGallery';
import { PublicBelief, PublicLeader } from '../../../types/public';
import {
  fetchPublicBeliefs,
  fetchPublicLeaders,
  fetchPublicAboutContent,
} from '../../../lib/publicQueries';

export const AboutPage: React.FC = () => {
  const [beliefs, setBeliefs] = useState<PublicBelief[]>([]);
  const [leaders, setLeaders] = useState<PublicLeader[]>([]);
  const [aboutData, setAboutData] = useState<any>(null);
  const [openBeliefIdx, setOpenBeliefIdx] = useState<number | null>(null);

  useEffect(() => {
    fetchPublicBeliefs().then(setBeliefs);
    fetchPublicLeaders().then(setLeaders);
    fetchPublicAboutContent().then(setAboutData);
  }, []);

  const churchPhotos = [
    {
      url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=80',
      caption: 'The Sanctuary at Sunrise',
    },
    {
      url: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1200&q=80',
      caption: 'Fellowship & Choir Praise',
    },
    {
      url: 'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?auto=format&fit=crop&w=1200&q=80',
      caption: 'Youth Sabbath School Gathering',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <PageHero
        title="About Peace & Hope Church"
        subtitle="Proclaiming the everlasting gospel of Jesus Christ, nurturing disciples, and anticipating His glorious return."
        badge="Our Identity & Calling"
        breadcrumbs={[{ label: 'About Us' }]}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 space-y-12">
        {/* Mission, Vision, Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
              Our Mission
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-light leading-relaxed">
              {aboutData?.mission ||
                'To make disciples of Jesus Christ who live as His loving witnesses and proclaim to all people the everlasting gospel of the Three Angels’ Messages.'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
              Our Vision
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-light leading-relaxed">
              {aboutData?.vision ||
                'In harmony with Bible revelation, to see believers restored into the image of their Maker, living in holistic wellness, peace, and spiritual readiness for Christ’s soon return.'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
              Our Core Values
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-light leading-relaxed">
              Faith in Scripture alone, sacrificial love for humanity, holistic health, reverence in
              worship, and sincere, uncompromised Christian integrity.
            </p>
          </div>
        </div>

        {/* Church Story & History */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Our Journey
            </span>
            <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
              Rooted in Faith, Growing in Grace
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-light leading-relaxed">
              {aboutData?.story ||
                'Peace & Hope Church began as a modest gathering of faithful believers longing to provide an open, loving haven where seekers of God could discover practical biblical truth, warmth, and Christian family. Over the years, by the guidance of the Holy Spirit, the congregation has grown into a vibrant center for spiritual transformation, medical missionary outreach, youth discipleship, and heartfelt worship.'}
            </p>
          </div>

          {/* Photo Gallery */}
          <div className="pt-6">
            <ImageGallery images={churchPhotos} />
          </div>
        </div>

        {/* Fundamental Beliefs Accordion */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Doctrinal Heritage
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              What We Believe
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-light">
              Seventh-day Adventists accept the Bible as their only creed and hold certain fundamental
              beliefs to be the teaching of the Holy Scriptures.
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {beliefs.map((b, idx) => {
              const isOpen = openBeliefIdx === idx;
              return (
                <div key={b.id || idx} className="py-4">
                  <button
                    type="button"
                    onClick={() => setOpenBeliefIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left group cursor-pointer"
                  >
                    <span className="font-serif text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                      {idx + 1}. {b.title}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-amber-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="pt-3 pb-2 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-light leading-relaxed animate-in fade-in">
                      <p>{b.description}</p>
                      {(b.bible_references || b.scripture_references) && (
                        <p className="text-xs font-serif text-amber-700 dark:text-amber-400 italic">
                          Scriptures: {(b.bible_references || b.scripture_references)?.join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pastoral Leadership Team */}
        {leaders.length > 0 && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Leadership
              </span>
              <h3 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
                Our Pastoral & Ministry Servants
              </h3>
              <p className="text-xs text-slate-500 font-light">
                Shepherds committed to prayer, the Word, and caring for the flock.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {leaders.map((leader) => (
                <div
                  key={leader.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4 text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto overflow-hidden border-2 border-amber-500/30">
                    {leader.photo_url ? (
                      <img
                        src={leader.photo_url}
                        alt={leader.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-serif text-2xl font-bold text-slate-400">
                        {leader.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                      {leader.name}
                    </h4>
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      {leader.role}
                    </span>
                  </div>

                  {leader.bio && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-light line-clamp-3">
                      {leader.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
