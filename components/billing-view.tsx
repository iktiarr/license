'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlanConfig, PlanTier, getWhatsAppUpgradeUrl, WHATSAPP_DISPLAY, formatRupiah } from '@/lib/plans';
import {
  Check,
  MessageSquare,
  ArrowUpRight,
  Layers,
  Settings,
  Save,
  AlertCircle,
  Loader2,
  Globe,
  Clock,
  DollarSign,
  LayoutTemplate,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BillingViewProps {
  initialConfigs: Record<PlanTier, PlanConfig>;
  currentPlan: PlanTier;
  isAdmin: boolean;
  user: {
    username: string;
    email: string;
    phone: string;
  };
}

export default function BillingView({
  initialConfigs,
  currentPlan,
  isAdmin,
  user,
}: BillingViewProps) {
  const router = useRouter();
  const [configs, setConfigs] = useState<Record<PlanTier, PlanConfig>>(initialConfigs);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleFieldChange = (
    tier: PlanTier,
    field: 'maxProjects' | 'retentionDays' | 'price' | 'name' | 'tagline' | 'maxLockTemplates',
    value: string | number
  ) => {
    setConfigs((prev) => {
      const numVal = Number(value) || 0;
      const updatedPlan = {
        ...prev[tier],
        [field]: value,
        formattedPrice: field === 'price' ? formatRupiah(numVal) : prev[tier].formattedPrice,
      };

      return {
        ...prev,
        [tier]: updatedPlan,
      };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const payload = Object.values(configs).map((cfg) => ({
        id: cfg.id,
        name: cfg.name,
        price: Number(cfg.price) || 0,
        maxProjects: Number(cfg.maxProjects) || 1,
        retentionDays: Number(cfg.retentionDays) || 0,
        maxLockTemplates: Number(cfg.maxLockTemplates) || 0,
        tagline: cfg.tagline,
      }));

      const res = await fetch('/api/admin/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plans: payload }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatusMessage({ text: data.error || 'Gagal menyimpan pengaturan.', type: 'error' });
      } else {
        setStatusMessage({
          text: 'Pengaturan limit, kuota template layar kunci, dan harga paket berhasil disimpan & diterapkan ke seluruh sistem!',
          type: 'success',
        });
        if (data.plans) {
          setConfigs(data.plans);
        }
        router.refresh();
      }
    } catch {
      setStatusMessage({ text: 'Terjadi kesalahan saat menghubungi server.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const tiers: PlanTier[] = ['FREE', 'PLUS', 'PRO', 'MAX'];

  return (
    <div className="space-y-8">
      {/* ── Admin Dynamic Limits Editor (Visible only to Admin) ── */}
      {isAdmin && (
        <Card className="border-slate-300 bg-white shadow-sm ring-1 ring-slate-200">
          <CardHeader className="py-4 px-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 rounded-t-xl">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-slate-900 text-white rounded-lg">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Pengaturan Limit &amp; Fitur Paket (Khusus Administrator)
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ubah kuota domain, masa retensi log, kuota template layar kunci (.html), dan harga paket
                </p>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-9 cursor-pointer shadow-sm self-start sm:self-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </Button>
          </CardHeader>

          <CardContent className="p-5 space-y-4">
            {statusMessage && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg text-xs border ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tiers.map((tier) => {
                const cfg = configs[tier] || initialConfigs[tier];
                return (
                  <div
                    key={tier}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3.5"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-900 uppercase">
                        Paket {tier}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600 font-mono">
                        {cfg.formattedPrice}
                      </span>
                    </div>

                    {/* 1. Limit Banyaknya Domain */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-sky-600" />
                        <span>Banyaknya Domain (Maks)</span>
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={cfg.maxProjects > 1000 ? 999999 : cfg.maxProjects}
                        onChange={(e) =>
                          handleFieldChange(tier, 'maxProjects', parseInt(e.target.value, 10) || 1)
                        }
                        className="h-8 text-xs bg-white font-mono font-semibold"
                        placeholder="Contoh: 2 atau 3"
                      />
                      <p className="text-[10px] text-slate-500">
                        {cfg.maxProjects > 1000 ? 'Tanpa batas (Unlimited)' : `Maksimal ${cfg.maxProjects} domain`}
                      </p>
                    </div>

                    {/* 2. Retensi Log Penggunaan */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Log Penggunaan (Hari)</span>
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={cfg.retentionDays > 1000 ? 999999 : cfg.retentionDays}
                        onChange={(e) =>
                          handleFieldChange(tier, 'retentionDays', parseInt(e.target.value, 10) || 0)
                        }
                        className="h-8 text-xs bg-white font-mono font-semibold"
                        placeholder="0 untuk tanpa log"
                      />
                      <p className="text-[10px] text-slate-500">
                        {cfg.retentionDays === 0
                          ? 'Tanpa fitur log audit'
                          : cfg.retentionDays > 1000
                          ? 'Log disimpan selamanya'
                          : `Log disimpan ${cfg.retentionDays} hari`}
                      </p>
                    </div>

                    {/* 3. Kuota Template Layar Kunci (.html) */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                        <LayoutTemplate className="w-3.5 h-3.5 text-purple-600" />
                        <span>Template Layar Kunci (.html)</span>
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={cfg.maxLockTemplates ?? 0}
                        onChange={(e) =>
                          handleFieldChange(tier, 'maxLockTemplates', parseInt(e.target.value, 10) || 0)
                        }
                        className="h-8 text-xs bg-white font-mono font-semibold"
                        placeholder="0"
                      />
                      <p className="text-[10px] text-slate-500">
                        {(cfg.maxLockTemplates ?? 0) === 0
                          ? 'Layar kunci standar'
                          : `${cfg.maxLockTemplates} Template kustom`}
                      </p>
                    </div>

                    {/* 4. Harga Paket (IDR) */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Harga Paket (Rp)</span>
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="1000"
                        value={cfg.price}
                        onChange={(e) =>
                          handleFieldChange(tier, 'price', parseInt(e.target.value, 10) || 0)
                        }
                        className="h-8 text-xs bg-white font-mono font-semibold"
                        placeholder="0"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── WhatsApp Instant Activation Banner ── */}
      <div className="flex items-start gap-3.5 p-4 rounded-xl border border-emerald-200 bg-emerald-50/80 text-xs text-slate-800 shadow-xs">
        <div className="p-2 bg-emerald-100 border border-emerald-200 rounded-lg text-emerald-700 shrink-0 mt-0.5">
          <MessageSquare className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <p className="font-bold text-emerald-900">
            Aktivasi Paket Instan via WhatsApp Official ({WHATSAPP_DISPLAY})
          </p>
          <p className="text-slate-600 leading-relaxed">
            Pilih paket di bawah dan klik tombol upgrade untuk langsung terhubung ke Customer Support. Pembayaran mendukung Transfer Bank &amp; QRIS, dan penambahan kuota lisensi akan segera aktif ke akun Anda.
          </p>
        </div>
      </div>

      {/* ── 4-Tier Pricing Grid (Uniform, Clean, Consistent Design) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {tiers.map((planId) => {
          const plan = configs[planId] || initialConfigs[planId];
          const isCurrent = currentPlan === planId;
          const waUrl = getWhatsAppUpgradeUrl(planId, user, plan);

          const maxDomainText =
            plan.maxProjects > 1000
              ? 'Unlimited Project Domain'
              : `Maksimal ${plan.maxProjects} Project Domain`;

          const frameworkText =
            planId === 'FREE'
              ? 'Proteksi Native Web (HTML, PHP, JS)'
              : 'Full Framework & Native (Next.js, React, PHP, dll)';

          const retentionText =
            plan.retentionDays === 0
              ? 'Tanpa riwayat log audit'
              : plan.retentionDays > 1000
              ? 'Unlimited retensi log selamanya'
              : `${plan.retentionDays} Hari retensi log aktivitas`;

          const lockTemplateCount = plan.maxLockTemplates ?? 0;
          const lockTemplateText =
            lockTemplateCount > 0
              ? `${lockTemplateCount} Template Layar Kunci (.html)`
              : 'Layar kunci standar sistem';

          return (
            <div
              key={planId}
              className={`relative rounded-2xl border flex flex-col justify-between p-6 transition-all bg-white shadow-2xs hover:border-slate-300 ${
                isCurrent ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
              }`}
            >
              {/* Top Badge Overlay for Active Plan */}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Paket Aktif</span>
                </div>
              )}

              {/* Card Header & Content */}
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-slate-100 text-slate-800 border-slate-200 uppercase">
                    {plan.name}
                  </span>
                  <Layers className="w-4 h-4 text-slate-400" />
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                      {plan.formattedPrice}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-xs text-slate-500 font-medium">/paket</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 min-h-8 leading-relaxed">
                    {plan.tagline}
                  </p>
                </div>

                {/* Structured Feature Breakdown */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Fitur &amp; Kapasitas Lisensi:
                  </p>

                  <ul className="space-y-2.5 text-xs">
                    {/* 1. Domain Limit */}
                    <li className="flex items-start gap-2 text-slate-800 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{maxDomainText}</span>
                    </li>

                    {/* 2. Framework Type */}
                    <li className="flex items-start gap-2 text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{frameworkText}</span>
                    </li>

                    {/* 3. Lock Screen Customization Template */}
                    <li className="flex items-start gap-2 text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{lockTemplateText}</span>
                    </li>

                    {/* 4. Audit Log Retention */}
                    <li className="flex items-start gap-2 text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{retentionText}</span>
                    </li>

                    {/* 5. Security & Killswitch */}
                    <li className="flex items-start gap-2 text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Remote Killswitch &amp; Anti-Tamper</span>
                    </li>

                    {/* 6. Support WhatsApp */}
                    <li className="flex items-start gap-2 text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{plan.price > 0 ? 'Support WhatsApp Prioritas' : 'Komunitas Support'}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                {isCurrent ? (
                  <Button
                    disabled
                    className="w-full h-10 font-semibold text-xs bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                  >
                    Paket Saat Ini
                  </Button>
                ) : plan.price === 0 ? (
                  <Button
                    disabled
                    className="w-full h-10 font-semibold text-xs bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                  >
                    Paket Standar
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="w-full h-10 font-semibold text-xs bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-xs"
                  >
                    <a href={waUrl} target="_blank" rel="noopener noreferrer">
                      <MessageSquare className="w-3.5 h-3.5 mr-1" />
                      <span>Upgrade via WhatsApp</span>
                      <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
