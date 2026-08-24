import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import {
  FolderKanban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  TrendingUp,
  Activity,
} from 'lucide-react';
import StatusBadge from '@/components/status-badge';
import LogTable from '@/components/log-table';

export const metadata: Metadata = { title: 'Dashboard' };

async function getStats() {
  const [total, active, suspended, tampered, recentLogs] = await Promise.all([
    db.project.count(),
    db.project.count({ where: { status: 'ACTIVE' } }),
    db.project.count({ where: { status: 'SUSPENDED' } }),
    db.project.count({ where: { status: 'TAMPERED' } }),
    db.activityLog.findMany({
      take: 10,
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

const statCards = [
  {
    key: 'total',
    label: 'Total Projects',
    icon: FolderKanban,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    glow: 'stat-card-glow-blue',
  },
  {
    key: 'active',
    label: 'Active',
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    glow: 'stat-card-glow-green',
  },
  {
    key: 'suspended',
    label: 'Suspended',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    glow: 'stat-card-glow-red',
  },
  {
    key: 'tampered',
    label: 'Tampered',
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    glow: 'stat-card-glow-amber',
  },
];

export default async function DashboardPage() {
  const [stats, recentProjects] = await Promise.all([getStats(), getRecentProjects()]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Overview of all managed licenses
          </p>
        </div>
        <Link href="/projects/new" className="btn-primary" id="dashboard-new-project">
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-5">
        {statCards.map(({ key, label, icon: Icon, color, bg, glow }, i) => (
          <div
            key={key}
            className={`card ${glow} animate-fade-in-up delay-${(i + 1) * 100}`}
          >
            <div className="card-body">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {stats[key as keyof Pick<typeof stats, 'total' | 'active' | 'suspended' | 'tampered'>] as number}
              </p>
              {key === 'total' && (
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  All registered sites
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-5 gap-6">
        {/* Recent Projects */}
        <div className="col-span-2 card animate-fade-in-up delay-200">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-slate-500" />
              <h2 className="font-semibold text-slate-800 text-sm">Recent Projects</h2>
            </div>
            <Link href="/projects" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentProjects.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-400 text-sm">
                No projects yet
              </div>
            ) : (
              recentProjects.map((project: RecentProject) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">{project.name}</p>
                    <p className="text-xs text-slate-400 truncate">{project.domain}</p>
                  </div>
                  <StatusBadge status={project.status} />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-span-3 card animate-fade-in-up delay-300">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-500" />
              <h2 className="font-semibold text-slate-800 text-sm">Recent Activity</h2>
            </div>
            <Link href="/logs" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              View all →
            </Link>
          </div>
          <LogTable logs={stats.recentLogs} showProject />
        </div>
      </div>
    </div>
  );
}
