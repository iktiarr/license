import { auth } from '@/lib/auth';
import { PLAN_CONFIGS, PlanTier, getWhatsAppUpgradeUrl, WHATSAPP_DISPLAY } from '@/lib/plans';
import { Check, Zap, MessageSquare, Shield, Sparkles, ArrowUpRight, Crown, Layers, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'Subscription & Billing — License Guard' };

export default async function BillingPage() {
  const session = await auth();
  const currentPlan = ((session?.user as { plan?: PlanTier })?.plan || 'FREE') as PlanTier;
  const user = {
    username: session?.user?.name || 'Developer',
    email: session?.user?.email || '—',
    phone: (session?.user as { phone?: string })?.phone || '—',
  };

  const plans: PlanTier[] = ['FREE', 'PLUS', 'PRO', 'MAX'];

  return (
    <div className="font-mono space-y-8 max-w-6xl">
      {/* ── Header ── */}
      <div className="border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="text-emerald-500">$</span>
          <span className="text-zinc-200 font-bold">./subscription.sh --plans</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
          <div>
            <h1 className="text-lg font-bold text-zinc-100 tracking-wide">
              Subscription &amp; Monetization Tiers
            </h1>
            <p className="text-xs text-zinc-500 mt-1 pl-4">
              // Pilih paket lisensi yang sesuai dengan kebutuhan kapasitas deployment website Anda
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 self-start">
            <span className="text-xs text-zinc-500">Status Paket:</span>
            <span className="text-xs font-bold font-mono text-emerald-400 uppercase">
              ● {PLAN_CONFIGS[currentPlan]?.name || currentPlan}
            </span>
          </div>
        </div>
      </div>

      {/* ── WhatsApp Payment Notice Banner ── */}
      <div className="flex items-start gap-3 p-4 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-xs text-zinc-300">
        <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-emerald-400">
            Aktivasi Paket Instan via WhatsApp Official ({WHATSAPP_DISPLAY})
          </p>
          <p className="text-zinc-400 leading-relaxed">
            Pilih paket di bawah dan klik tombol upgrade untuk terhubung langsung dengan Customer Support. Pembayaran mendukung Transfer Bank &amp; QRIS, dan lisensi akan langsung diaktifkan ke akun Anda.
          </p>
        </div>
      </div>

      {/* ── 4-Tier Pricing Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
        {plans.map((planId) => {
          const plan = PLAN_CONFIGS[planId];
          const isCurrent = currentPlan === planId;
          const isPopular = plan.popular;
          const isMax = planId === 'MAX';
          const waUrl = getWhatsAppUpgradeUrl(planId, user);

          return (
            <div
              key={planId}
              className={`relative rounded-xl border flex flex-col justify-between p-5 transition-all ${
                isCurrent
                  ? 'bg-zinc-900/90 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50'
                  : isPopular
                  ? 'bg-zinc-950 border-emerald-500/50 shadow-lg'
                  : isMax
                  ? 'bg-zinc-950 border-amber-500/40'
                  : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Badges */}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-wider shadow">
                  ACTIVE PLAN
                </div>
              )}
              {!isCurrent && isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-zinc-100 text-black text-[10px] font-bold uppercase tracking-wider shadow">
                  MOST POPULAR
                </div>
              )}
              {!isCurrent && isMax && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-bold uppercase tracking-wider shadow flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  <span>UNLIMITED</span>
                </div>
              )}

              {/* Plan Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase ${plan.badgeColor}`}>
                    {plan.name}
                  </span>
                  {planId === 'MAX' ? (
                    <Crown className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Layers className="w-4 h-4 text-zinc-600" />
                  )}
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-zinc-100 tracking-tight">
                      {plan.formattedPrice}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-xs text-zinc-500">/paket</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 min-h-[32px] leading-relaxed">
                    {plan.tagline}
                  </p>
                </div>

                {/* Specs List */}
                <div className="border-t border-zinc-800/80 pt-4 space-y-2.5">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    {"// KAPASITAS & FITUR"}
                  </p>
                  <ul className="space-y-2 text-xs">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-zinc-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* CTA Action Button */}
              <div className="mt-6 pt-4 border-t border-zinc-800/80">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-3 rounded bg-zinc-800 text-zinc-400 font-bold text-xs uppercase tracking-wider cursor-default text-center"
                  >
                    [ CURRENT PLAN ]
                  </button>
                ) : plan.price === 0 ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-3 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 font-bold text-xs uppercase tracking-wider cursor-default text-center"
                  >
                    [ DEFAULT PLAN ]
                  </button>
                ) : (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-2.5 px-3 rounded font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                      isPopular
                        ? 'bg-emerald-400 hover:bg-emerald-300 text-black shadow-lg shadow-emerald-500/20'
                        : isMax
                        ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-500/20'
                        : 'bg-zinc-100 hover:bg-emerald-400 text-black'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>UPGRADE VIA WA</span>
                    <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Additional Info Card ── */}
      <div className="border border-zinc-800 rounded bg-zinc-950 p-6 space-y-3">
        <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Informasi Aktivasi &amp; Garansi Lisensi</span>
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Semua paket berbayar diaktivasi langsung secara otomatis setelah konfirmasi pembayaran via WhatsApp official. Apabila membutuhkan paket custom khusus enterprise atau integrasi on-premise, silakan hubungi tim kami melalui nomor WhatsApp resmi: <span className="text-emerald-400 font-bold">{WHATSAPP_DISPLAY}</span>.
        </p>
      </div>
    </div>
  );
}
