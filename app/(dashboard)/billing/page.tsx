import { auth } from '@/lib/auth';
import { getDynamicPlanConfigs, PlanTier } from '@/lib/plans';
import BillingView from '@/components/billing-view';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = { title: 'Paket & Langganan — License Guard' };

export default async function BillingPage() {
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN';
  const currentPlan = (isAdmin ? 'MAX' : ((session?.user as { plan?: PlanTier })?.plan || 'FREE')) as PlanTier;
  const user = {
    username: session?.user?.name || 'Developer',
    email: session?.user?.email || '—',
    phone: (session?.user as { phone?: string })?.phone || '—',
  };

  const dynamicConfigs = await getDynamicPlanConfigs();

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Paket &amp; Langganan Lisensi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pilih kapasitas lisensi website klien yang sesuai dengan skala bisnis pengembangan Anda
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-xs self-start md:self-auto">
          <span className="text-xs text-slate-500">Paket Akun Anda:</span>
          <span className="text-xs font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {dynamicConfigs[currentPlan]?.name || currentPlan}
          </span>
        </div>
      </div>

      {/* ── Dynamic Billing & Real-time Live Connected View ── */}
      <BillingView
        initialConfigs={dynamicConfigs}
        currentPlan={currentPlan}
        isAdmin={isAdmin}
        user={user}
      />
    </div>
  );
}
