'use client';

import { useState } from 'react';
import { PlanTier, PLAN_CONFIGS, PlanConfig } from '@/lib/plans';
import {
  Mail,
  Check,
  AlertCircle,
  Calendar,
  Edit2,
  X,
  MessageCircle,
  UserPlus,
  Search,
  Eye,
  Trash2,
  Activity,
  FolderKanban,
  Users,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';

export interface UserData {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  plan: PlanTier;
  planStartedAt: string | null;
  planExpiresAt: string | null;
  createdAt: Date | string;
  projectsCount: number;
}

export interface UserLogItem {
  id: string;
  userId?: string | null;
  username?: string | null;
  action: string;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: Date | string;
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
    plan: string;
  } | null;
}

export interface UserDetailProject {
  id: string;
  name: string;
  domain: string;
  status: string;
  frameworkType: string;
  createdAt: string;
  lastHeartbeat: string | null;
}

interface UsersTableProps {
  initialUsers: UserData[];
  initialLogs?: UserLogItem[];
  planConfigs?: Record<PlanTier, PlanConfig>;
}

export default function UsersTable({
  initialUsers,
  initialLogs = [],
  planConfigs = PLAN_CONFIGS,
}: UsersTableProps) {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [logs, setLogs] = useState<UserLogItem[]>(initialLogs);
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('ALL');

  const [loadingAction, setLoadingAction] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // ── MODAL 1: Tambah Pengguna State ──
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [addUsername, setAddUsername] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRole, setAddRole] = useState<'DEVELOPER' | 'ADMIN'>('DEVELOPER');
  const [addPlan, setAddPlan] = useState<PlanTier>('FREE');
  const [addDurationDays, setAddDurationDays] = useState<number>(30);
  const [addExpiresAt, setAddExpiresAt] = useState<string>('');

  // ── MODAL 2: Edit Pengguna State ──
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<'DEVELOPER' | 'ADMIN'>('DEVELOPER');
  const [editPassword, setEditPassword] = useState('');
  const [editPlan, setEditPlan] = useState<PlanTier>('FREE');
  const [editStartDate, setEditStartDate] = useState<string>('');
  const [editEndDate, setEditEndDate] = useState<string>('');

  // ── MODAL 3: Detail Pengguna State ──
  const [detailUser, setDetailUser] = useState<UserData | null>(null);
  const [detailProjects, setDetailProjects] = useState<UserDetailProject[]>([]);
  const [detailLogs, setDetailLogs] = useState<UserLogItem[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // ── Helper: Format Date ──
  const formatDate = (dateVal: Date | string | null | undefined) => {
    if (!dateVal) return '—';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  };

  const formatDateTime = (dateVal: Date | string | null | undefined) => {
    if (!dateVal) return '—';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  // ── Helper: Expiry Status ──
  const getExpiryInfo = (expiresAtStr: string | null, plan: PlanTier) => {
    if (plan === 'FREE' || !expiresAtStr) {
      return { label: 'Aktif Selamanya', daysLeft: 9999, isExpired: false, badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
    const expiry = new Date(expiresAtStr);
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { label: 'Kadaluarsa', daysLeft: 0, isExpired: true, badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-bold' };
    }
    if (diffDays <= 3) {
      return { label: `Sisa ${diffDays} Hari`, daysLeft: diffDays, isExpired: false, badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 font-bold animate-pulse' };
    }
    return { label: `Sisa ${diffDays} Hari`, daysLeft: diffDays, isExpired: false, badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
  };

  // ── Open Add User Modal ──
  const handleOpenAddUser = () => {
    setAddUsername('');
    setAddEmail('');
    setAddPhone('');
    setAddPassword('Dev@' + Math.floor(1000 + Math.random() * 9000));
    setAddRole('DEVELOPER');
    setAddPlan('FREE');
    setAddDurationDays(30);

    const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    setAddExpiresAt(future.toISOString().split('T')[0]);

    setIsAddUserOpen(true);
    setMessage(null);
  };

  // ── Save New User ──
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUsername.trim() || !addEmail.trim() || !addPhone.trim() || !addPassword.trim()) {
      setMessage({ text: 'Semua kolom wajib diisi.', type: 'error' });
      return;
    }

    setLoadingAction(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: addUsername.trim(),
          email: addEmail.trim(),
          phone: addPhone.trim(),
          password: addPassword.trim(),
          role: addRole,
          plan: addPlan,
          planExpiresAt: addPlan !== 'FREE' ? addExpiresAt : null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessage({ text: data.error || 'Gagal menambahkan pengguna.', type: 'error' });
      } else {
        setUsers((prev) => [data.user, ...prev]);
        setMessage({ text: data.message || `Pengguna "${addUsername}" berhasil dibuat!`, type: 'success' });
        setIsAddUserOpen(false);
        fetchLogs();
      }
    } catch {
      setMessage({ text: 'Terjadi kesalahan jaringan.', type: 'error' });
    } finally {
      setLoadingAction(false);
    }
  };

  // ── Open Edit User Modal ──
  const handleOpenEditUser = (u: UserData) => {
    setEditingUser(u);
    setEditUsername(u.username);
    setEditEmail(u.email);
    setEditPhone(u.phone || '');
    setEditRole((u.role === 'ADMIN' ? 'ADMIN' : 'DEVELOPER') as 'DEVELOPER' | 'ADMIN');
    setEditPassword('');
    setEditPlan(u.plan);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const startStr = u.planStartedAt ? new Date(u.planStartedAt).toISOString().split('T')[0] : todayStr;
    const endStr = u.planExpiresAt
      ? new Date(u.planExpiresAt).toISOString().split('T')[0]
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setEditStartDate(startStr);
    setEditEndDate(endStr);
    setMessage(null);
  };

  // ── Save Edited User ──
  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setLoadingAction(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: editUsername.trim(),
          email: editEmail.trim(),
          phone: editPhone.trim(),
          role: editRole,
          password: editPassword.trim() ? editPassword.trim() : undefined,
          plan: editPlan,
          planExpiresAt: editPlan !== 'FREE' ? editEndDate : null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessage({ text: data.error || 'Gagal memperbarui data pengguna.', type: 'error' });
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? {
                  ...u,
                  username: editUsername.trim(),
                  email: editEmail.trim(),
                  phone: editPhone.trim(),
                  role: editRole,
                  plan: editPlan,
                  planStartedAt: editPlan !== 'FREE' ? editStartDate : null,
                  planExpiresAt: editPlan !== 'FREE' ? editEndDate : null,
                }
              : u
          )
        );
        setMessage({ text: data.message || 'Perubahan data pengguna berhasil disimpan!', type: 'success' });
        setEditingUser(null);
        fetchLogs();
      }
    } catch {
      setMessage({ text: 'Terjadi kesalahan saat menyimpan perubahan.', type: 'error' });
    } finally {
      setLoadingAction(false);
    }
  };

  // ── Open Detail Modal ──
  const handleOpenDetail = async (u: UserData) => {
    setDetailUser(u);
    setDetailProjects([]);
    setDetailLogs([]);
    setLoadingDetail(true);

    try {
      const res = await fetch(`/api/admin/users/${u.id}`);
      const data = await res.json();
      if (res.ok && data.user) {
        setDetailProjects(data.user.projects || []);
        setDetailLogs(data.user.logs || []);
      }
    } catch (err) {
      console.error('Failed to load user details', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ── Delete User ──
  const handleDeleteUser = async (u: UserData) => {
    if (!confirm(`Hapus pengguna "${u.username}" (${u.email})? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    setLoadingAction(true);
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessage({ text: data.error || 'Gagal menghapus pengguna.', type: 'error' });
      } else {
        setUsers((prev) => prev.filter((item) => item.id !== u.id));
        setMessage({ text: `Pengguna "${u.username}" telah dihapus.`, type: 'success' });
        fetchLogs();
      }
    } catch {
      setMessage({ text: 'Gagal menghapus pengguna.', type: 'error' });
    } finally {
      setLoadingAction(false);
    }
  };

  // ── Fetch User Logs ──
  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/users/logs');
      const data = await res.json();
      if (res.ok && data.logs) {
        setLogs(data.logs);
      }
    } catch { /* ignore */ }
  };

  // ── Filtered Users ──
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery));
    const matchPlan = filterPlan === 'ALL' || u.plan === filterPlan;
    return matchSearch && matchPlan;
  });

  return (
    <div className="space-y-6">
      {/* ── Feedback Message ── */}
      {message && (
        <div
          className={`flex items-center gap-2.5 p-3.5 rounded-xl text-xs border animate-in fade-in duration-200 ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="font-semibold flex-1">{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Top Bar: Tabs & Tambah Pengguna Button ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 self-start">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Daftar Pengguna ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('logs');
              fetchLogs();
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Log Aktivitas ({logs.length})</span>
          </button>
        </div>

        {/* Action: Tambah Pengguna Button (Pop-up Modal Trigger) */}
        <Button
          type="button"
          onClick={handleOpenAddUser}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-9 px-4 font-semibold shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 text-emerald-400" />
          <span>+ Tambah Pengguna</span>
        </Button>
      </div>

      {/* ── TAB 1: DAFTAR PENGGUNA ── */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Cari username, email, atau no telepon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8.5 text-xs bg-slate-50 border-slate-200"
              />
            </div>

            {/* Filter by Plan */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'FREE', 'PLUS', 'PRO', 'MAX'].map((plan) => (
                <button
                  key={plan}
                  type="button"
                  onClick={() => setFilterPlan(plan)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    filterPlan === plan
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {plan}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Pengguna / Kontak</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Paket Lisensi</th>
                    <th className="py-3 px-3">Status Masa Aktif</th>
                    <th className="py-3 px-3">Projects</th>
                    <th className="py-3 px-3">Terdaftar</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400 italic">
                        Tidak ada data pengguna yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const cfg = planConfigs[u.plan] || PLAN_CONFIGS[u.plan] || PLAN_CONFIGS.FREE;
                      const expiry = getExpiryInfo(u.planExpiresAt, u.plan);
                      const cleanPhone = u.phone ? u.phone.replace(/[^0-9]/g, '') : '';
                      const waLink = cleanPhone ? `https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}` : null;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* 1. Pengguna / Kontak */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="w-7 h-7 rounded-lg shrink-0">
                                <AvatarFallback className="rounded-lg text-[10px] font-bold bg-slate-900 text-white w-full h-full flex items-center justify-center">
                                  {u.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 flex items-center gap-1.5 leading-tight">
                                  <span>{u.username}</span>
                                  {u.role === 'ADMIN' && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                      ADMIN
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                                  <span className="flex items-center gap-1 truncate max-w-40">
                                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                    {u.email}
                                  </span>
                                  {u.phone && (
                                    <a
                                      href={waLink || '#'}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 hover:underline font-mono"
                                      title="Kirim Pesan WhatsApp"
                                    >
                                      <MessageCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                                      {u.phone}
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Role */}
                          <td className="py-3.5 px-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                u.role === 'ADMIN'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>

                          {/* 3. Paket Lisensi */}
                          <td className="py-3.5 px-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badgeColor}`}>
                              {cfg.name}
                            </span>
                          </td>

                          {/* 4. Status Masa Aktif */}
                          <td className="py-3.5 px-3">
                            <div className="space-y-0.5">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border inline-block ${expiry.badgeClass}`}>
                                {expiry.label}
                              </span>
                              {u.plan !== 'FREE' && u.planExpiresAt && (
                                <p className="text-[10px] text-slate-400 font-mono">
                                  s/d {formatDate(u.planExpiresAt)}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* 5. Projects */}
                          <td className="py-3.5 px-3">
                            <span className="font-mono text-xs font-semibold text-slate-800">
                              {u.projectsCount} Project
                            </span>
                          </td>

                          {/* 6. Terdaftar */}
                          <td className="py-3.5 px-3 text-[11px] text-slate-500 font-mono">
                            {formatDate(u.createdAt)}
                          </td>

                          {/* 7. Aksi (Pop-up Triggers) */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Detail Button */}
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenDetail(u)}
                                className="h-7 text-xs px-2.5 font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
                                title="Lihat Detail Lengkap Pengguna"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
                                <span>Detail</span>
                              </Button>

                              {/* Edit Button */}
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenEditUser(u)}
                                className="h-7 text-xs px-2.5 font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
                                title="Edit Data Pengguna & Paket"
                              >
                                <Edit2 className="w-3.5 h-3.5 mr-1 text-slate-500" />
                                <span>Edit</span>
                              </Button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Hapus Pengguna"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: LOG AKTIVITAS PENGGUNA (NON POP-UP) ── */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-700" />
              <h2 className="text-xs font-bold text-slate-900">Riwayat Sesi &amp; Aktivitas Akun Pengguna</h2>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={fetchLogs}
              className="h-7 text-xs font-semibold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              <span>Refresh Log</span>
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-3">Aktivitas / Event</th>
                    <th className="py-3 px-3">Pengguna</th>
                    <th className="py-3 px-4">Keterangan Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-slate-400 italic">
                        Belum ada riwayat aktivitas pengguna yang tercatat.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const isLogin = log.action === 'LOGIN';
                      const isCreated = log.action === 'USER_CREATED';
                      const isUpdated = log.action === 'USER_UPDATED';
                      const isDeleted = log.action === 'USER_DELETED';

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Waktu */}
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {formatDateTime(log.createdAt)}
                          </td>

                          {/* Event Action */}
                          <td className="py-3 px-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                                isLogin
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : isCreated
                                  ? 'bg-sky-50 text-sky-800 border-sky-200'
                                  : isUpdated
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : isDeleted
                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {log.action}
                            </span>
                          </td>

                          {/* Username */}
                          <td className="py-3 px-3 font-semibold text-slate-900">
                            {log.username || log.user?.username || '—'}
                          </td>

                          {/* Detail */}
                          <td className="py-3 px-4 text-slate-600 leading-relaxed">
                            {log.details || '—'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── POP-UP MODAL 1: TAMBAH PENGGUNA ── */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="py-4 px-6 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Tambah Akun Pengguna Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Username */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Username *</label>
                  <Input
                    type="text"
                    required
                    placeholder="Contoh: dev_john"
                    value={addUsername}
                    onChange={(e) => setAddUsername(e.target.value)}
                    className="h-8.5 text-xs"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Email *</label>
                  <Input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    className="h-8.5 text-xs"
                  />
                </div>

                {/* WhatsApp Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">No. WhatsApp *</label>
                  <Input
                    type="text"
                    required
                    placeholder="081234567890"
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    className="h-8.5 text-xs"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Password *</label>
                  <Input
                    type="text"
                    required
                    placeholder="Password akun"
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    className="h-8.5 text-xs font-mono"
                  />
                </div>

                {/* Role */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Role Akun</label>
                  <select
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value as 'DEVELOPER' | 'ADMIN')}
                    className="w-full h-8.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="DEVELOPER">DEVELOPER (Pengguna Biasa)</option>
                    <option value="ADMIN">ADMIN (Super Administrator)</option>
                  </select>
                </div>

                {/* Plan Tier */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Paket Langganan</label>
                  <select
                    value={addPlan}
                    onChange={(e) => setAddPlan(e.target.value as PlanTier)}
                    className="w-full h-8.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="FREE">FREE (Gratis - 2 Domain)</option>
                    <option value="PLUS">PLUS (5 Domain - Rp 20.000)</option>
                    <option value="PRO">PRO (10 Domain - Rp 50.000)</option>
                    <option value="MAX">MAX (Unlimited - Rp 300.000)</option>
                  </select>
                </div>
              </div>

              {/* Tanggal Jatuh Tempo (Hanya untuk non-FREE) */}
              {addPlan !== 'FREE' && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Atur Masa Aktif Paket</span>
                    </label>
                    <span className="text-[10px] text-slate-500">Preset Cepat:</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {[
                      { label: '+30 Hari', days: 30 },
                      { label: '+90 Hari', days: 90 },
                      { label: '+1 Tahun', days: 365 },
                    ].map((preset) => (
                      <button
                        key={preset.days}
                        type="button"
                        onClick={() => {
                          setAddDurationDays(preset.days);
                          const future = new Date(Date.now() + preset.days * 24 * 60 * 60 * 1000);
                          setAddExpiresAt(future.toISOString().split('T')[0]);
                        }}
                        className={`flex-1 py-1 rounded-md text-xs font-bold border transition-colors cursor-pointer ${
                          addDurationDays === preset.days
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] text-slate-600">Tanggal Jatuh Tempo:</span>
                    <Input
                      type="date"
                      value={addExpiresAt}
                      onChange={(e) => setAddExpiresAt(e.target.value)}
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddUserOpen(false)}
                  className="h-8 text-xs"
                >
                  Batal
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={loadingAction}
                  className="bg-slate-900 hover:bg-slate-800 text-white h-8 text-xs font-semibold cursor-pointer shadow-xs"
                >
                  {loadingAction ? <Spinner className="mr-1.5" /> : <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />}
                  <span>Simpan Akun Pengguna</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── POP-UP MODAL 2: EDIT PENGGUNA ── */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="py-4 px-6 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Edit Data Pengguna: <span className="text-slate-900 font-mono">{editingUser.username}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Username */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Username</label>
                  <Input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="h-8.5 text-xs"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Email</label>
                  <Input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="h-8.5 text-xs"
                  />
                </div>

                {/* WhatsApp Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">No. WhatsApp</label>
                  <Input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="h-8.5 text-xs"
                  />
                </div>

                {/* Role */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Role Akun</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as 'DEVELOPER' | 'ADMIN')}
                    className="w-full h-8.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="DEVELOPER">DEVELOPER (Pengguna Biasa)</option>
                    <option value="ADMIN">ADMIN (Super Administrator)</option>
                  </select>
                </div>

                {/* Reset Password */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>Ganti / Reset Password Baru (Opsional)</span>
                    <span className="text-[10px] text-slate-400">Kosongkan jika tidak diubah</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Masukkan password baru..."
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="h-8.5 text-xs font-mono"
                  />
                </div>

                {/* Plan Tier */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block">Paket Langganan</label>
                  <select
                    value={editPlan}
                    onChange={(e) => setEditPlan(e.target.value as PlanTier)}
                    className="w-full h-8.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="FREE">FREE (Gratis - 2 Domain)</option>
                    <option value="PLUS">PLUS (5 Domain - Rp 20.000)</option>
                    <option value="PRO">PRO (10 Domain - Rp 50.000)</option>
                    <option value="MAX">MAX (Unlimited - Rp 300.000)</option>
                  </select>
                </div>
              </div>

              {/* Tanggal Jatuh Tempo */}
              {editPlan !== 'FREE' && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Perpanjang Masa Aktif Paket</span>
                    </label>
                    <span className="text-[10px] text-slate-500">Preset Cepat:</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {[
                      { label: '+30 Hari', days: 30 },
                      { label: '+90 Hari', days: 90 },
                      { label: '+1 Tahun', days: 365 },
                    ].map((preset) => (
                      <button
                        key={preset.days}
                        type="button"
                        onClick={() => {
                          const start = editStartDate ? new Date(editStartDate) : new Date();
                          const end = new Date(start.getTime() + preset.days * 24 * 60 * 60 * 1000);
                          setEditEndDate(end.toISOString().split('T')[0]);
                        }}
                        className="flex-1 py-1 rounded-md text-xs font-bold border bg-white text-slate-700 border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-600">Tanggal Mulai:</span>
                      <Input
                        type="date"
                        value={editStartDate}
                        onChange={(e) => setEditStartDate(e.target.value)}
                        className="h-8 text-xs bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-600">Tanggal Jatuh Tempo:</span>
                      <Input
                        type="date"
                        value={editEndDate}
                        onChange={(e) => setEditEndDate(e.target.value)}
                        className="h-8 text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingUser(null)}
                  className="h-8 text-xs"
                >
                  Batal
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={loadingAction}
                  className="bg-slate-900 hover:bg-slate-800 text-white h-8 text-xs font-semibold cursor-pointer shadow-xs"
                >
                  {loadingAction ? <Spinner className="mr-1.5" /> : <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />}
                  <span>Simpan Perubahan</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── POP-UP MODAL 3: DETAIL PENGGUNA ── */}
      {detailUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="py-4 px-6 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Avatar className="w-8 h-8 rounded-lg shrink-0">
                  <AvatarFallback className="rounded-lg bg-slate-900 text-white text-xs font-bold w-full h-full flex items-center justify-center">
                    {detailUser.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{detailUser.username}</h3>
                  <p className="text-[11px] text-slate-500">{detailUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailUser(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Account Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Role Akun</span>
                  <span className="font-bold text-slate-800">{detailUser.role}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Paket Aktif</span>
                  <span className="font-bold text-emerald-700">{detailUser.plan}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Total Project</span>
                  <span className="font-bold text-slate-800">{detailUser.projectsCount} Project</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Status Masa Aktif</span>
                  <span className="font-semibold text-slate-700">
                    {getExpiryInfo(detailUser.planExpiresAt, detailUser.plan).label}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Jatuh Tempo</span>
                  <span className="font-mono text-slate-800">{formatDate(detailUser.planExpiresAt)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Terdaftar Pada</span>
                  <span className="font-mono text-slate-800">{formatDate(detailUser.createdAt)}</span>
                </div>
              </div>

              {/* Daftar Projects Milik Pengguna Ini */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>Daftar Project Terdaftar ({detailProjects.length})</span>
                  <FolderKanban className="w-3.5 h-3.5 text-slate-400" />
                </h4>

                {loadingDetail ? (
                  <div className="space-y-2 p-1">
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </div>
                ) : detailProjects.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400 italic">
                    Pengguna ini belum membuat atau menghubungkan project apapun.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {detailProjects.map((p) => (
                      <div key={p.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50">
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">{p.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono truncate">{p.domain}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                            {p.frameworkType}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              p.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Log Aktivitas Terakhir Pengguna Ini */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>Riwayat Aktivitas Terakhir</span>
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                </h4>

                {detailLogs.length === 0 ? (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center text-[11px] text-slate-400 italic">
                    Belum ada riwayat aktivitas khusus akun ini.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {detailLogs.map((lg) => (
                      <div key={lg.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 text-[11px] space-y-0.5">
                        <div className="flex items-center justify-between text-slate-500 text-[10px]">
                          <span className="font-bold text-slate-800">{lg.action}</span>
                          <span className="font-mono">{formatDateTime(lg.createdAt)}</span>
                        </div>
                        <p className="text-slate-600">{lg.details}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="py-3 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  const u = detailUser;
                  setDetailUser(null);
                  handleOpenEditUser(u);
                }}
                className="h-8 text-xs font-semibold"
              >
                <Edit2 className="w-3.5 h-3.5 mr-1" />
                <span>Edit Akun Ini</span>
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={() => setDetailUser(null)}
                className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
