'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  FolderKanban,
  ScrollText,
  Settings,
  LogOut,
  LayoutDashboard,
  CreditCard,
  Users,
  Shield,
  LayoutTemplate,
  Crown,
  X,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Session } from 'next-auth';
import { PlanTier, PLAN_CONFIGS } from '@/lib/plans';
import { InstallAppButton } from '@/components/pwa-installer';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface SidebarProps {
  session?: Session | null;
  onClose?: () => void;
}

export default function Sidebar({ session, onClose }: SidebarProps) {
  const pathname = usePathname();

  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Developer';
  const userEmail = session?.user?.email || '';
  const role = (session?.user as { role?: string })?.role || 'DEVELOPER';
  const isAdmin = role === 'ADMIN';
  const planTier = ((session?.user as { plan?: PlanTier })?.plan || (isAdmin ? 'MAX' : 'FREE')) as PlanTier;
  const planConfig = PLAN_CONFIGS[planTier] || PLAN_CONFIGS.FREE;

  // 1. Group: Proteksi Lisensi (Untuk semua pengguna)
  const coreNavItems = [
    {
      href: '/',
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      href: '/projects',
      label: 'Projects',
      icon: FolderKanban,
    },
    {
      href: '/templates',
      label: 'Layar Kunci',
      icon: LayoutTemplate,
      badge: planTier === 'PRO' || planTier === 'MAX' || isAdmin ? undefined : 'PRO',
    },
    {
      href: '/logs',
      label: 'Audit Logs',
      icon: ScrollText,
    },
  ];

  // 2. Group: Layanan & Akun
  const accountNavItems = [
    {
      href: '/billing',
      label: 'Pricing & Plan',
      icon: CreditCard,
    },
    {
      href: '/settings',
      label: 'Settings & API',
      icon: Settings,
    },
  ];

  // 3. Group: Superadmin (Khusus ADMIN)
  const adminNavItems = [
    {
      href: '/users',
      label: 'User Management',
      icon: Users,
    },
    {
      href: '/global-logs',
      label: 'Global Audit Logs',
      icon: Activity,
    },
  ];

  const renderNavGroup = (
    title: string,
    items: Array<{
      href: string;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      badge?: string;
    }>
  ) => (
    <div className="space-y-1">
      <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        {title}
      </p>

      <nav className="space-y-0.5">
        {items.map(({ href, label, icon: Icon, badge }) => {
          const isActive =
            href === '/'
              ? pathname === '/'
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                isActive
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                  )}
                />
                <span className="truncate">{label}</span>
              </div>

              {badge && (
                <span
                  className={cn(
                    'text-[10px] font-bold px-1.5 py-0.2 rounded border shrink-0',
                    isActive
                      ? 'bg-white/20 text-white border-white/30'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  )}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <aside className="w-64 h-full bg-white border-r border-slate-200 flex flex-col justify-between select-none">
      {/* Top: Header & Navigation */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2.5 font-semibold text-slate-900 group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs group-hover:bg-slate-800 transition-colors">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-slate-900 block leading-tight">
                  License Guard
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  v2.0
                </span>
              </div>
              <span className="text-[11px] font-normal text-slate-400 block leading-tight">
                Control Hub
              </span>
            </div>
          </Link>

          {/* Close button for mobile drawer */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Categories */}
        <div className="p-3 space-y-4">
          {/* 1. Proteksi Lisensi */}
          {renderNavGroup('Proteksi Lisensi', coreNavItems)}

          {/* Divider */}
          <div className="border-t border-slate-100 pt-1" />

          {/* 2. Layanan & Akun */}
          {renderNavGroup('Layanan & Akun', accountNavItems)}

          {/* 3. Superadmin Panel (Hanya Role ADMIN) */}
          {isAdmin && (
            <>
              <div className="border-t border-slate-100 pt-1" />
              {renderNavGroup('Superadmin Panel', adminNavItems)}
            </>
          )}
        </div>
      </div>

      {/* Bottom: PWA, Profile Card & Logout */}
      <div className="p-3 border-t border-slate-100 space-y-2.5 bg-slate-50/50 shrink-0">
        {/* PWA Download Button */}
        <div>
          <InstallAppButton className="w-full justify-center shadow-2xs text-xs h-8" />
        </div>

        {/* User Profile Card */}
        <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2.5">
          <Avatar className="w-8 h-8 rounded-lg shrink-0">
            <AvatarFallback
              className={cn(
                'rounded-lg text-xs font-bold shadow-2xs w-full h-full flex items-center justify-center',
                isAdmin
                  ? 'bg-amber-500 text-white'
                  : planTier === 'PRO'
                  ? 'bg-emerald-600 text-white'
                  : planTier === 'PLUS'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-900 text-white'
              )}
            >
              {isAdmin ? <Crown className="w-4 h-4 text-white" /> : userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate leading-tight">{userName}</p>
            <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
              {isAdmin ? 'Super Administrator' : userEmail || 'Developer'}
            </p>
          </div>
          <span
            className={cn(
              'inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0',
              isAdmin
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : planTier === 'PRO'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : planTier === 'PLUS'
                ? 'bg-sky-50 text-sky-800 border-sky-300'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            )}
          >
            {isAdmin ? 'ADMIN' : planConfig.name}
          </span>
        </div>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-100"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar Sesi</span>
        </button>
      </div>
    </aside>
  );
}
