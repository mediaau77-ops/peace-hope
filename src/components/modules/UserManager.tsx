import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { SUPABASE_BUCKETS } from '../../lib/supabase';
import { InlineUploadWidget } from '../common/InlineUploadWidget';
import { MemberUser } from '../../types';
import { EmptyState } from '../common/EmptyState';
import {
  Users,
  Shield,
  Search,
  Download,
  Key,
  Ban,
  CheckCircle,
  Plus,
  Mail,
  Calendar,
  X,
} from 'lucide-react';

export const UserManager: React.FC = () => {
  const { members, updateMemberRole, toggleMemberBan, addMember } = useAdmin();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberUser['role']>('Church Member');
  const [churchBranch, setChurchBranch] = useState('Kigali Central SDA');
  const [avatarUrl, setAvatarUrl] = useState('');

  const filtered = members.filter((m: MemberUser) => {
    if (roleFilter !== 'All' && m.role !== roleFilter) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    addMember({
      name,
      email,
      role,
      churchBranch,
      joinedDate: new Date().toISOString().split('T')[0],
    });

    setName('');
    setEmail('');
    setIsAddOpen(false);
    setNotice(`New member ${name} registered successfully.`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleResetPassword = (m: MemberUser) => {
    setNotice(`Password reset link sent to ${m.email}.`);
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-[0.22em] text-[#b4832e] uppercase mb-1">
            MEMBERSHIP DIRECTORY
          </div>
          <h1 className="font-serif text-3xl text-slate-900 font-normal tracking-tight">
            Congregation Directory ({members.length})
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage church membership roles, ordained pastors, elders, deaconesses, and user access.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#b4832e] hover:bg-[#9c6a1e] text-white font-medium text-xs shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Church Member</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#e8e4db] rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#ece8df]">
              <h3 className="font-serif text-lg font-medium text-slate-900">
                Register Member / Officer
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elder Samuel Bizimana"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#e8e4db] rounded-xl text-slate-900 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="elder@peaceandhope.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#e8e4db] rounded-xl text-slate-900 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Ecclesiastical Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#e8e4db] rounded-xl text-slate-900"
                  >
                    <option value="Church Member">Church Member</option>
                    <option value="Pastor">Pastor</option>
                    <option value="Elder">Church Elder</option>
                    <option value="Deacon">Deacon / Deaconess</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Church Branch / District
                  </label>
                  <input
                    type="text"
                    value={churchBranch}
                    onChange={(e) => setChurchBranch(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#e8e4db] rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Member Photo / ID (`user-avatars` Bucket)
                </label>
                <InlineUploadWidget
                  bucket={SUPABASE_BUCKETS.USER_AVATARS}
                  parentTable="members"
                  parentId="new-member"
                  currentCoverUrl={avatarUrl}
                  onCoverChange={(url) => setAvatarUrl(url)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece8df]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#b4832e] hover:bg-[#9c6a1e] text-white font-medium"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#e8e4db] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {['All', 'Admin', 'Pastor', 'Elder', 'Church Member'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                roleFilter === r
                  ? 'bg-[#fef9ee] text-[#b4832e] border border-[#f5e6c8] font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#e8e4db] rounded-xl text-xs text-slate-900 outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No content has been published yet."
          description="No registered congregation members or church leaders found in Supabase. Click 'Register New Member' to add a profile."
          actionLabel="Register New Member"
          onAction={() => setIsAddOpen(true)}
          tableName="members"
        />
      ) : (
        <div className="bg-white border border-[#e8e4db] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf9f6] text-slate-500 font-semibold border-b border-[#ece8df]">
                <tr>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Church Branch</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ece8df]">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{m.name}</div>
                      <div className="text-[11px] text-slate-400">{m.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fef9ee] text-[#b4832e] border border-[#f5e6c8]">
                        {m.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{m.churchBranch}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{m.joinedDate}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          m.status === 'Suspended'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {m.status === 'Suspended' ? 'SUSPENDED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleResetPassword(m)}
                          className="p-1 rounded text-slate-500 hover:text-slate-800"
                          title="Reset Password Link"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleMemberBan(m.id)}
                          className={`p-1 rounded ${
                            m.status === 'Suspended' ? 'text-emerald-600 hover:text-emerald-700' : 'text-red-500 hover:text-red-700'
                          }`}
                          title={m.status === 'Suspended' ? 'Unsuspend' : 'Suspend Member'}
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
