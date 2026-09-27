import React, { useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { useDuplicateClickGuard } from '../../hooks/useDuplicateClickGuard';

interface ReactionBarProps {
  itemId: string;
  itemType: string;
  initialAmenCount?: number;
  initialHeartCount?: number;
  initialPrayCount?: number;
  onReact?: (reactionType: 'amen' | 'heart' | 'pray') => Promise<void>;
  className?: string;
}

export const ReactionBar: React.FC<ReactionBarProps> = ({
  itemId,
  itemType,
  initialAmenCount = 0,
  initialHeartCount = 0,
  initialPrayCount = 0,
  onReact,
  className = '',
}) => {
  const { hasActed, executeGuarded } = useDuplicateClickGuard(`react_${itemType}`);

  const [amenCount, setAmenCount] = useState(initialAmenCount);
  const [heartCount, setHeartCount] = useState(initialHeartCount);
  const [prayCount, setPrayCount] = useState(initialPrayCount);

  const handleReaction = async (type: 'amen' | 'heart' | 'pray') => {
    await executeGuarded(itemId, type, async () => {
      // Optimistic update
      if (type === 'amen') setAmenCount((c) => c + 1);
      if (type === 'heart') setHeartCount((c) => c + 1);
      if (type === 'pray') setPrayCount((c) => c + 1);

      if (onReact) {
        await onReact(type);
      }
    });
  };

  const hasAmened = hasActed(itemId, 'amen');
  const hasHearted = hasActed(itemId, 'heart');
  const hasPrayed = hasActed(itemId, 'pray');

  return (
    <div className={`flex items-center gap-2 sm:gap-3 py-3 ${className}`}>
      {/* Amen Button */}
      <button
        type="button"
        onClick={() => handleReaction('amen')}
        disabled={hasAmened}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
          hasAmened
            ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 ring-1 ring-amber-500/30'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-700'
        }`}
      >
        <Sparkles className={`w-3.5 h-3.5 ${hasAmened ? 'text-amber-600 fill-current' : ''}`} />
        <span>Amen</span>
        <span className="opacity-75 font-mono text-[11px] ml-0.5">{amenCount}</span>
      </button>

      {/* Heart Button */}
      <button
        type="button"
        onClick={() => handleReaction('heart')}
        disabled={hasHearted}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
          hasHearted
            ? 'bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300 ring-1 ring-rose-500/30'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700'
        }`}
      >
        <Heart className={`w-3.5 h-3.5 ${hasHearted ? 'text-rose-600 fill-current' : ''}`} />
        <span>Love</span>
        <span className="opacity-75 font-mono text-[11px] ml-0.5">{heartCount}</span>
      </button>

      {/* Pray Button */}
      <button
        type="button"
        onClick={() => handleReaction('pray')}
        disabled={hasPrayed}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
          hasPrayed
            ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 ring-1 ring-indigo-500/30'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-700'
        }`}
      >
        <span className="text-xs">🙏</span>
        <span>Pray</span>
        <span className="opacity-75 font-mono text-[11px] ml-0.5">{prayCount}</span>
      </button>
    </div>
  );
};
