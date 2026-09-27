import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { PublicHomepage } from '../../../types/public';
import { VideoModal } from '../shared/VideoModal';

interface WelcomeVideoProps {
  homepage?: PublicHomepage | null;
}

export const WelcomeVideo: React.FC<WelcomeVideoProps> = ({ homepage }) => {
  const [modalOpen, setModalOpen] = useState(false);

  // If welcome_video_url does not exist, hide entire section gracefully
  if (!homepage?.welcome_video_url) {
    return null;
  }

  const videoUrl = homepage.welcome_video_url;
  const message = homepage.welcome_message;

  return (
    <section
      aria-label="Welcome Presentation"
      className="relative py-16 sm:py-24 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            About Our Church
          </span>
          <h2 className="mt-2 font-serif text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome to Peace & Hope
          </h2>
          {message && (
            <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 font-light leading-relaxed">
              {message}
            </p>
          )}
        </div>

        {/* Cinematic Video Card Frame */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-2xl group">
          <div className="relative aspect-video w-full overflow-hidden flex items-center justify-center">
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-radial-to-c from-amber-900/20 via-slate-950 to-slate-950" />

            {/* Play Button Overlay Trigger */}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              aria-label="Play welcome video"
              className="relative z-10 flex flex-col items-center justify-center gap-3 p-6 group cursor-pointer focus:outline-hidden"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-600/90 group-hover:bg-amber-500 text-slate-950 flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-300">
                <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current translate-x-0.5" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-white tracking-wide uppercase group-hover:text-amber-300 transition-colors">
                Watch Welcome Presentation
              </span>
            </button>
          </div>
        </div>
      </div>

      <VideoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        videoUrl={videoUrl}
        title="Welcome to Peace & Hope"
      />
    </section>
  );
};
