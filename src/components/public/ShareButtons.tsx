import React, { useState } from 'react';
import { Share2, Check, Link as LinkIcon } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url?: string;
  className?: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({
  title,
  url,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mr-1">
        <Share2 className="w-3.5 h-3.5" />
        <span>Share:</span>
      </span>

      {/* Copy Link Button */}
      <button
        type="button"
        onClick={handleCopy}
        title="Copy link"
        aria-label="Copy link"
        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-600" />
        ) : (
          <LinkIcon className="w-3.5 h-3.5" />
        )}
      </button>

      {/* WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className="p-2 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
      >
        <span className="text-xs font-bold font-sans">WA</span>
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className="p-2 rounded-lg bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 transition-colors"
      >
        <span className="text-xs font-bold font-sans">FB</span>
      </a>

      {/* X / Twitter */}
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className="p-2 rounded-lg bg-slate-900/10 text-slate-900 dark:bg-white/10 dark:text-white hover:bg-slate-900/20 transition-colors"
      >
        <span className="text-xs font-bold font-sans">𝕏</span>
      </a>
    </div>
  );
};
