import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getPlanConfigById, PlanTier } from '@/lib/plans';
import {
  FolderKanban,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  Activity,
  Globe,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/status-badge';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = { title: 'Dashboard — License Guard' };

async function getStats(userId?: string, isAdmin?: boolean) {
  const whereProject = !isAdmin && userId ? { userId } : {};
  const [total, active, suspended, tampered, recentLogs] = await Promise.all([
    db.project.count({ where: whereProject }),
    db.project.count({ where: { ...whereProject, status: 'ACTIVE' } }),
    db.project.count({ where: { ...whereProject, status: 'SUSPENDED' } }),
    db.project.count({ where: { ...whereProject, status: 'TAMPERED' } }),
    db.activityLog.findMany({
      where: !isAdmin && userId ? { project: { userId } } : undefined,
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

async function getRecentProjects(userId?: string, isAdmin?: boolean): Promise<RecentProject[]> {
  return db.project.findMany({
    where: !isAdmin && userId ? { userId } : undefined,
    take: 5,
    orderBy: { updatedAt: 'desc' },
    select: { id: true, name: true, domain: true, status: true, lastHeartbeat: true },
  }) as Promise<RecentProject[]>;
}

const eventBadgeMap: Record<string, { label: string; variant: 'success' | 'destructive' | 'warning' | 'secondary' }> = {
  REGISTER: { label: 'Terdaftar', variant: 'success' },
  ACTIVE: { label: 'Diaktifkan', variant: 'success' },
  ACTIVATED: { label: 'Diaktifkan', variant: 'success' },
  SUSPENDED: { label: 'Ditangguhkan', variant: 'destructive' },
  DELETED: { label: 'Dihapus', variant: 'secondary' },
  TAMPERED: { label: 'Upaya Hack', variant: 'warning' },
  TAMPER_ATTEMPT: { label: 'Upaya Hack', variant: 'warning' },
};

export default async function DashboardPage() {
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN';
  const userId = session?.user?.id;
  const userPlanTier = (isAdmin ? 'MAX' : ((session?.user as { plan?: PlanTier })?.plan || 'FREE')) as PlanTier;

  const [stats, recentProjects, planConfig] = await Promise.all([
    getStats(userId, isAdmin),
    getRecentProjects(userId, isAdmin),
    getPlanConfigById(userPlanTier),
  ]);

  const maxDomains = isAdmin ? 999999 : planConfig.maxProjects;
  const isQuotaFull = !isAdmin && stats.total >= maxDomains;
  const domainDisplay = isAdmin
    ? `${stats.total} Domain`
    : `${stats.total}/${maxDomains > 1000 ? '∞' : maxDomains}`;

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <Badge variant="secondary" className="text-xs font-semibold">
              Paket: {planConfig.name}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitoring status lisensi real-time &amp; kendali remote killswitch website klien
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isQuotaFull ? (
            <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm font-semibold h-9 text-xs sm:text-sm cursor-pointer">
              <Link href="/billing?reason=quota_full">
                <Sparkles className="w-4 h-4 mr-1.5" />
                <span>Upgrade Kuota Domain</span>
              </Link>
            </Button>
          ) : (
            <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm font-semibold h-9 text-xs sm:text-sm cursor-pointer">
              <Link href="/projects/new">
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Daftarkan Project Baru</span>
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* ── Quota Full Alert Banner (If user has hit limit) ── */}
      {isQuotaFull && (
        <Card className="p-4 border-amber-300 bg-amber-50/90 text-amber-900 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 border border-amber-200 rounded-lg text-amber-800 shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-amber-950">
                  Batas Kuota Domain Tercapai ({domainDisplay})
                </p>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Anda telah menggunakan seluruh kapasitas domain yang tersedia pada paket <strong>{planConfig.name}</strong>. Untuk menambahkan domain website baru, silakan tingkatkan paket lisensi Anda.
                </p>
              </div>
            </div>

            <Button asChild size="sm" className="shrink-0 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs h-8 cursor-pointer">
              <Link href="/billing">
                <span>Pilih Paket &amp; Upgrade</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </Card>
      )}

      {/* ── Stat Cards Grid (With 0/2 Quota Display) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Domain Quota */}
        <Card className={`p-5 flex items-center justify-between border-slate-200 bg-white ${isQuotaFull ? 'ring-2 ring-amber-400/50' : ''}`}>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-slate-500">Kapasitas Domain</p>
              {isQuotaFull && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                  Penuh
                </span>
              )}
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1 font-mono">
              {domainDisplay}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isAdmin ? 'Akses tanpa batas' : `${stats.total} dari ${maxDomains > 1000 ? '∞' : maxDomains} domain terdaftar`}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center border bg-sky-50 text-sky-700 border-sky-100">
            <FolderKanban className="w-5 h-5" />
          </div>
        </Card>

        {/* Card 2: Lisensi Aktif */}
        <Card className="p-5 flex items-center justify-between border-slate-200 bg-white">
          <div>
            <p className="text-xs font-semibold text-slate-500">Lisensi Aktif</p>
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1 font-mono">
              {stats.active}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Berjalan normal</p>
          </div>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center border bg-emerald-50 text-emerald-700 border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>

        {/* Card 3: Ditangguhkan (Killswitch) */}
        <Card className="p-5 flex items-center justify-between border-slate-200 bg-white">
          <div>
            <p className="text-xs font-semibold text-slate-500">Ditangguhkan</p>
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1 font-mono">
              {stats.suspended}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Akses dikunci remote</p>
          </div>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center border bg-rose-50 text-rose-700 border-rose-100">
            <XCircle className="w-5 h-5" />
          </div>
        </Card>

        {/* Card 4: Retensi Log & Upaya Tamper */}
        <Card className="p-5 flex items-center justify-between border-slate-200 bg-white">
          <div>
            <p className="text-xs font-semibold text-slate-500">Retensi Log Audit</p>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              {planConfig.retentionDays === 0
                ? 'Tanpa Log'
                : planConfig.retentionDays > 1000
                ? 'Unlimited'
                : `${planConfig.retentionDays} Hari`}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {stats.tampered > 0 ? `${stats.tampered} upaya hack tercatat` : 'Penyimpanan riwayat audit'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center border bg-amber-50 text-amber-700 border-amber-100">
            <Clock className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* ── Two Column Content: Projects + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Projects (5 Cols) */}
        <div className="lg:col-span-5">
          <Card className="border-slate-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between py-4 px-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-slate-500" />
                <CardTitle className="text-sm font-bold text-slate-900">Project Terbaru</CardTitle>
              </div>
              <Link
                href="/projects"
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-slate-100">
              {recentProjects.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  <p>Belum ada project yang didaftarkan.</p>
                  <Link
                    href={isQuotaFull ? '/billing' : '/projects/new'}
                    className="inline-block mt-2 font-semibold text-sky-600 hover:underline"
                  >
                    {isQuotaFull ? 'Upgrade paket untuk mulai' : '+ Buat project pertama'}
                  </Link>
                </div>
              ) : (
                recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors group"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-sky-600 transition-colors truncate">
                        {project.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 truncate">
                        <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{project.domain}</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <StatusBadge status={project.status} />
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Activity Stream (7 Cols) */}
        <div className="lg:col-span-7">
          <Card className="border-slate-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between py-4 px-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-500" />
                <CardTitle className="text-sm font-bold text-slate-900">Aktivitas &amp; Log Lisensi</CardTitle>
              </div>
              <Link
                href="/logs"
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors"
              >
                <span>Log Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-slate-100">
              {stats.recentLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Belum ada aktivitas lisensi yang tercatat.
                </div>
              ) : (
                stats.recentLogs.map((log) => {
                  const badge = eventBadgeMap[log.event] || { label: log.event, variant: 'secondary' as const };
                  const ts = new Date(log.createdAt);
                  const timeStr = ts.toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={log.id}
                      className="p-3.5 px-5 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge variant={badge.variant} className="shrink-0 text-[10px] px-2 py-0.5">
                          {badge.label}
                        </Badge>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {log.project?.name || 'Project'}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {log.project?.domain || ''}
                          </p>
                        </div>
                      </div>

                      <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                        {timeStr}
                      </span>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
