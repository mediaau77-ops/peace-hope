import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  onClick,
}) => {
  return (
    <article
      onClick={onClick}
      className={`bg-white dark:bg-[#11203D]/70 border border-[#EAE3D9] dark:border-slate-800 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col ${
        hoverEffect
          ? 'hover:shadow-[0_20px_40px_rgba(197,160,89,0.12)] hover:-translate-y-1 hover:border-[#DFB15B]/50 dark:hover:border-slate-700'
          : 'shadow-[0_4px_24px_rgba(0,0,0,0.03)]'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </article>
  );
};
