import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react';
import { PageHero } from '../PageHero';
import { submitPublicContactMessage, fetchPublicFAQs } from '../../../lib/publicQueries';
import { PublicFAQ } from '../../../types/public';

export const ContactPage: React.FC = () => {
  const [faqs, setFaqs] = useState<PublicFAQ[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchPublicFAQs().then(setFaqs);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setSubmitting(true);
    const success = await submitPublicContactMessage({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim() || 'General Inquiry',
      message: message.trim(),
    });

    setSubmitting(false);
    if (success) {
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <PageHero
        title="Connect & Visit With Us"
        subtitle="We would love to welcome you in person or respond to any questions, pastoral needs, or prayer inquiries."
        badge="Get In Touch"
        breadcrumbs={[{ label: 'Contact Us' }]}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Details & Service Times */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-6">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                Church Information
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Physical Sanctuary
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 font-light">
                      Peace & Hope SDA Church, Kigali, Rwanda
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Church Office Phone
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 font-light">
                      +250 788 000 000 / +250 788 111 222
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Pastoral Email
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 font-light">
                      contact@peaceandhopechurch.org
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Worship Times */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                  Regular Service Schedule
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">Sabbath School</span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono">Saturday 9:00 AM</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">Divine Worship Hour</span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono">Saturday 11:00 AM</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">Youth & Bible Study</span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono">Saturday 2:30 PM</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">Mid-Week Prayer Vigil</span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono">Wednesday 6:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-6">
            <div className="space-y-1">
              <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                Send Us a Message
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-light">
                Whether you have questions about the Sabbath, baptism, pastoral counseling, or visiting our services.
              </p>
            </div>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 space-y-3 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-serif text-xl font-bold">Message Sent Successfully</h4>
                <p className="text-xs font-light max-w-sm mx-auto">
                  Thank you for reaching out. A pastoral assistant or elder will reply to your email shortly.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                  >
                    Send Another Note
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. David Mugisha"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. david@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject (optional)
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Visiting this Sabbath / Bible Study Question"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How may our church family serve and assist you?"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-amber-600 dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-amber-500 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Visitor Questions
            </span>
            <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={faq.id || idx} className="py-4">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left group cursor-pointer"
                  >
                    <span className="font-serif text-base font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="pt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-light leading-relaxed animate-in fade-in">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
