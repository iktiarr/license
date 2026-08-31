import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import UsersTable from '@/components/users-table';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getDynamicPlanConfigs } from '@/lib/plans';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = { title: 'Manajemen Pengguna — License Guard' };

export default async function UsersManagementPage() {
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN';

  if (!isAdmin) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Button asChild variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Kembali ke Dashboard</span>
          </Link>
        </Button>

        <Card className="p-6 border-slate-200 bg-white">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h1 className="text-base font-bold text-slate-900">
                Akses Terbatas (Khusus Administrator)
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Halaman Manajemen Pengguna ini hanya dapat diakses oleh akun Root Administrator untuk mengelola paket lisensi dan verifikasi akun developer.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const [rawUsers, dynamicPlanConfigs, rawLogs] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        plan: true,
        planExpiresAt: true,
        createdAt: true,
        updatedAt: true,
        projects: {
          select: { id: true },
        },
      },
    }),
    getDynamicPlanConfigs(),
    (async () => {
      try {
        return await db.userLog.findMany({
          take: 100,
          orderBy: { createdAt: 'desc' },
        });
      } catch {
        return [];
      }
    })(),
  ]);

  const users = rawUsers.map((u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    phone: u.phone,
    role: u.role,
    plan: u.plan,
    planStartedAt: u.updatedAt ? u.updatedAt.toISOString() : u.createdAt.toISOString(),
    planExpiresAt: u.planExpiresAt ? u.planExpiresAt.toISOString() : null,
    createdAt: u.createdAt,
    projectsCount: u.projects.length,
  }));

  const logs = rawLogs.map((l) => ({
    id: l.id,
    userId: l.userId,
    username: l.username,
    action: l.action,
    details: l.details,
    ipAddress: l.ipAddress,
    createdAt: l.createdAt.toISOString(),
  }));

  const freeCount = users.filter((u) => u.plan === 'FREE').length;
  const paidCount = users.filter((u) => u.plan !== 'FREE').length;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Manajemen Pengguna &amp; Developer
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {users.length} akun terdaftar ({paidCount} paket berbayar, {freeCount} paket gratis)
        </p>
      </div>

      {/* ── Users & Logs Interactive Management Suite ── */}
      <UsersTable
        initialUsers={users}
        initialLogs={logs}
        planConfigs={dynamicPlanConfigs}
      />
    </div>
  );
}
