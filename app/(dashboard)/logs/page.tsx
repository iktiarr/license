import type { Metadata } from 'next';
import { db } from '@/lib/db';
import LogTable from '@/components/log-table';

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
  const logs = await db.activityLog.findMany({
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
        <p className="text-[10px] text-zinc-600 mt-0.5 pl-4">
          // {logs.length} records loaded &mdash; audit trail semua event lisensi
        </p>
      </div>

      {/* ── Event Summary ── */}
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

      {/* ── Log Table ── */}
      <div className="border border-zinc-800 rounded bg-zinc-950">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/60">
          <span className="text-[10px] font-semibold text-zinc-400 tracking-wider uppercase">
            audit stream
          </span>
          <span className="text-[10px] text-zinc-600">{logs.length} records</span>
        </div>
        <LogTable logs={logs} showProject />
      </div>
    </div>
  );
}
