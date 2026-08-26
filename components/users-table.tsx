'use client';

import { useState, useTransition } from 'react';
import { PlanTier, PLAN_CONFIGS } from '@/lib/plans';
import { User, Mail, Phone, Calendar, Layers, ShieldCheck, Check, AlertCircle, Loader2 } from 'lucide-react';

interface UserData {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  plan: PlanTier;
  createdAt: Date | string;
  projectsCount: number;
}

export default function UsersTable({ initialUsers }: { initialUsers: UserData[] }) {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handlePlanChange = async (userId: string, newPlan: PlanTier) => {
    setLoadingUserId(userId);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/users/plan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, plan: newPlan }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessage({ text: data.error || 'Gagal mengubah paket.', type: 'error' });
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, plan: newPlan } : u))
        );
        setMessage({ text: data.message || `Paket berhasil diubah ke ${newPlan}`, type: 'success' });
      }
    } catch {
      setMessage({ text: 'Terjadi kesalahan saat menghubungi server.', type: 'error' });
    } finally {
      setLoadingUserId(null);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-4">
      {/* Feedback Message */}
      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded text-xs border animate-fade-in ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="border border-zinc-800 rounded bg-zinc-950 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400">
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Developer</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Kontak / WA</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Paket Aktif</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Projects</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Terdaftar</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-right">Ubah Paket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-600">
                    // Belum ada developer yang terdaftar di sistem.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const planConfig = PLAN_CONFIGS[u.plan] || PLAN_CONFIGS.FREE;
                  const isLoading = loadingUserId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors">
                      {/* Developer Username & Role */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-400">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-bold text-zinc-200">{u.username}</div>
                            <span className="text-[10px] text-zinc-500 uppercase">{u.role}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email & Phone */}
                      <td className="py-3 px-4 text-zinc-400 space-y-0.5">
                        <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                          <Mail className="w-3 h-3 text-zinc-600 shrink-0" />
                          <span className="truncate">{u.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400/90">
                          <Phone className="w-3 h-3 text-emerald-500/70 shrink-0" />
                          <a
                            href={`https://wa.me/${u.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {u.phone}
                          </a>
                        </div>
                      </td>

                      {/* Active Plan Badge */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded border text-[11px] font-bold ${planConfig.badgeColor}`}>
                          <span>●</span>
                          <span>{planConfig.name}</span>
                        </span>
                      </td>

                      {/* Projects Count */}
                      <td className="py-3 px-4">
                        <span className="text-zinc-200 font-bold">{u.projectsCount}</span>
                        <span className="text-zinc-600 text-[10px]">
                          {' '}/ {planConfig.maxProjects > 1000 ? '∞' : planConfig.maxProjects}
                        </span>
                      </td>

                      {/* Registered Date */}
                      <td className="py-3 px-4 text-zinc-500 text-[11px]">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Plan Changer Dropdown */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                          ) : (
                            <select
                              value={u.plan}
                              onChange={(e) => handlePlanChange(u.id, e.target.value as PlanTier)}
                              className="bg-black border border-zinc-700 text-zinc-200 text-xs px-2 py-1 rounded focus:outline-none focus:border-emerald-500 font-mono cursor-pointer"
                            >
                              <option value="FREE">FREE (Rp 0)</option>
                              <option value="PLUS">PLUS (Rp 20k)</option>
                              <option value="PRO">PRO (Rp 50k)</option>
                              <option value="MAX">MAX (Rp 300k)</option>
                            </select>
                          )}
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
  );
}
