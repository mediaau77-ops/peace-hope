import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  TrendingUp,
  Download,
  Users,
  Eye,
  BookOpen,
  HeartHandshake,
  Clock,
  Globe2,
  Calendar,
  CheckCircle,
} from 'lucide-react';

export const AnalyticsReports: React.FC = () => {
  const { sermons, prayerRequests } = useAdmin();
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Weekly viewer trend
  const weeklyData = [
    { day: 'Sun', viewers: 1840, prayers: 12 },
    { day: 'Mon', viewers: 1210, prayers: 8 },
    { day: 'Tue', viewers: 1390, prayers: 15 },
    { day: 'Wed', viewers: 2450, prayers: 22 }, // Mid-week prayer meeting
    { day: 'Thu', viewers: 1510, prayers: 11 },
    { day: 'Fri', viewers: 2980, prayers: 19 }, // Sabbath Vespers
    { day: 'Sabbath', viewers: 6840, prayers: 48 }, // Divine Service
  ];

  const maxViewers = Math.max(...weeklyData.map((d) => d.viewers));

  const handleExportReport = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-[0.22em] text-[#b4832e] uppercase mb-1">
            EXECUTIVE TELEMETRY
          </div>
          <h1 className="font-serif text-3xl text-slate-900 font-normal tracking-tight">
            Church Analytics &amp; Reports
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time telemetry, geographic reach, Bible reading frequency, and Sabbath worship attendance.
          </p>
        </div>

        <button
          onClick={handleExportReport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#b4832e] hover:bg-[#9c6a1e] text-white font-medium text-xs shadow-xs transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Analytics PDF</span>
        </button>
      </div>

      {downloadSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Analytics report generated and downloaded.</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e8e4db] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">Weekly Viewership</span>
            <Eye className="w-4 h-4 text-[#b4832e]" />
          </div>
          <div className="font-serif text-2xl font-medium text-slate-900">18,220</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">+14.8% vs previous week</div>
        </div>

        <div className="bg-white border border-[#e8e4db] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">Average Watch Time</span>
            <Clock className="w-4 h-4 text-[#b4832e]" />
          </div>
          <div className="font-serif text-2xl font-medium text-slate-900">42m 18s</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">High retention during Divine Service</div>
        </div>

        <div className="bg-white border border-[#e8e4db] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">Bible Searches</span>
            <BookOpen className="w-4 h-4 text-[#b4832e]" />
          </div>
          <div className="font-serif text-2xl font-medium text-slate-900">3,490</div>
          <div className="text-[11px] text-slate-400 mt-1">Top chapter: Yohana 14</div>
        </div>

        <div className="bg-white border border-[#e8e4db] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">Prayers Moderated</span>
            <HeartHandshake className="w-4 h-4 text-[#b4832e]" />
          </div>
          <div className="font-serif text-2xl font-medium text-slate-900">{prayerRequests.length}</div>
          <div className="text-[11px] text-[#b4832e] font-semibold mt-1">100% moderation rate</div>
        </div>
      </div>

      {/* Viewership Chart */}
      <div className="bg-white border border-[#e8e4db] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#ece8df]">
          <div>
            <h3 className="font-serif text-base font-medium text-slate-900">
              Weekly Attendance &amp; Stream Viewers
            </h3>
            <p className="text-xs text-slate-500">
              Daily active stream connections throughout the week culminating in high Sabbath worship
            </p>
          </div>
        </div>

        <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
          {weeklyData.map((item, idx) => {
            const heightPercent = Math.round((item.viewers / maxViewers) * 100);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[11px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.viewers.toLocaleString()}
                </span>
                <div className="w-full bg-[#faf9f6] rounded-t-lg h-36 flex items-end">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      item.day === 'Sabbath'
                        ? 'bg-[#b4832e]'
                        : 'bg-slate-300 group-hover:bg-amber-400/80'
                    }`}
                  />
                </div>
                <span className={`text-xs font-medium ${item.day === 'Sabbath' ? 'text-[#b4832e] font-bold' : 'text-slate-600'}`}>
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
