'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Terminal,
  FolderKanban,
  ScrollText,
  Settings,
  LogOut,
  LayoutDashboard,
  Power,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard, cmd: 'overview' },
  { href: '/projects', label: 'Projects', icon: FolderKanban, cmd: 'projects' },
  { href: '/logs', label: 'Logs', icon: ScrollText, cmd: 'logs' },
  { href: '/settings', label: 'Settings', icon: Settings, cmd: 'settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] shrink-0 h-screen bg-black border-r border-zinc-800 flex flex-col justify-between select-none font-mono">
      {/* Top: Brand Header */}
      <div>
        {/* Titlebar */}
        <div className="h-14 px-4 border-b border-zinc-800 flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-zinc-300 font-semibold tracking-wider">
              root@guard<span className="text-zinc-500">:~$</span>
            </span>
          </div>
          {/* Live indicator */}
          <span
            className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)] animate-pulse"
            title="System Live"
          />
        </div>

        {/* System Info Block */}
        <div className="px-4 py-3 border-b border-zinc-800/60">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">System</p>
          <p className="text-sm text-emerald-400 font-semibold tracking-wide">License Guard v1.0</p>
          <p className="text-[11px] text-zinc-600 mt-0.5">Control Hub &bull; Admin Access</p>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-0.5">
          <p className="px-2.5 py-2 text-xs font-semibold text-zinc-600 uppercase tracking-widest">
            {"// navigation"}
          </p>
          {navItems.map(({ href, label, icon: Icon, cmd }) => {
            const isActive =
              href === '/'
                ? pathname === '/'
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded text-sm transition-all duration-150 group',
                  isActive
                    ? 'bg-zinc-900 text-emerald-400 border border-zinc-800'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/60'
                )}
              >
                {/* Prompt indicator */}
                <span className={cn(
                  'text-[10px] transition-colors',
                  isActive ? 'text-emerald-500' : 'text-zinc-700 group-hover:text-zinc-500'
                )}>
                  {isActive ? '▶' : '·'}
                </span>
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-emerald-400' : 'text-zinc-600 group-hover:text-zinc-400')} />
                <span className="tracking-wide text-sm">{label}</span>
                {isActive && (
                  <span className="ml-auto text-[10px] text-zinc-600 font-mono">
                    {cmd}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Admin Profile & Sign Out */}
      <div className="border-t border-zinc-800 p-3 space-y-2">
        {/* Admin Info */}
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded bg-zinc-900/50 border border-zinc-800/60">
          <div className="w-6 h-6 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <Power className="w-3 h-3 text-emerald-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-zinc-300 truncate">admin@guard</p>
          <p className="text-[10px] text-zinc-600 truncate">root privileges</p>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
        </div>

        {/* Sign Out */}
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-xs text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer tracking-wider"
          >
            <LogOut className="w-3 h-3" />
            <span>exit session</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
