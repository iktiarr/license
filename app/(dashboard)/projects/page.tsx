import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getPlanConfigById, PlanTier } from '@/lib/plans';
import { Plus, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Daftar Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kapasitas: <strong className="text-slate-800">{quotaDisplay}</strong> ({activeCount} aktif, {suspendedCount} ditangguhkan)
            {isAdmin && ' — Mode Administrator'}
          </p>
        </div>

        {isQuotaFull ? (
          <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm font-semibold h-9 text-xs sm:text-sm cursor-pointer self-start sm:self-auto">
            <Link href="/billing?reason=quota_full">
              <Sparkles className="w-4 h-4 mr-1.5" />
              <span>Upgrade Kuota Domain</span>
            </Link>
          </Button>
        ) : (
          <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm font-semibold h-9 text-xs sm:text-sm cursor-pointer self-start sm:self-auto">
            <Link href="/projects/new" id="projects-new-btn">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Tambah Project</span>
            </Link>
          </Button>
        )}
      </div>

      {/* ── Quota Full Alert Banner ── */}
      {isQuotaFull && (
        <Card className="p-4 border-amber-300 bg-amber-50/90 text-amber-900 shadow-xs">
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

      {/* ── Table Card ── */}
      <Card className="border-slate-200 bg-white overflow-hidden">
        <CardHeader className="py-4 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-900">Semua Domain Terproteksi</CardTitle>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {quotaDisplay}
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <ProjectTable projects={projects} showOwner={isAdmin} />
        </CardContent>
      </Card>
    </div>
  );
}
