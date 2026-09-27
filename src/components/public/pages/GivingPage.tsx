import React, { useState } from 'react';
import {
  Heart,
  Gift,
  CreditCard,
  Smartphone,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  Quote,
  Copy,
  Check,
} from 'lucide-react';
import { PageHero } from '../PageHero';
import { submitPublicDonationPledge } from '../../../lib/publicQueries';

export const GivingPage: React.FC = () => {
  const [selectedFund, setSelectedFund] = useState('tithe');
  const [amount, setAmount] = useState('10000');
  const [currency, setCurrency] = useState('RWF');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedMomo, setCopiedMomo] = useState(false);

  const funds = [
    { id: 'tithe', label: 'Tithe (10%)', desc: 'Returned holy unto the Lord for the gospel ministry' },
    { id: 'local_budget', label: 'Church Budget', desc: 'Sustains local sanctuary operations and utilities' },
    { id: 'evangelism', label: 'Evangelism & Media', desc: 'Bible literature, radio/broadcast, outreach crusades' },
    { id: 'building', label: 'Sanctuary Building Fund', desc: 'Facility improvements, seating, and youth annex' },
    { id: 'welfare', label: 'Dorcas & Needy Relief', desc: 'Assisting widows, orphans, and vulnerable families' },
  ];

  const handlePledgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !donorName.trim() || !donorEmail.trim()) return;

    setSubmitting(true);
    const success = await submitPublicDonationPledge({
      donorName: donorName.trim(),
      email: donorEmail.trim(),
      phone: donorPhone.trim(),
      amount: Number(amount),
      fund: selectedFund,
      currency,
    });

    setSubmitting(false);
    if (success) {
      setConfirmed(true);
    }
  };

  const copyToClipboard = (text: string, type: 'bank' | 'momo') => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === 'bank') {
        setCopiedBank(true);
        setTimeout(() => setCopiedBank(false), 2000);
      } else {
        setCopiedMomo(true);
        setTimeout(() => setCopiedMomo(false), 2000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <PageHero
        title="Stewardship & Giving"
        subtitle="Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the Lord of hosts."
        badge="Faithful Stewards"
        breadcrumbs={[{ label: 'Giving & Tithes' }]}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 space-y-12">
        {/* Scripture Promise Callout */}
        <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <blockquote className="font-serif italic text-sm sm:text-base text-slate-800 dark:text-slate-200">
              "Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver."
            </blockquote>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              — 2 Corinthians 9:7
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Payment Methods & Instructions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-6">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                Giving Channels
              </h3>

              {/* Mobile Money MTN / Airtel */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-5 h-5 text-amber-500" />
                    <span className="font-serif text-sm font-bold text-slate-900 dark:text-white">
                      Mobile Money (MoMo / Airtel Money)
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                    Instant
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-light">
                  Dial *182*8*1*000000# or send to Merchant Code:
                </p>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    *182*8*1*987654# (Peace & Hope SDA)
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('*182*8*1*987654#', 'momo')}
                    className="text-amber-600 dark:text-amber-400 hover:text-amber-700 cursor-pointer p-1"
                  >
                    {copiedMomo ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Bank Transfer */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Landmark className="w-5 h-5 text-amber-500" />
                    <span className="font-serif text-sm font-bold text-slate-900 dark:text-white">
                      Bank Wire / Electronic Transfer
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">Local & Int'l</span>
                </div>
                <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                  <p>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Bank Name:</span> Bank of Kigali (BK)
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Account Name:</span> Peace and Hope SDA Church Kigali
                  </p>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono">
                    <span>00045-06981234-77</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('00045-06981234-77', 'bank')}
                      className="text-amber-600 dark:text-amber-400 cursor-pointer p-1"
                    >
                      {copiedBank ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* In-Person Giving */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <span className="font-bold block">Sanctuary Tithe Envelopes</span>
                <p className="font-light">
                  During Sabbath Divine Service, tithe envelopes are available from deacons. Place your gift in the offering basket during the collection.
                </p>
              </div>
            </div>
          </div>

          {/* Online Notification & Giving Pledge Form */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-6">
            <div className="space-y-1">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                Record a Gift or Request a Receipt
              </h3>
              <p className="text-xs text-slate-500 font-light">
                Fill this form after completing your transfer so the church treasury can allocate the fund and issue an official receipt.
              </p>
            </div>

            {confirmed ? (
              <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 space-y-3 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-serif text-xl font-bold">Stewardship Record Received</h4>
                <p className="text-xs font-light max-w-sm mx-auto">
                  May God abundantly bless your faithfulness to His cause. A confirmation copy will be emailed to you by the church treasury.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmed(false)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                  >
                    Record Another Gift
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePledgeSubmit} className="space-y-4">
                {/* Fund choice */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Select Ministry Fund *
                  </label>
                  <div className="space-y-2">
                    {funds.map((f) => (
                      <label
                        key={f.id}
                        onClick={() => setSelectedFund(f.id)}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                          selectedFund === f.id
                            ? 'bg-amber-500/10 border-amber-500 text-amber-950 dark:text-amber-200'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="fund"
                          checked={selectedFund === f.id}
                          onChange={() => setSelectedFund(f.id)}
                          className="mt-0.5 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <div>
                          <span className="font-bold block">{f.label}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-light">
                            {f.desc}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Amount & Currency */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Amount Given *
                    </label>
                    <input
                      type="number"
                      required
                      min="100"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 10000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="RWF">RWF</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="KES">KES</option>
                    </select>
                  </div>
                </div>

                {/* Donor Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email for Receipt *
                    </label>
                    <input
                      type="email"
                      required
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Safe & Confidential Record</span>
                  </span>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-amber-600 dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {submitting ? 'Submitting...' : 'Submit Giving Record'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
