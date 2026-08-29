import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { PlanTier, PLAN_CONFIGS } from '@/lib/plans';
import LockTemplatesManager from '@/components/lock-templates-manager';
import { LayoutTemplate, ArrowLeft, Lock, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = { title: 'Kustomisasi Layar Kunci — License Guard' };

export default async function LockScreenTemplatesPage() {
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN';
  const plan = (isAdmin ? 'MAX' : ((session?.user as { plan?: PlanTier })?.plan || 'FREE')) as PlanTier;
  const planConfig = PLAN_CONFIGS[plan] || PLAN_CONFIGS.FREE;
  const userId = session?.user?.id;

  const isLocked = !isAdmin && planConfig.maxLockTemplates <= 0;

  // Query user templates & projects
  const [templates, projects] = await Promise.all([
    !isLocked && userId
      ? db.lockTemplate.findMany({
          where: isAdmin ? undefined : { userId },
          orderBy: { updatedAt: 'desc' },
          include: {
            projects: {
              select: { id: true, name: true, domain: true },
            },
          },
        })
      : Promise.resolve([]),
    userId
      ? db.project.findMany({
          where: isAdmin ? undefined : { userId },
          select: { id: true, name: true, domain: true, templateId: true },
          orderBy: { updatedAt: 'desc' },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Kustomisasi Layar Kunci (.html)
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white shadow-2xs">
              {isAdmin ? 'ADMIN' : planConfig.name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Unggah dan sesuaikan tampilan berkas HTML kustom saat website klien ditangguhkan
          </p>
        </div>

        {/* Quota Badge */}
        {!isLocked && (
          <div className="flex items-center gap-2 self-start sm:self-auto bg-white border border-slate-200 rounded-xl px-3.5 py-2 shadow-2xs">
            <LayoutTemplate className="w-4 h-4 text-slate-700" />
            <div className="text-right">
              <span className="text-xs font-bold text-slate-900 block">
                {templates.length} / {isAdmin ? '∞' : planConfig.maxLockTemplates} Template
              </span>
              <span className="text-[10px] text-slate-500">Kuota Tersedia</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Locked View for FREE / PLUS ── */}
      {isLocked ? (
        <Card className="p-8 border-amber-200 bg-linear-to-b from-amber-50/50 to-white text-center space-y-5 max-w-2xl mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Fitur Eksklusif PRO &amp; MAX</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Kustomisasi Layar Kunci Terkunci
            </h2>
            <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
              Anda saat ini menggunakan paket <span className="font-semibold text-slate-900">{planConfig.name}</span>. Upgrade akun ke <span className="font-bold text-emerald-700">PRO (3 Template)</span> atau <span className="font-bold text-amber-700">MAX (10 Template)</span> untuk mengunggah template HTML kustom, pesan tagihan, atau halaman pemeliharaan brand Anda sendiri.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-9 cursor-pointer shadow-xs">
              <Link href="/billing">
                <span>Upgrade ke PRO / MAX</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="text-xs h-9 font-medium">
              <Link href="/projects">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>Kembali ke Projects</span>
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <LockTemplatesManager
          initialTemplates={templates}
          projects={projects}
          maxTemplates={isAdmin ? 999 : planConfig.maxLockTemplates}
        />
      )}
    </div>
  );
}
