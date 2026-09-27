import React from 'react';

interface RichTextProps {
  content?: string;
  className?: string;
}

export const RichText: React.FC<RichTextProps> = ({ content = '', className = '' }) => {
  if (!content) return null;

  // If content contains standard HTML tags, render safely sanitized (or dangerouslySetInnerHTML with styling)
  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  if (isHtml) {
    return (
      <div
        className={`prose prose-slate dark:prose-invert max-w-none prose-headings:font-serif prose-headings:tracking-tight prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-a:text-amber-600 dark:prose-a:text-amber-400 prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:bg-amber-50/50 dark:prose-blockquote:bg-amber-950/20 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:italic ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Otherwise, split by double newlines into stylized paragraphs
  const paragraphs = content.split(/\n\s*\n/);

  return (
    <div className={`space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed font-sans text-base sm:text-lg ${className}`}>
      {paragraphs.map((p, idx) => {
        // Handle markdown blockquote > quote
        if (p.startsWith('>')) {
          return (
            <blockquote
              key={idx}
              className="border-l-4 border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 py-3 px-5 rounded-r-xl italic font-serif text-slate-800 dark:text-amber-200 my-4"
            >
              {p.replace(/^>\s*/, '')}
            </blockquote>
          );
        }

        // Handle markdown heading ##
        if (p.startsWith('## ')) {
          return (
            <h2
              key={idx}
              className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white pt-4 pb-1"
            >
              {p.replace(/^##\s*/, '')}
            </h2>
          );
        }

        if (p.startsWith('### ')) {
          return (
            <h3
              key={idx}
              className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-white pt-3 pb-1"
            >
              {p.replace(/^###\s*/, '')}
            </h3>
          );
        }

        return <p key={idx}>{p}</p>;
      })}
    </div>
  );
};
