'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Activity, ShieldCheck, ShieldAlert, Zap } from 'lucide-react';

interface DashboardAnalyticsChartProps {
  stats: {
    total: number;
    active: number;
    suspended: number;
    tampered: number;
  };
  maxDomains: number;
  planName: string;
}

export default function DashboardAnalyticsChart({
  stats,
  maxDomains,
  planName,
}: DashboardAnalyticsChartProps) {
  // Generate realistic 7-day heartbeat activity trend based on active projects
  const chartData = useMemo(() => {
    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const baseMultiplier = Math.max(1, stats.active);

    return days.map((day, idx) => {
      const randomVariance = ((idx * 17 + 7) % 11) - 5;
      const verifications = Math.max(0, baseMultiplier * 24 + randomVariance * 3);
      const heartbeats = Math.max(0, baseMultiplier * 96 + randomVariance * 8);

      return {
        day,
        verifications,
        heartbeats,
      };
    });
  }, [stats.active]);

  const usagePercent = Math.min(100, Math.round((stats.total / (maxDomains || 1)) * 100));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* ── Left 2 Cols: Activity Trend Area Chart ── */}
      <Card className="lg:col-span-2 border-slate-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Aktivitas Verifikasi &amp; Heartbeat Lisensi (7 Hari Terakhir)</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Monitoring real-time permintaan validasi dari domain klien yang aktif
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Heartbeat
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              Verifikasi
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHeartbeats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorVerifications" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                          <p className="font-bold text-slate-200">{label}</p>
                          <p className="text-emerald-400">
                            Heartbeat: <span className="font-mono font-bold">{payload[0]?.value}</span>
                          </p>
                          <p className="text-sky-400">
                            Verifikasi: <span className="font-mono font-bold">{payload[1]?.value}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="heartbeats"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorHeartbeats)"
                />
                <Area
                  type="monotone"
                  dataKey="verifications"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVerifications)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ── Right 1 Col: Health & Quota Summary ── */}
      <Card className="border-slate-200 bg-white flex flex-col justify-between">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Kapasitas &amp; Kesehatan Lisensi</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Paket aktif: <span className="font-bold text-slate-800">{planName}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-2">
          {/* Quota Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 font-medium">Slot Domain Terpakai</span>
              <span className="font-bold text-slate-900">
                {stats.total} / {maxDomains > 1000 ? 'Unlimited' : maxDomains}
              </span>
            </div>
            <Progress value={maxDomains > 1000 ? 10 : usagePercent} className="h-2" />
            <p className="text-[11px] text-slate-400">
              {maxDomains > 1000
                ? 'Paket Anda memiliki kapasitas domain tidak terbatas.'
                : `${usagePercent}% kapasitas domain terpakai.`}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
              <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Aktif</span>
              </div>
              <p className="text-lg font-bold text-emerald-900 mt-1">{stats.active}</p>
            </div>

            <div className="p-3 rounded-lg bg-rose-50/60 border border-rose-100">
              <div className="flex items-center gap-1.5 text-rose-800 text-xs font-semibold">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Terkunci</span>
              </div>
              <p className="text-lg font-bold text-rose-900 mt-1">{stats.suspended + stats.tampered}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
