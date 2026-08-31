import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getPlanConfigById, PlanTier } from '@/lib/plans';
import {
  Plus,
  Sparkles,
  AlertCircle,
  ArrowRight,
  FolderKanban,
  CheckCircle2,
  PauseCircle,
  PieChart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ProjectTable from '@/components/project-table';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = { title: 'Projects — License Guard' };

export default async function ProjectsPage() {
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN';
  const userId = session?.user?.id;
  const userPlanTier = (isAdmin ? 'MAX' : ((session?.user as { plan?: PlanTier })?.plan || 'FREE')) as PlanTier;

  const [projects, planConfig] = await Promise.all([
    db.project.findMany({
      where: !isAdmin && userId ? { userId } : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        domain: true,
        status: true,
        lastHeartbeat: true,
        serverIp: true,
        createdAt: true,
        apiKey: true,
        userId: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    }),
    getPlanConfigById(userPlanTier),
  ]);

  const activeCount = projects.filter((p) => p.status === 'ACTIVE').length;
  const suspendedCount = projects.filter((p) => p.status === 'SUSPENDED').length;

  const maxDomains = isAdmin ? 999999 : planConfig.maxProjects;
  const isQuotaFull = !isAdmin && projects.length >= maxDomains;
  const quotaDisplay = isAdmin
    ? `${projects.length} Total`
    : `${projects.length}/${maxDomains > 1000 ? '∞' : maxDomains} Domain`;

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Daftar Projects Lisensi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola proteksi domain website klien, pantau status heartbeat live, dan kendalikan remote killswitch
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {isQuotaFull ? (
            <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white shadow-xs font-semibold h-9 text-xs sm:text-sm cursor-pointer">
              <Link href="/billing?reason=quota_full">
                <Sparkles className="w-4 h-4 mr-1.5" />
                <span>Upgrade Kuota Domain</span>
              </Link>
            </Button>
          ) : (
            <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white shadow-xs font-semibold h-9 text-xs sm:text-sm cursor-pointer">
              <Link href="/projects/new" id="projects-new-btn">
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Tambah Project</span>
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Projects */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Project</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{projects.length}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Domain terdaftar</p>
          </div>
        </div>

        {/* 2. Active Projects */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lisensi Aktif</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-emerald-700 font-mono">{activeCount}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Online &amp; terverifikasi</p>
          </div>
        </div>

        {/* 3. Suspended Projects */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ditangguhkan</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
              <PauseCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-rose-700 font-mono">{suspendedCount}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Killswitch aktif</p>
          </div>
        </div>

        {/* 4. Quota Usage */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kapasitas Kuota</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-100">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{quotaDisplay}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Paket {planConfig.name}</p>
          </div>
        </div>
      </div>

      {/* ── Quota Full Alert Banner ── */}
      {isQuotaFull && (
        <Card className="p-4 border-amber-300 bg-amber-50/90 text-amber-900 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 border border-amber-200 rounded-lg text-amber-800 shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-amber-950">
                  Batas Kuota Domain Tercapai ({quotaDisplay})
                </p>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Anda telah menggunakan seluruh kapasitas domain yang tersedia pada paket <strong>{planConfig.name}</strong>. Silakan upgrade paket Anda untuk menambahkan domain baru.
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

      {/* ── Project Table with Built-in Search & Filter ── */}
      <ProjectTable projects={projects} showOwner={isAdmin} />
    </div>
  );
}
