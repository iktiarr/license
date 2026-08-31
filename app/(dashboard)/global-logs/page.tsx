import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import LogManager from '@/components/log-manager';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = { title: 'Global Audit Logs (Superadmin) — License Guard' };

export default async function GlobalLogsPage() {
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN';

  if (!isAdmin) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Button asChild variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Kembali ke Dashboard</span>
          </Link>
        </Button>

        <Card className="p-6 border-slate-200 bg-white">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h1 className="text-base font-bold text-slate-900">
                Akses Terbatas (Khusus Administrator)
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Halaman Global Audit Logs ini hanya dapat diakses oleh akun Root Administrator untuk memantau rekaman log aktivitas dari seluruh pengguna dan project yang terdaftar di sistem.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Superadmin queries ALL logs without any user restriction
  const rawLogs = await db.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1000,
    include: {
      project: {
        select: {
          name: true,
          domain: true,
          status: true,
          frameworkType: true,
          user: {
            select: {
              username: true,
              email: true,
            },
          },
        },
      },
    },
  });

  const formattedLogs = rawLogs.map((l) => ({
    id: l.id,
    projectId: l.projectId,
    event: l.event,
    ipAddress: l.ipAddress,
    metadata: l.metadata,
    createdAt: l.createdAt.toISOString(),
    project: l.project,
  }));

  const counts = formattedLogs.reduce<Record<string, number>>((acc, log) => {
    acc[log.event] = (acc[log.event] ?? 0) + 1;
    return acc;
  }, {});

  const totalTamper = (counts['TAMPER_ATTEMPT'] || 0) + (counts['TAMPERED'] || 0);
  const totalActive = (counts['ACTIVE'] || 0) + (counts['ACTIVATED'] || 0);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Global Audit Logs
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
              Khusus Superadmin
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rekaman log lengkap dari <strong>seluruh pengguna &amp; project</strong> di sistem ({formattedLogs.length} total event)
          </p>
        </div>
      </div>

      {/* ── Summary Metrics ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Event Global
          </span>
          <p className="text-xl font-extrabold text-slate-900 mt-1 font-mono">{formattedLogs.length}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
            Aktivasi Lisensi
          </span>
          <p className="text-xl font-extrabold text-emerald-800 mt-1 font-mono">{totalActive}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
            Percobaan Hack
          </span>
          <p className="text-xl font-extrabold text-amber-800 mt-1 font-mono">{totalTamper}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
            Ditangguhkan
          </span>
          <p className="text-xl font-extrabold text-rose-800 mt-1 font-mono">{counts['SUSPENDED'] || 0}</p>
        </div>
      </div>

      {/* ── Event Summary Badges ── */}
      {formattedLogs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(counts).map(([event, count]) => (
            <div
              key={event}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs shadow-2xs font-medium text-slate-700"
            >
              <span>{event}</span>
              <span className="bg-slate-100 text-slate-900 px-1.5 py-0.2 rounded-full font-bold text-[10px]">
                {count}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Global Interactive Log Manager ── */}
      <LogManager initialLogs={formattedLogs} showProject />
    </div>
  );
}
