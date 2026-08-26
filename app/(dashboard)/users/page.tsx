import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import UsersTable from '@/components/users-table';
import { Users as UsersIcon, ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'User Management — License Guard' };

export default async function UsersManagementPage() {
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN';

  if (!isAdmin) {
    return (
      <div className="font-mono space-y-6 max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>cd ../overview</span>
        </Link>

        <div className="p-6 rounded border border-rose-500/30 bg-zinc-950 space-y-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            <h1 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
              Access Restricted (Admin Only)
            </h1>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Halaman Manajemen Pengguna ini hanya dapat diakses oleh akun Root Administrator untuk mengelola paket lisensi dan verifikasi pembayaran developer.
          </p>
        </div>
      </div>
    );
  }

  const rawUsers = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      username: true,
      email: true,
      phone: true,
      role: true,
      plan: true,
      createdAt: true,
      projects: {
        select: { id: true },
      },
    },
  });

  const users = rawUsers.map((u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    phone: u.phone,
    role: u.role,
    plan: u.plan,
    createdAt: u.createdAt,
    projectsCount: u.projects.length,
  }));

  const freeCount = users.filter((u) => u.plan === 'FREE').length;
  const paidCount = users.filter((u) => u.plan !== 'FREE').length;

  return (
    <div className="font-mono space-y-6 max-w-6xl">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="text-emerald-500">$</span>
            <span className="text-zinc-300 font-semibold">get_users --all-accounts</span>
          </div>
          <p className="text-xs text-zinc-600 mt-1 pl-4">
            // {users.length} developer terdaftar &mdash; {paidCount} berbayar (Plus/Pro/Max), {freeCount} gratis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/billing"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-bold rounded hover:bg-emerald-400 hover:text-black hover:border-emerald-400 transition-all"
          >
            <span>[ DAFTAR HARGA PAKET ]</span>
          </Link>
        </div>
      </div>

      {/* ── Users Table ── */}
      <UsersTable initialUsers={users} />
    </div>
  );
}
