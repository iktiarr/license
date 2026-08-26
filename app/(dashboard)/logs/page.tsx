import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import LogTable from '@/components/log-table';
import { PlanTier, PLAN_CONFIGS } from '@/lib/plans';
import { Lock, ArrowRight, ShieldAlert, Sparkles, Layers } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Logs — License Guard' };

const eventMeta: Record<string, { symbol: string; color: string }> = {
  REGISTER: { symbol: '+', color: 'text-emerald-400' },
  ACTIVE: { symbol: '▶', color: 'text-emerald-400' },
  SUSPENDED: { symbol: '■', color: 'text-rose-400' },
  DELETED: { symbol: '×', color: 'text-zinc-500' },
  TAMPERED: { symbol: '!', color: 'text-amber-400' },
  TAMPER_ATTEMPT: { symbol: '!', color: 'text-amber-400' },
  ACTIVATED: { symbol: '▶', color: 'text-emerald-400' },
};

export default async function LogsPage() {
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN';
  const plan = ((session?.user as { plan?: PlanTier })?.plan || (isAdmin ? 'MAX' : 'FREE')) as PlanTier;
  const planConfig = PLAN_CONFIGS[plan] || PLAN_CONFIGS.FREE;

  // Filter logs by plan retention
  let dateFilter: Date | undefined = undefined;
  if (!isAdmin) {
    if (plan === 'PLUS') {
      dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (plan === 'PRO') {
      dateFilter = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    }
  }

  const logs = plan === 'FREE' && !isAdmin
    ? []
    : await db.activityLog.findMany({
        where: dateFilter ? { createdAt: { gte: dateFilter } } : undefined,
        orderBy: { createdAt: 'desc' },
        take: 200,
        include: {
          project: { select: { name: true, domain: true } },
        },
      });

  const counts = logs.reduce<Record<string, number>>((acc, log) => {
    acc[log.event] = (acc[log.event] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="font-mono space-y-5">
      {/* ── Header ── */}
      <div className="border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="text-emerald-500">$</span>
          <span className="text-zinc-300 font-semibold">tail -f ./system.log</span>
        </div>
        <p className="text-xs text-zinc-600 mt-1 pl-4">
          // {logs.length} records loaded &mdash; Retensi log paket {planConfig.name}: {planConfig.retentionDays === 0 ? 'Tidak ada log' : planConfig.retentionDays > 1000 ? 'Unlimited' : `${planConfig.retentionDays} hari`}
        </p>
      </div>

      {/* ── Free Tier Upgrade Notice ── */}
      {plan === 'FREE' && !isAdmin && (
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
                Audit Logs Dinonaktifkan pada Paket Gratis (FREE)
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                // Riwayat audit event &amp; tamper attempt memerlukan paket berbayar
              </p>
            </div>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/80 pt-3">
            Untuk memantau aktivitas live heartbeat, riwayat aktivasi, dan log upaya peretasan domain, silakan upgrade ke paket <span className="text-cyan-400 font-bold">PLUS (7 hari)</span>, <span className="text-emerald-400 font-bold">PRO (15 hari)</span>, atau <span className="text-amber-400 font-bold">MAX (Unlimited)</span>.
          </p>

          <div className="pt-2">
            <Link
              href="/billing"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-400 text-black text-xs font-bold rounded hover:bg-emerald-300 transition-colors shadow-lg shadow-emerald-500/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>[ UPGRADE PAKET UNTUK BUKA LOGS ]</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Event Summary (If logs available) ── */}
      {logs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(counts).map(([event, count]) => {
            const meta = eventMeta[event] ?? { symbol: '·', color: 'text-zinc-500' };
            return (
              <div
                key={event}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-[10px]"
              >
                <span className={`font-bold ${meta.color}`}>{meta.symbol}</span>
                <span className="text-zinc-400">{event}</span>
                <span className="bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-bold text-[9px]">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Log Table ── */}
      {logs.length > 0 && (
        <div className="border border-zinc-800 rounded bg-zinc-950">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/60">
            <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">
              audit stream
            </span>
            <span className="text-xs text-zinc-600">{logs.length} records</span>
          </div>
          <LogTable logs={logs} showProject />
        </div>
      )}
    </div>
  );
}
