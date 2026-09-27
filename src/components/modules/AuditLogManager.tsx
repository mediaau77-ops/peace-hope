import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { AuditLogEntry } from '../../types';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Trash2,
  Clock,
  User,
  Activity,
  Layers,
} from 'lucide-react';

export const AuditLogManager: React.FC = () => {
  const { auditLogs, clearAuditLogs, currentUser } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.module.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesModule = selectedModule === 'all' || log.module === selectedModule;
    const matchesAction = selectedAction === 'all' || log.actionType === selectedAction;

    return matchesSearch && matchesModule && matchesAction;
  });

  const handleExportLogs = () => {
    const blob = new Blob([JSON.stringify(auditLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `peace-hope-audit-log-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActionBadgeColor = (action: AuditLogEntry['actionType']) => {
    switch (action) {
      case 'CREATE':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'UPDATE':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300';
      case 'DELETE':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
      case 'MODERATE':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'SETTINGS_CHANGE':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="text-[11px] font-bold tracking-[0.22em] text-[#b4832e] dark:text-amber-400 uppercase mb-1">
            SECURITY &amp; COMPLIANCE
          </div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Security Audit Log
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Immutable chronological record of administrative actions, moderation events, and system updates.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportLogs}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          {currentUser?.role === 'Super Admin' && (
            <button
              onClick={() => {
                if (confirm('Clear audit logs history? This action is permanent.')) {
                  clearAuditLogs();
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, details, admin user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Modules</option>
            <option value="Chat Management">Chat Management</option>
            <option value="Meetings">Meetings</option>
            <option value="Announcements">Announcements</option>
            <option value="Sermons">Sermons</option>
            <option value="Prayer Center">Prayer Center</option>
            <option value="Users">Users</option>
            <option value="Settings">Settings</option>
          </select>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Action Types</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="MODERATE">MODERATE</option>
            <option value="SETTINGS_CHANGE">SETTINGS_CHANGE</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No audit log records match the current filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Admin User</th>
                  <th className="p-3">Module</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Details</th>
                  <th className="p-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                      <div>{log.userName}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{log.userRole}</span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                      {log.module}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${getActionBadgeColor(
                          log.actionType
                        )}`}
                      >
                        {log.actionType}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300 max-w-md">
                      {log.details}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
