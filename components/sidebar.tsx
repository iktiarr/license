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
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Session } from 'next-auth';
import { PlanTier, PLAN_CONFIGS } from '@/lib/plans';
import { InstallAppButton } from '@/components/pwa-installer';

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

  const baseNavItems = [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/projects', label: 'Projects', icon: FolderKanban },
    {
      href: '/templates',
      label: 'Layar Kunci',
      icon: LayoutTemplate,
      badge: planTier === 'PRO' || planTier === 'MAX' || isAdmin ? undefined : 'PRO',
    },
    { href: '/logs', label: 'Audit Logs', icon: ScrollText },
    { href: '/billing', label: 'Pricing & Plan', icon: CreditCard },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const navItems = isAdmin
    ? [
        ...baseNavItems.slice(0, 5),
        { href: '/users', label: 'User Management', icon: Users, badge: undefined },
        ...baseNavItems.slice(5),
      ]
    : baseNavItems;

  return (
    <aside className="w-64 h-full bg-white border-r border-slate-200 flex flex-col justify-between select-none">
      {/* Top: Brand Header & Navigation */}
      <div className="flex-1 overflow-y-auto">
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2.5 font-semibold text-slate-900 group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm group-hover:bg-slate-800 transition-colors">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-slate-900 block leading-tight">
                License Guard
              </span>
              <span className="text-[11px] font-normal text-slate-500 block leading-tight">
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

        {/* Navigation Menu */}
        <div className="p-3 space-y-1">
          <p className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Menu Utama
          </p>
          <nav className="space-y-0.5">
            {navItems.map(({ href, label, icon: Icon, badge }) => {
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
                    'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-colors',
                        isActive ? 'text-slate-900' : 'text-slate-400'
                      )}
                    />
                    <span className="truncate">{label}</span>
                  </div>
                  {badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom: PWA, Profile Card & Logout */}
      <div className="p-3 border-t border-slate-100 space-y-3 bg-slate-50/50">
        {/* PWA Download Button */}
        <div className="px-1">
          <InstallAppButton className="w-full justify-center shadow-xs" />
        </div>

        {/* User Card */}
        <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
            <p className="text-[11px] text-slate-500 truncate">{userEmail || (isAdmin ? 'Root Administrator' : 'Developer')}</p>
          </div>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
            {planConfig.name}
          </span>
        </div>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-100"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Sesi</span>
        </button>
      </div>
    </aside>
  );
}
