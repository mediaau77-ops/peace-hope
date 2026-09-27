import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ArrowLeft,
  CalendarPlus,
  Share2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { PageHero } from '../PageHero';
import { RichText } from '../RichText';
import { ShareButtons } from '../ShareButtons';
import { PublicEvent } from '../../../types/public';
import {
  fetchPublicEventBySlug,
  submitPublicEventRegistration,
} from '../../../lib/publicQueries';

interface EventDetailPageProps {
  slug: string;
  onBack: () => void;
}

export const EventDetailPage: React.FC<EventDetailPageProps> = ({ slug, onBack }) => {
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [loading, setLoading] = useState(true);

  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [attendeesCount, setAttendeesCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchPublicEventBySlug(slug).then((data) => {
      if (!isMounted) return;
      setEvent(data);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !fullName.trim() || !email.trim()) return;

    setSubmitting(true);
    setRegError(null);

    const success = await submitPublicEventRegistration({
      eventId: event.id,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      attendeesCount,
    });

    setSubmitting(false);
    if (success) {
      setRegistered(true);
    } else {
      setRegError('Unable to complete registration at this time. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 px-4 text-center">
        <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-2">
          Event Not Found
        </h2>
        <p className="text-sm text-slate-500 mb-6">The gathering requested could not be located.</p>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          Return to Events
        </button>
      </div>
    );
  }

  // Google Calendar Link Generator
  const gcalUrl = event.date
    ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        event.title
      )}&dates=${event.date.replace(/-/g, '')}T080000Z/${event.date.replace(
        /-/g,
        ''
      )}T120000Z&details=${encodeURIComponent(
        event.description || ''
      )}&location=${encodeURIComponent(event.location || '')}`
    : '#';

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <PageHero
        title={event.title}
        subtitle={`${event.location || 'Church'} • ${event.time || '10:00 AM'}`}
        badge={event.theme || 'Church Event'}
        backgroundImage={event.cover_image_url}
        breadcrumbs={[{ label: 'Events', href: '#events' }, { label: event.title }]}
        action={
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Events</span>
          </button>
        }
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Event Info */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {event.theme || 'Program'}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {event.title}
                </h2>
              </div>

              <a
                href={gcalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Add to Calendar</span>
              </a>
            </div>

            {/* Event Description */}
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                About This Gathering
              </h3>
              <RichText content={event.description} />
            </div>

            {/* Share Buttons */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <ShareButtons title={event.title} />
            </div>
          </div>

          {/* Sidebar: Details & Registration */}
          <div className="lg:col-span-4 space-y-6">
            {/* Details Box */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
              <h4 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                Schedule & Venue
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <Calendar className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Date</span>
                    <span>
                      {event.date
                        ? new Date(event.date).toLocaleDateString(undefined, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'To be announced'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Time</span>
                    <span>{event.time || '10:00 AM (Central Africa Time)'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Location</span>
                    <span>{event.location || 'Peace & Hope Sanctuary, Kigali'}</span>
                  </div>
                </div>

                {event.speaker && (
                  <div className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                    <User className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">Guest Speaker</span>
                      <span>{event.speaker}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Registration Box */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
              <h4 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                Reserve Your Seat
              </h4>
              <p className="text-xs text-slate-500 font-light">
                Registration helps our team prepare seating and materials for you.
              </p>

              {registered ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Registration Confirmed!</span>
                  </div>
                  <p className="font-light">
                    We look forward to worshipping together. A confirmation has been recorded.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-3">
                  {regError && (
                    <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{regError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ruth Umutoni"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. ruth@example.com"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Phone Number (optional)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+250 78..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Number of Attendees
                    </label>
                    <select
                      value={attendeesCount}
                      onChange={(e) => setAttendeesCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? 'Person' : 'People'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-xl bg-slate-900 text-white dark:bg-amber-600 dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-amber-500 disabled:opacity-50 transition-colors shadow-xs cursor-pointer mt-2"
                  >
                    {submitting ? 'Registering...' : 'Confirm Registration'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
