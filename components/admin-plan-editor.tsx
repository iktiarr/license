'use client';

import { useState } from 'react';
import { PlanConfig, PlanTier, formatRupiah } from '@/lib/plans';
import { Settings, Save, Check, AlertCircle, Loader2, Globe, Clock, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminPlanEditorProps {
  initialConfigs: Record<PlanTier, PlanConfig>;
}

export default function AdminPlanEditor({ initialConfigs }: AdminPlanEditorProps) {
  const [configs, setConfigs] = useState(initialConfigs);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleFieldChange = (
    tier: PlanTier,
    field: 'maxProjects' | 'retentionDays' | 'price' | 'name' | 'tagline',
    value: string | number
  ) => {
    setConfigs((prev) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        [field]: value,
        formattedPrice: field === 'price' ? formatRupiah(Number(value) || 0) : prev[tier].formattedPrice,
      },
    }));
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
        setStatusMessage({ text: 'Pengaturan limit dan fitur paket berhasil disimpan & diterapkan real-time!', type: 'success' });
        if (data.plans) {
          setConfigs(data.plans);
        }
      }
    } catch {
      setStatusMessage({ text: 'Terjadi kesalahan saat menghubungi server.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const tiers: PlanTier[] = ['FREE', 'PLUS', 'PRO', 'MAX'];

  return (
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
              Atur kuota banyaknya domain &amp; masa retensi log aktivitas untuk tiap paket lisensi
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
                  <span className="text-[11px] font-semibold text-slate-500">
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

                {/* 3. Harga Paket (IDR) */}
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
  );
}
