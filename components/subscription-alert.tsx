'use client';

import type { Session } from 'next-auth';
import { Clock, Lock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface SubscriptionAlertProps {
  session?: Session | null;
}

export default function SubscriptionAlert({ session }: SubscriptionAlertProps) {
  if (!session?.user) return null;

  const role = (session.user as { role?: string })?.role;
  if (role === 'ADMIN') return null;

  const plan = ((session.user as { plan?: string })?.plan || 'FREE').toUpperCase();
  const planExpiresAt = (session.user as { planExpiresAt?: string | null })?.planExpiresAt;
  const planDaysLeft = (session.user as { planDaysLeft?: number | null })?.planDaysLeft;
  const isPlanExpired = (session.user as { isPlanExpired?: boolean })?.isPlanExpired;

  const adminPhone = '085143975550';
  const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(
    `Halo Superadmin, saya ingin memperpanjang langganan paket ${plan} akun saya (${session.user.email}).`
  )}`;

  // 1. Alert for Expired Subscription
  if (isPlanExpired) {
    return (
      <div className="p-3.5 px-4 rounded-xl border border-rose-200 bg-rose-50/90 text-rose-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 bg-rose-600 text-white rounded-lg shrink-0 mt-0.5">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-rose-950 block">Masa Aktif Paket Berakhir</span>
            <p className="text-rose-800 text-[11px] mt-0.5">
              Langganan Anda telah habis dan akun otomatis dialihkan ke <span className="font-bold">Paket GRATIS</span>. Fitur yang melebihi kuota gratis sementara terkunci.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Button asChild size="sm" className="h-7 text-xs bg-rose-700 hover:bg-rose-800 text-white font-semibold cursor-pointer">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-3 h-3 mr-1" />
              <span>Perpanjang via WA</span>
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-7 text-xs border-rose-300 text-rose-900 hover:bg-rose-100 bg-white font-semibold cursor-pointer">
            <Link href="/billing">
              <span>Lihat Paket</span>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // 2. Alert for 3 Days Before Expiration
  if (plan !== 'FREE' && planDaysLeft !== null && planDaysLeft !== undefined && planDaysLeft <= 3 && planDaysLeft >= 0) {
    const expiryFormatted = planExpiresAt
      ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(planExpiresAt))
      : 'segera';

    return (
      <div className="p-3.5 px-4 rounded-xl border border-amber-300 bg-amber-50/90 text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-300">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 bg-amber-500 text-white rounded-lg shrink-0 mt-0.5 shadow-2xs">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-amber-950 block">
              Peringatan Jatuh Tempo: Paket {plan} Berakhir dalam {planDaysLeft === 0 ? 'Hari Ini' : `${planDaysLeft} Hari Lagi`}!
            </span>
            <p className="text-amber-900 text-[11px] mt-0.5">
              Masa aktif berakhir pada tanggal <span className="font-semibold">{expiryFormatted}</span>. Segera lakukan perpanjangan agar proteksi website &amp; fitur Anda tidak terkunci.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Button asChild size="sm" className="h-7 text-xs bg-amber-800 hover:bg-amber-900 text-white font-semibold cursor-pointer">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-3 h-3 mr-1" />
              <span>Perpanjang Sekarang</span>
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-7 text-xs border-amber-300 text-amber-950 hover:bg-amber-100 bg-white font-semibold cursor-pointer">
            <Link href="/billing">
              <span>Detail Paket</span>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
