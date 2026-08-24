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
} from 'lucide-react';
import StatusBadge from '@/components/status-badge';
import LogTable from '@/components/log-table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Dashboard — License Guard' };

async function getStats() {
  const [total, active, suspended, tampered, recentLogs] = await Promise.all([
    db.project.count(),
    db.project.count({ where: { status: 'ACTIVE' } }),
    db.project.count({ where: { status: 'SUSPENDED' } }),
    db.project.count({ where: { status: 'TAMPERED' } }),
    db.activityLog.findMany({
      take: 8,
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
    take: 6,
    orderBy: { updatedAt: 'desc' },
    select: { id: true, name: true, domain: true, status: true, lastHeartbeat: true },
  }) as Promise<RecentProject[]>;
}

export default async function DashboardPage() {
  const [stats, recentProjects] = await Promise.all([getStats(), getRecentProjects()]);

  const statItems = [
    {
      label: 'Total Projects',
      value: stats.total,
      icon: FolderKanban,
      color: 'text-zinc-100',
      badgeColor: 'bg-zinc-500',
      desc: 'All registered domains',
    },
    {
      label: 'Active Licenses',
      value: stats.active,
      icon: CheckCircle,
      color: 'text-emerald-400',
      badgeColor: 'bg-emerald-500',
      desc: 'Operational client sites',
    },
    {
      label: 'Suspended',
      value: stats.suspended,
      icon: XCircle,
      color: 'text-rose-400',
      badgeColor: 'bg-rose-500',
      desc: 'Access locked by killswitch',
    },
    {
      label: 'Tamper Detected',
      value: stats.tampered,
      icon: AlertTriangle,
      color: 'text-amber-400',
      badgeColor: 'bg-amber-500',
      desc: 'Unauthorized domain attempts',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">System Overview</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time status monitoring & remote license control
          </p>
        </div>
        <Button asChild variant="default" size="sm">
          <Link href="/projects/new" id="dashboard-new-project">
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </Link>
        </Button>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-4 gap-4">
        {statItems.map(({ label, value, icon: Icon, color, badgeColor, desc }, i) => (
          <Card key={label} className={`border-zinc-800 bg-zinc-900/70 hover:border-zinc-700 transition-colors delay-${(i + 1) * 100}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-zinc-400">{label}</span>
                <span className={`w-2 h-2 rounded-full ${badgeColor}`} />
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-extrabold tracking-tight text-white font-mono">
                  {value}
                </p>
                <Icon className={`w-5 h-5 ${color} opacity-80`} />
              </div>
              <p className="text-[11px] text-zinc-500 mt-2">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two Column Layout (Recent Projects + Recent Activity) */}
      <div className="grid grid-cols-5 gap-6">
        {/* Left: Recent Projects */}
        <div className="col-span-2 space-y-4">
          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-zinc-400" />
                <CardTitle className="text-sm">Recent Projects</CardTitle>
              </div>
              <Link
                href="/projects"
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <div className="divide-y divide-zinc-800/60">
              {recentProjects.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500">
                  No projects registered yet
                </div>
              ) : (
                recentProjects.map((project: RecentProject) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between p-4 hover:bg-zinc-800/40 transition-colors group"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="font-semibold text-xs text-zinc-200 group-hover:text-white truncate">
                        {project.name}
                      </p>
                      <p className="text-[11px] text-zinc-400 font-mono truncate mt-0.5">
                        {project.domain}
                      </p>
                    </div>
                    <StatusBadge status={project.status} />
                  </Link>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right: Recent Activity Log */}
        <div className="col-span-3 space-y-4">
          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-zinc-400" />
                <CardTitle className="text-sm">Recent Activity Stream</CardTitle>
              </div>
              <Link
                href="/logs"
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Full Logs</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <LogTable logs={stats.recentLogs} showProject />
          </Card>
        </div>
      </div>
    </div>
  );
}
