'use client';

import { useState } from 'react';
import { PlanTier, PLAN_CONFIGS, PlanConfig } from '@/lib/plans';
import { Mail, Phone, Check, AlertCircle, Loader2, Calendar, Edit2, X, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

interface UsersTableProps {
  initialUsers: UserData[];
  planConfigs?: Record<PlanTier, PlanConfig>;
}

export default function UsersTable({ initialUsers, planConfigs = PLAN_CONFIGS }: UsersTableProps) {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editPlan, setEditPlan] = useState<PlanTier>('FREE');
  const [editStartDate, setEditStartDate] = useState<string>('');
  const [editEndDate, setEditEndDate] = useState<string>('');

  const openEditModal = (u: UserData) => {
    setEditingUser(u);
    setEditPlan(u.plan);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const startStr = u.planStartedAt ? new Date(u.planStartedAt).toISOString().split('T')[0] : todayStr;
    const endStr = u.planExpiresAt
      ? new Date(u.planExpiresAt).toISOString().split('T')[0]
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setEditStartDate(startStr);
    setEditEndDate(endStr);
  };

  const applyPresetDuration = (days: number) => {
    const start = editStartDate ? new Date(editStartDate) : new Date();
    const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
    setEditEndDate(end.toISOString().split('T')[0]);
  };

  const handleSavePlanAndDates = async () => {
    if (!editingUser) return;
    setLoadingUserId(editingUser.id);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/users/plan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          plan: editPlan,
          planStartedAt: editPlan !== 'FREE' ? editStartDate : null,
          planExpiresAt: editPlan !== 'FREE' ? editEndDate : null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessage({ text: data.error || 'Gagal menyimpan perubahan paket.', type: 'error' });
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? {
                  ...u,
                  plan: editPlan,
                  planStartedAt: editPlan !== 'FREE' ? editStartDate : null,
                  planExpiresAt: editPlan !== 'FREE' ? editEndDate : null,
                }
              : u
          )
        );
        setMessage({
          text: data.message || `Paket pengguna ${editingUser.username} berhasil diperbarui.`,
          type: 'success',
        });
        setEditingUser(null);
      }
    } catch {
      setMessage({ text: 'Terjadi kesalahan saat menghubungi server.', type: 'error' });
    } finally {
      setLoadingUserId(null);
    }
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '—';
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  const getExpiryStatus = (u: UserData) => {
    if (u.plan === 'FREE') {
      return { text: 'Selamanya (Gratis)', color: 'text-slate-400', badge: 'bg-slate-100 text-slate-600' };
    }
    if (!u.planExpiresAt) {
      return { text: 'Tanpa Batas Waktu', color: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700' };
    }

    const now = new Date();
    const expiry = new Date(u.planExpiresAt);
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: `Kadaluarsa (${formatDate(u.planExpiresAt)})`,
        color: 'text-rose-600 font-bold',
        badge: 'bg-rose-50 text-rose-700 border border-rose-200',
      };
    }
    if (diffDays <= 3) {
      return {
        text: `Sisa ${diffDays === 0 ? 'Hari Ini' : `${diffDays} Hari`} (${formatDate(u.planExpiresAt)})`,
        color: 'text-amber-600 font-bold',
        badge: 'bg-amber-50 text-amber-800 border border-amber-300',
      };
    }
    return {
      text: `Aktif s/d ${formatDate(u.planExpiresAt)} (${diffDays} hari lagi)`,
      color: 'text-emerald-700',
      badge: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    };
  };

  const tiers: PlanTier[] = ['FREE', 'PLUS', 'PRO', 'MAX'];

  return (
    <div className="space-y-4">
      {/* Feedback Alert */}
      {message && (
        <div className="p-4 pb-0">
          <div
            className={`flex items-center gap-2 p-3 rounded-lg text-xs border ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Developer</th>
              <th className="py-3.5 px-4">Kontak (WhatsApp)</th>
              <th className="py-3.5 px-4">Paket Aktif</th>
              <th className="py-3.5 px-4">Masa Aktif / Jatuh Tempo</th>
              <th className="py-3.5 px-4">Domain Limit</th>
              <th className="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-slate-500">
                  Belum ada developer yang terdaftar.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const planConfig = planConfigs[u.plan] || PLAN_CONFIGS[u.plan] || PLAN_CONFIGS.FREE;
                const expiryInfo = getExpiryStatus(u);

                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Developer */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{u.username}</div>
                          <span className="text-[10px] text-slate-400 uppercase">{u.role}</span>
                        </div>
                      </div>
                    </td>

                    {/* Contact & WA */}
                    <td className="py-3.5 px-4 whitespace-nowrap space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px]">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{u.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                        <a
                          href={`https://wa.me/${u.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1"
                        >
                          <span>{u.phone}</span>
                          <MessageCircle className="w-3 h-3 text-emerald-600" />
                        </a>
                      </div>
                    </td>

                    {/* Active Plan */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge
                        variant={
                          u.plan === 'MAX'
                            ? 'warning'
                            : u.plan === 'PRO'
                            ? 'info'
                            : u.plan === 'PLUS'
                            ? 'success'
                            : 'secondary'
                        }
                        className="text-[11px] px-2 py-0.5 font-bold"
                      >
                        {planConfig.name}
                      </Badge>
                    </td>

                    {/* Expiry Date & Active Period */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${expiryInfo.badge}`}>
                          {expiryInfo.text}
                        </span>
                        {u.planStartedAt && u.planExpiresAt && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            {formatDate(u.planStartedAt)} &mdash; {formatDate(u.planExpiresAt)}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Projects Count vs Limit */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900">{u.projectsCount}</span>
                      <span className="text-slate-400 text-xs">
                        {' '}/ {planConfig.maxProjects > 1000 ? '∞' : planConfig.maxProjects}
                      </span>
                    </td>

                    {/* Action: Open Edit Modal */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(u)}
                        className="h-7 text-xs bg-white hover:bg-slate-100 text-slate-800 font-semibold border-slate-300 cursor-pointer shadow-2xs"
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        <span>Atur Paket &amp; Tanggal</span>
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modal / Dialog Atur Paket & Jatuh Tempo ── */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="py-3.5 px-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Atur Paket &amp; Masa Aktif
                </h3>
                <p className="text-xs text-slate-500">
                  Akun: <span className="font-semibold text-slate-800">{editingUser.username}</span> ({editingUser.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Select Plan */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Pilih Paket Lisensi:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {tiers.map((t) => {
                    const cfg = planConfigs[t] || PLAN_CONFIGS[t];
                    const isSelected = editPlan === t;
                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setEditPlan(t)}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-bold text-xs">{t}</div>
                        <div className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {cfg.formattedPrice}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Inputs if Paid Plan */}
              {editPlan !== 'FREE' ? (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Periode Aktif Langganan:</span>
                    </span>
                  </div>

                  {/* Preset Duration Buttons */}
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => applyPresetDuration(30)}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                    >
                      +30 Hari (1 Bln)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetDuration(90)}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                    >
                      +90 Hari (3 Bln)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetDuration(180)}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                    >
                      +6 Bulan
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetDuration(365)}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                    >
                      +1 Tahun
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-600 block">
                        Dari Tanggal (Mulai):
                      </label>
                      <Input
                        type="date"
                        value={editStartDate}
                        onChange={(e) => setEditStartDate(e.target.value)}
                        className="h-8.5 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-600 block">
                        Sampai (Jatuh Tempo):
                      </label>
                      <Input
                        type="date"
                        value={editEndDate}
                        onChange={(e) => setEditEndDate(e.target.value)}
                        className="h-8.5 text-xs"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500">
                    💡 Setelah tanggal jatuh tempo tercapai, akun pengguna akan otomatis dialihkan kembali ke Paket FREE dan fiturnya disesuaikan.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                  Paket <span className="font-semibold text-slate-900">FREE</span> berlaku permanen tanpa masa kadaluarsa (limit 2 domain).
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="py-3 px-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingUser(null)}
                className="h-8 text-xs font-semibold"
              >
                Batal
              </Button>

              <Button
                type="button"
                size="sm"
                disabled={loadingUserId === editingUser.id}
                onClick={handleSavePlanAndDates}
                className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs"
              >
                {loadingUserId === editingUser.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <Check className="w-3.5 h-3.5 mr-1" />
                )}
                <span>Simpan Perubahan</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
