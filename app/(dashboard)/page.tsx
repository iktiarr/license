import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import {
  FolderKanban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  Activity,
  Circle,
} from 'lucide-react';

export const metadata: Metadata = { title: 'Dashboard — License Guard' };

async function getStats() {
  const [total, active, suspended, tampered, recentLogs] = await Promise.all([
    db.project.count(),
    db.project.count({ where: { status: 'ACTIVE' } }),
    db.project.count({ where: { status: 'SUSPENDED' } }),
    db.project.count({ where: { status: 'TAMPERED' } }),
    db.activityLog.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { project: { select: { name: true, domain: true } } },
    }),
  ]);
  return { total, active, suspended, tampered, recentLogs };
}

type RecentProject = {
  id: string;
  name: string;
  domain: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TAMPERED';
  lastHeartbeat: Date | null;
};

async function getRecentProjects(): Promise<RecentProject[]> {
  return db.project.findMany({
    take: 5,
    orderBy: { updatedAt: 'desc' },
    select: { id: true, name: true, domain: true, status: true, lastHeartbeat: true },
  }) as Promise<RecentProject[]>;
}

const statusConfig = {
  ACTIVE: { dot: 'bg-emerald-500', text: 'text-emerald-400', label: 'ACTIVE' },
  SUSPENDED: { dot: 'bg-rose-500', text: 'text-rose-400', label: 'SUSPEND' },
  TAMPERED: { dot: 'bg-amber-500', text: 'text-amber-400', label: 'TAMPER' },
};

const eventConfig: Record<string, { color: string; symbol: string }> = {
  REGISTER: { color: 'text-emerald-400', symbol: '+' },
  ACTIVE: { color: 'text-emerald-400', symbol: '▶' },
  SUSPENDED: { color: 'text-rose-400', symbol: '■' },
  DELETED: { color: 'text-zinc-500', symbol: '×' },
  TAMPERED: { color: 'text-amber-400', symbol: '!' },
};

export default async function DashboardPage() {
  const [stats, recentProjects] = await Promise.all([getStats(), getRecentProjects()]);

  return (
    <div className="font-mono space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="text-emerald-500">$</span>
            <span className="text-zinc-300 font-semibold">./overview.sh</span>
            <span className="text-zinc-600">--live</span>
          </div>
          <p className="text-[10px] text-zinc-600 mt-0.5 pl-4">
            // Real-time remote license control &amp; status monitoring
          </p>
        </div>
        <Link
          href="/projects/new"
          id="dashboard-new-project"
          className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 text-black text-xs font-bold rounded hover:bg-emerald-400 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>[ new project ]</span>
        </Link>
      </div>

      {/* ── Stat Grid ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'TOTAL', value: stats.total, icon: FolderKanban, color: 'text-zinc-300', dot: 'bg-zinc-400', desc: 'registered domains' },
          { label: 'ACTIVE', value: stats.active, icon: CheckCircle, color: 'text-emerald-400', dot: 'bg-emerald-500', desc: 'operational' },
          { label: 'SUSPENDED', value: stats.suspended, icon: XCircle, color: 'text-rose-400', dot: 'bg-rose-500', desc: 'access locked' },
          { label: 'TAMPERED', value: stats.tampered, icon: AlertTriangle, color: 'text-amber-400', dot: 'bg-amber-500', desc: 'unauthorized' },
        ].map(({ label, value, icon: Icon, color, dot, desc }) => (
          <div key={label} className="border border-zinc-800 rounded bg-zinc-950 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-semibold text-zinc-600 tracking-widest">{label}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            </div>
            <p className={`text-3xl font-extrabold tracking-tight ${color} mb-1`}>{value}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-700">{desc}</span>
              <Icon className={`w-3.5 h-3.5 ${color} opacity-60`} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Two Column: Projects + Logs ── */}
      <div className="grid grid-cols-5 gap-4">

        {/* Left: Recent Projects */}
        <div className="col-span-2 border border-zinc-800 rounded bg-zinc-950">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/60">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-3 h-3 text-zinc-500" />
              <span className="text-[10px] font-semibold text-zinc-400 tracking-wider">RECENT PROJECTS</span>
            </div>
            <Link href="/projects" className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors">
              <span>all</span>
              <ArrowUpRight className="w-2.5 h-2.5" />
            </Link>
          </div>

          {/* Project List */}
          <div className="divide-y divide-zinc-800/60">
            {recentProjects.length === 0 ? (
              <div className="p-6 text-center text-[11px] text-zinc-600">
                // no projects registered
              </div>
            ) : (
              recentProjects.map((project) => {
                const cfg = statusConfig[project.status];
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-zinc-900/40 transition-colors group"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-[11px] font-semibold text-zinc-300 group-hover:text-white truncate">
                        {project.name}
                      </p>
                      <p className="text-[10px] text-zinc-600 truncate mt-0.5">{project.domain}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      <span className={`text-[9px] font-bold ${cfg.text}`}>{cfg.label}</span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Activity Stream */}
        <div className="col-span-3 border border-zinc-800 rounded bg-zinc-950">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/60">
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3 text-zinc-500" />
              <span className="text-[10px] font-semibold text-zinc-400 tracking-wider">ACTIVITY STREAM</span>
            </div>
            <Link href="/logs" className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors">
              <span>full logs</span>
              <ArrowUpRight className="w-2.5 h-2.5" />
            </Link>
          </div>

          {/* Log Stream */}
          <div className="divide-y divide-zinc-800/40">
            {stats.recentLogs.length === 0 ? (
              <div className="p-6 text-center text-[11px] text-zinc-600">
                // no activity yet
              </div>
            ) : (
              stats.recentLogs.map((log) => {
                const evt = eventConfig[log.event] ?? { color: 'text-zinc-500', symbol: '·' };
                const ts = new Date(log.createdAt);
                const timeStr = ts.toLocaleString('id-ID', {
                  day: '2-digit', month: '2-digit', year: '2-digit',
                  hour: '2-digit', minute: '2-digit',
                }).replace(',', '');

                return (
                  <div key={log.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-900/30 transition-colors">
                    {/* Symbol */}
                    <span className={`text-xs font-bold w-3 text-center shrink-0 ${evt.color}`}>
                      {evt.symbol}
                    </span>
                    {/* Event */}
                    <span className={`text-[10px] font-bold w-16 shrink-0 ${evt.color}`}>
                      {log.event}
                    </span>
                    {/* Project */}
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] text-zinc-300 truncate block">
                        {log.project?.name ?? '—'}
                      </span>
                      <span className="text-[9px] text-zinc-600 truncate block">
                        {log.project?.domain ?? ''}
                      </span>
                    </div>
                    {/* Time */}
                    <span className="text-[9px] text-zinc-700 shrink-0 font-mono">{timeStr}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
