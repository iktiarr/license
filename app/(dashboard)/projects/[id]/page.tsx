import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import LogTable from '@/components/log-table';
import ProjectControls from './controls';
import IntegrationSnippet from '@/components/integration-snippet';
import StatusBadge from '@/components/status-badge';
import ProjectCredentialsCard from '@/components/project-credentials-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPlanConfigById, PlanTier } from '@/lib/plans';
import {
  ArrowLeft,
  Globe,
  Server,
  Clock,
  Calendar,
  Key,
  Activity,
  ShieldCheck,
  AlertCircle,
  User as UserIcon,
  ExternalLink,
  Lock,
  ArrowRight,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = { title: 'Detail Project — License Guard' };

function formatDate(date: Date | null | undefined) {
  if (!date) return 'Belum ada data';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

function formatRelativeTime(date: Date | null | undefined) {
  if (!date) return 'Belum terhubung';
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 2) return 'Online (Baru saja)';
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;

  return formatDate(date);
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN';
  const userPlanTier = (isAdmin ? 'MAX' : ((session?.user as { plan?: PlanTier })?.plan || 'FREE')) as PlanTier;
  const currentUserId = session?.user?.id;

  const [project, planConfig] = await Promise.all([
    db.project.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    }),
    getPlanConfigById(userPlanTier),
  ]);

  const isOwner = project && (!project.userId || project.userId === currentUserId);
  if (!project || (!isAdmin && !isOwner)) {
    const availableProjects = await db.project.findMany({
      where: !isAdmin && currentUserId ? { userId: currentUserId } : undefined,
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, domain: true, status: true },
    });

    return (
      <div className="space-y-6 max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
          <Link href="/projects">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Kembali ke Daftar Projects</span>
          </Link>
        </Button>

        <Card className="p-6 border-slate-200 bg-white">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h1 className="text-base font-bold text-slate-900">
                {!project ? 'Project Tidak Ditemukan (404)' : 'Akses Dibatasi (403)'}
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                {!project
                  ? 'Project dengan ID ini tidak ditemukan di sistem atau telah dihapus.'
                  : 'Anda tidak memiliki hak akses untuk melihat kredensial project milik developer lain.'}
              </p>
            </div>
          </div>

          {availableProjects.length > 0 && (
            <div className="border-t border-slate-100 pt-4 mt-5 space-y-3">
              <p className="text-xs font-semibold text-slate-700">
                Project Anda yang Tersedia Saat Ini:
              </p>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {availableProjects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="flex items-center justify-between p-3 px-4 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <span className="text-sm font-semibold text-slate-900 block">{p.name}</span>
                      <span className="text-xs text-slate-500">{p.domain}</span>
                    </div>
                    <span className="text-xs font-semibold text-sky-600">Buka →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }

  const isLogsLocked = !isAdmin && planConfig.retentionDays === 0;

  const infoRows = [
    { label: 'Domain Target', value: project.domain, icon: Globe, link: `https://${project.domain}` },
    {
      label: 'Pemilik Akun',
      value: project.user ? `${project.user.email} (@${project.user.username})` : 'Unassigned / System',
      icon: UserIcon,
    },
    { label: 'Filter IP Server', value: project.serverIp ?? 'Bebas (Semua IP)', icon: Server },
    { label: 'Toleransi Offline (Grace Period)', value: `${project.gracePeriod} Jam`, icon: Clock },
    { label: 'Heartbeat Terakhir', value: formatDate(project.lastHeartbeat), icon: Activity },
    { label: 'Tanggal Didaftarkan', value: formatDate(project.createdAt), icon: Calendar },
    { label: 'ID Project', value: project.id, icon: Key },
  ];

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb & Action Header ── */}
      <div className="space-y-3">
        <Button asChild variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 -ml-2 h-8 text-xs font-medium">
          <Link href="/projects">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Kembali ke Daftar Projects</span>
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {project.name}
              </h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono">{project.domain}</span>
            </p>
          </div>

          <div className="self-start sm:self-auto">
            <ProjectControls
              project={{
                id: project.id,
                status: project.status,
                name: project.name,
                domain: project.domain,
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Metric Highlights Top Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Status Lisensi */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status Lisensi</span>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                project.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            <span className="text-sm font-bold text-slate-900">
              {project.status === 'ACTIVE' ? 'Aktif (Terverifikasi)' : 'Ditangguhkan (Terkunci)'}
            </span>
          </div>
        </div>

        {/* 2. Heartbeat Terakhir */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Heartbeat Live</span>
          <div className="flex items-center gap-1.5 text-slate-800 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span>{formatRelativeTime(project.lastHeartbeat)}</span>
          </div>
        </div>

        {/* 3. Toleransi Offline */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Grace Period Offline</span>
          <div className="flex items-center gap-1.5 text-slate-800 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{project.gracePeriod} Jam Fail-Safe</span>
          </div>
        </div>

        {/* 4. Filter IP Server */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Server IP Lock</span>
          <div className="flex items-center gap-1.5 text-slate-800 text-xs font-semibold font-mono truncate">
            <Server className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>{project.serverIp ?? 'Bebas (Semua IP)'}</span>
          </div>
        </div>
      </div>

      {/* ── Two Column Grid: Details + Audit Stream ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Project Metadata & Keys (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Metadata Card */}
          <Card className="border-slate-200 bg-white shadow-2xs">
            <CardHeader className="py-3.5 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-700" />
                <CardTitle className="text-sm font-bold text-slate-900">
                  Konfigurasi Lisensi
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100 text-xs">
              {infoRows.map(({ label, value, icon: Icon, link }) => (
                <div
                  key={label}
                  className="p-3.5 px-5 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                >
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{label}</span>
                  </span>
                  {link ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-slate-900 hover:text-sky-600 transition-colors flex items-center gap-1 font-mono text-xs"
                    >
                      <span>{value}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  ) : (
                    <span className="font-semibold text-slate-900 font-mono text-right truncate max-w-48 text-xs">
                      {value}
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Secret API Key & Emergency Bypass Key Card */}
          <ProjectCredentialsCard apiKey={project.apiKey} domain={project.domain} />
        </div>

        {/* Right Column: Audit Logs (7 Cols) */}
        <div className="lg:col-span-7">
          <Card className="border-slate-200 bg-white shadow-2xs">
            <CardHeader className="py-3.5 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-500" />
                <CardTitle className="text-sm font-bold text-slate-900">
                  Riwayat Audit Lisensi
                </CardTitle>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {isLogsLocked ? 'Terkunci' : `${project.logs.length} Event`}
              </span>
            </CardHeader>
            <CardContent className="p-0">
              {isLogsLocked ? (
                <div className="p-8 text-center space-y-3 bg-amber-50/30">
                  <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">
                      Audit Log Terkunci pada Paket {planConfig.name}
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Upgrade akun ke paket PLUS/PRO/MAX untuk melihat rekaman event verifikasi, heartbeat live, dan log deteksi tamper attempt.
                    </p>
                  </div>
                  <Button asChild size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold mt-2">
                    <Link href="/billing">
                      <span>Buka Akses Log di Pricing</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <LogTable logs={project.logs} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Integration Snippet Hub ── */}
      <IntegrationSnippet apiKey={project.apiKey} domain={project.domain} />
    </div>
  );
}
