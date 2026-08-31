import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import LogManager from '@/components/log-manager';
import { PlanTier, getPlanConfigById } from '@/lib/plans';
import { Lock, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = { title: 'Audit Logs — License Guard' };

export default async function LogsPage() {
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN';
  const plan = ((session?.user as { plan?: PlanTier })?.plan || (isAdmin ? 'MAX' : 'FREE')) as PlanTier;
  const planConfig = await getPlanConfigById(plan);

  // Filter logs by dynamic plan retention & user project ownership (Personal project logs only)
  const currentUserId = session?.user?.id;
  const whereCondition: Prisma.ActivityLogWhereInput = {};

  if (currentUserId) {
    whereCondition.project = { userId: currentUserId };
  }

  if (!isAdmin && planConfig.retentionDays > 0 && planConfig.retentionDays < 1000) {
    const now = new Date();
    const retentionDate = new Date(now.getTime() - planConfig.retentionDays * 24 * 60 * 60 * 1000);
    whereCondition.createdAt = { gte: retentionDate };
  }

  const isLocked = !isAdmin && planConfig.retentionDays === 0;

  const rawLogs = isLocked
    ? []
    : await db.activityLog.findMany({
        where: Object.keys(whereCondition).length > 0 ? whereCondition : undefined,
        orderBy: { createdAt: 'desc' },
        take: 500,
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

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Riwayat Audit &amp; Event Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {formattedLogs.length} catatan aktivitas &mdash; Retensi paket <strong>{planConfig.name}</strong>:{' '}
            {planConfig.retentionDays === 0
              ? 'Tanpa log audit'
              : planConfig.retentionDays > 1000
              ? 'Unlimited (Selamanya)'
              : `${planConfig.retentionDays} hari`}
          </p>
        </div>

        {isLocked && (
          <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-9 font-semibold shadow-sm self-start sm:self-auto">
            <Link href="/billing?feature=logs">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              <span>Buka Kunci Fitur Logs</span>
            </Link>
          </Button>
        )}
      </div>

      {/* ── Locked Feature Notice (For FREE plan) ── */}
      {isLocked && (
        <Card className="p-6 border-amber-300 bg-amber-50/90 text-slate-800 shadow-xs space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-amber-100 border border-amber-200 rounded-xl text-amber-800 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-amber-950">
                  Fitur Audit Logs Terkunci pada Paket {planConfig.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Terkunci</span>
                </span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                Paket <strong>{planConfig.name}</strong> tidak menyertakan penyimpanan riwayat audit log aktivitas. Untuk memantau rekaman live heartbeat, riwayat aktivasi, dan log deteksi upaya peretasan domain (tamper attempt), silakan upgrade ke paket berbayar.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-[11px] text-amber-800 font-medium">
              Tersedia mulai dari paket PLUS dengan harga terjangkau.
            </p>
            <Button asChild className="bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold h-9 shadow-sm">
              <Link href="/billing">
                <Lock className="w-3.5 h-3.5 mr-1.5" />
                <span>Buka Akses Logs di Halaman Pricing</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </Card>
      )}

      {/* ── Retention Limitation Notice (For PLUS/PRO with limited days) ── */}
      {!isLocked && !isAdmin && planConfig.retentionDays < 1000 && (
        <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-sky-950 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-sky-700 shrink-0" />
            <span>
              Riwayat log dibatasi <strong>{planConfig.retentionDays} hari</strong> terakhir sesuai paket Anda ({planConfig.name}). Log lebih lama otomatis diarsipkan.
            </span>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0 bg-white border-sky-300 text-sky-900 hover:bg-sky-100 text-xs h-7 font-semibold">
            <Link href="/billing">
              <span>Upgrade ke Unlimited</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        </div>
      )}

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

      {/* ── Interactive Log Manager (Export JSON/TXT/Excel + Hapus Permanen) ── */}
      {!isLocked && (
        <LogManager initialLogs={formattedLogs} showProject />
      )}
    </div>
  );
}
