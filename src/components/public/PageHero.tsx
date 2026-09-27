import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  breadcrumbs?: BreadcrumbItem[];
  badge?: string;
  action?: React.ReactNode;
}

export const PageHero: React.FC<PageHeroProps> = ({
  title,
  subtitle,
  backgroundImage,
  breadcrumbs,
  badge,
  action,
}) => {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-[#0A1128] via-[#0F1E3D] to-[#11203D] text-white py-14 sm:py-20 border-b border-[#EAE3D9]/15 dark:border-slate-800 transition-colors">
      {/* Background with subtle gradient & optional image */}
      {backgroundImage ? (
        <div className="absolute inset-0 z-0">
          <img
            src={backgroundImage}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25 filter blur-[0.5px] scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-linear-to-b from-[#0A1128]/90 via-[#0F1E3D]/95 to-[#11203D]" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-radial-to-t from-transparent via-[#0F1E3D]/50 to-[#0A1128]" />
      )}

      {/* Subtle gold decorative glow */}
      <div className="absolute -top-24 right-1/4 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center space-x-2 text-xs text-slate-300/80">
            <a
              href="#"
              className="flex items-center gap-1 hover:text-[#DFB15B] transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </a>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3 h-3 text-slate-500" />
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-[#DFB15B] transition-colors">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-[#DFB15B] font-medium">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-2.5">
            {badge && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] tracking-[0.2em] uppercase font-bold bg-[#C5A059]/20 text-[#DFB15B] border border-[#C5A059]/30">
                {badge}
              </span>
            )}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>
    </section>
  );
};
