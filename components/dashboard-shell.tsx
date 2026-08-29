'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import type { Session } from 'next-auth';
import { Menu, Shield } from 'lucide-react';
import Link from 'next/link';
import { InstallAppButton } from '@/components/pwa-installer';
import SubscriptionAlert from '@/components/subscription-alert';

export default function DashboardShell({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Desktop Sidebar (Fixed Left) */}
      <div className="hidden lg:flex shrink-0 h-full">
        <Sidebar session={session} />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer Sidebar */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <Sidebar session={session} onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile Top Navigation Bar */}
        <header className="lg:hidden h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Buka Menu Navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <span>License Guard</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <InstallAppButton className="text-[11px] px-2 py-1" />
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <SubscriptionAlert session={session} />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
