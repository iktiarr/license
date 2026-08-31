'use client';

import { useState } from 'react';
import {
  Key,
  Terminal,
  Copy,
  Check,
  Code2,
  Lock,
  Server,
  ChevronRight,
  Play,
  ShieldCheck,
  X,
} from 'lucide-react';
import IntegrationSnippet from '@/components/integration-snippet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyXz7vE1k...
-----END PUBLIC KEY-----`;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'cli' | 'sdk' | 'rsa' | 'api' | 'security'>('cli');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedCliId, setSelectedCliId] = useState<string>('cmd-init');
  const [showModal, setShowModal] = useState<boolean>(false);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const menuItems = [
    {
      id: 'cli' as const,
      label: 'Perintah CLI',
      desc: 'Cheat sheet & simulasi terminal',
      icon: Terminal,
      badge: '7 Perintah',
    },
    {
      id: 'sdk' as const,
      label: 'Hub SDK Klien',
      desc: 'Snippet frontend & backend',
      icon: Code2,
      badge: 'Multi-bahasa',
    },
    {
      id: 'rsa' as const,
      label: 'RSA Public Key',
      desc: 'Kunci verifikasi offline',
      icon: Key,
      badge: 'RSA-2048',
    },
    {
      id: 'api' as const,
      label: 'REST API Reference',
      desc: 'Endpoint HTTP langsung',
      icon: Server,
      badge: '4 Rute',
    },
    {
      id: 'security' as const,
      label: 'Keamanan & Anti-Tamper',
      desc: 'Whitelist & killswitch',
      icon: Lock,
      badge: 'Aktif',
    },
  ];

  const cliCommands = [
    {
      id: 'cmd-init',
      name: 'Inisialisasi & Setup Project (Wizard)',
      cmd: 'npx @masdannn/license-guard init',
      alias: 'npx @masdannn/license-guard',
      desc: 'Inisialisasi lisensi interaktif: memasukkan Nama Project, Domain Target, dan Email Akun Developer untuk pairing instan ke server.',
    },
    {
      id: 'cmd-status',
      name: 'Cek Status Lisensi Live',
      cmd: 'npx @masdannn/license-guard status',
      alias: 'view / info',
      desc: 'Memeriksa status lisensi aktif langsung dari server pusat (ACTIVE, SUSPENDED, atau TAMPERED).',
    },
    {
      id: 'cmd-doctor',
      name: 'Health Check & Diagnostic Tool',
      cmd: 'npx @masdannn/license-guard doctor',
      alias: 'check / diag (Rahasia)',
      desc: 'Melakukan diagnosa komprehensif 5-tahap: integritas file helper, validasi konfigurasi lokal, kompatibilitas framework, dan uji latency ping jaringan ke server pusat.',
    },
    {
      id: 'cmd-bypass',
      name: 'Emergency Bypass & Offline Unlock',
      cmd: 'npx @masdannn/license-guard bypass [TOKEN]',
      alias: 'unlock / recover (Rahasia)',
      desc: 'Membuka kunci website klien secara offline (fail-safe) menggunakan Emergency Bypass Token jika server down atau jaringan tertutup.',
    },
    {
      id: 'cmd-update',
      name: 'Update Otomatis ke Versi Terbaru (v3.0)',
      cmd: 'npx @masdannn/license-guard update',
      alias: 'Rahasia (Developer Only)',
      desc: 'Memperbarui package @masdannn/license-guard ke versi paling mutakhir dan memperbarui konfigurasi proyek secara otomatis.',
    },
    {
      id: 'cmd-finish',
      name: 'Finalisasi & Uninstaller (Bersih Total)',
      cmd: 'npx @masdannn/license-guard finish',
      alias: 'clean / detach',
      desc: 'Menghapus seluruh berkas konfigurasi (.licenseguard.json, license-guard.ts), mencabut injeksi import dari layout/main, dan menghapus dependensi dari package.json saat urusan proyek telah selesai.',
    },
    {
      id: 'cmd-version',
      name: 'Cek Versi Terinstall & Registry',
      cmd: 'npx @masdannn/license-guard version',
      alias: 'Rahasia (Developer Only)',
      desc: 'Mengecek versi CLI yang terpasang di proyek saat ini dan membandingkannya dengan versi rilis terbaru di NPM registry.',
    },
  ];

  const cliOutputs: Record<string, { title: string; lines: Array<{ text: string; color?: string }> }> = {
    'cmd-init': {
      title: 'Output: npx @masdannn/license-guard init',
      lines: [
        { text: '$ npx @masdannn/license-guard init', color: 'text-slate-400' },
        { text: '', color: '' },
        { text: '╔══════════════════════════════════════════════════════════╗', color: 'text-cyan-400 font-bold' },
        { text: '║  🛡️  CENTRALIZED LICENSE GUARD CLI (v3.0.0)             ║', color: 'text-cyan-400 font-bold' },
        { text: '║  Proteksi Lisensi, Anti-Tamper & Remote Killswitch       ║', color: 'text-cyan-400 font-bold' },
        { text: '╚══════════════════════════════════════════════════════════╝', color: 'text-cyan-400 font-bold' },
        { text: '', color: '' },
        { text: 'Terdeteksi Environment: Next.js (App/Pages Router)', color: 'text-amber-300' },
        { text: '', color: '' },
        { text: '? 1. Nama Project (default: toko-klien): Toko Online Fashion Klien', color: 'text-slate-200' },
        { text: '? 2. Domain Website Target: tokofashion.com', color: 'text-slate-200' },
        { text: '? 3. Email Akun Developer: dev@agensi-digital.com', color: 'text-slate-200' },
        { text: '', color: '' },
        { text: 'Menghubungkan ke Central License Guard Server...', color: 'text-slate-400' },
        { text: '✔ Inisialisasi Lisensi Berhasil!', color: 'text-emerald-400 font-bold' },
        { text: '  Project ID  : clx98a42f0001', color: 'text-slate-300' },
        { text: '  Secret Key  : LG-8f4a1c9e2b7d3056e184c902fa11de7b', color: 'text-slate-300' },
        { text: '  Target Host : tokofashion.com', color: 'text-slate-300' },
        { text: '  Status      : ACTIVE (Lisensi Terverifikasi)', color: 'text-emerald-400 font-semibold' },
        { text: '', color: '' },
        { text: 'Menyiapkan berkas proteksi lisensi:', color: 'text-slate-300 font-bold' },
        { text: '  ✔ Dibuat: app/license-guard.ts (Runtime SDK Hook)', color: 'text-emerald-400' },
        { text: '  ✔ Dibuat: .licenseguard.json (Konfigurasi Proyek)', color: 'text-emerald-400' },
        { text: '  ✔ Terhubung ke: app/layout.tsx (Auto Mount Root)', color: 'text-emerald-400' },
        { text: '  ✔ Dependensi @masdannn/license-guard@^3.0.0 ditambahkan ke package.json', color: 'text-emerald-400' },
        { text: '', color: '' },
        { text: '🎉 Project berhasil diamankan dengan Central License Guard!', color: 'text-cyan-300 font-bold' },
      ],
    },
    'cmd-status': {
      title: 'Output: npx @masdannn/license-guard status',
      lines: [
        { text: '$ npx @masdannn/license-guard status', color: 'text-slate-400' },
        { text: '', color: '' },
        { text: '╔══════════════════════════════════════════════════════════╗', color: 'text-cyan-400 font-bold' },
        { text: '║  🛡️  STATUS LISENSI CENTRALIZED LICENSE GUARD (v3.0.0)   ║', color: 'text-cyan-400 font-bold' },
        { text: '╚══════════════════════════════════════════════════════════╝', color: 'text-cyan-400 font-bold' },
        { text: '', color: '' },
        { text: '  Nama Project  : Toko Online Fashion Klien', color: 'text-slate-200 font-bold' },
        { text: '  Domain Target : tokofashion.com', color: 'text-slate-300' },
        { text: '  Status Server : ACTIVE (Online & Terverifikasi) [HTTP 200]', color: 'text-emerald-400 font-bold' },
        { text: '  Heartbeat     : 2 menit yang lalu (Normal)', color: 'text-emerald-300' },
        { text: '  Grace Period  : 24 Jam Toleransi Offline', color: 'text-slate-300' },
        { text: '  Anti-Tamper   : AKTIF (Watchdog & MutationObserver)', color: 'text-purple-300 font-semibold' },
        { text: '  Status Akses  : TERBUKA (Website berjalan normal)', color: 'text-emerald-400 font-bold' },
      ],
    },
    'cmd-doctor': {
      title: 'Output: npx @masdannn/license-guard doctor',
      lines: [
        { text: '$ npx @masdannn/license-guard doctor', color: 'text-slate-400' },
        { text: '', color: '' },
        { text: '╔══════════════════════════════════════════════════════════╗', color: 'text-cyan-400 font-bold' },
        { text: '║  🩺 LICENSE GUARD HEALTH CHECK & DIAGNOSTIC (v3.0.0)     ║', color: 'text-cyan-400 font-bold' },
        { text: '╚══════════════════════════════════════════════════════════╝', color: 'text-cyan-400 font-bold' },
        { text: '', color: '' },
        { text: 'Memeriksa integritas sistem:', color: 'text-slate-300 font-bold' },
        { text: '  ✔ [1/5] Integritas Berkas (.licenseguard.json)   : VALID (OK)', color: 'text-emerald-400' },
        { text: '  ✔ [2/5] Validasi Secret API Key & Obfuscation    : VALID', color: 'text-emerald-400' },
        { text: '  ✔ [3/5] Kompatibilitas Framework (Next.js App)   : TERVERIFIKASI', color: 'text-emerald-400' },
        { text: '  ✔ [4/5] Ping Latensi ke Server Pusat (38ms)      : SANGAT STABIL', color: 'text-emerald-400' },
        { text: '  ✔ [5/5] Anti-Tamper & DOM Protection Watchdog   : AKTIF & SIAGA', color: 'text-emerald-400' },
        { text: '', color: '' },
        { text: 'Hasil Diagnostik: 5/5 Lulus. Sistem proteksi 100% sehat dan andal!', color: 'text-cyan-300 font-bold' },
      ],
    },
    'cmd-bypass': {
      title: 'Output: npx @masdannn/license-guard bypass EBP-8F4A1C92',
      lines: [
        { text: '$ npx @masdannn/license-guard bypass EBP-8F4A1C92', color: 'text-slate-400' },
        { text: '', color: '' },
        { text: '╔══════════════════════════════════════════════════════════╗', color: 'text-rose-400 font-bold' },
        { text: '║  🔑 EMERGENCY OFFLINE UNLOCK (FAIL-SAFE v3.0.0)          ║', color: 'text-rose-400 font-bold' },
        { text: '╚══════════════════════════════════════════════════════════╝', color: 'text-rose-400 font-bold' },
        { text: '', color: '' },
        { text: '  Kunci Pemulihan : EBP-8F4A1C92', color: 'text-rose-300 font-bold' },
        { text: '  Domain Proyek   : tokofashion.com', color: 'text-slate-300' },
        { text: '  Status Validasi : KUNCI DARURAT TERVERIFIKASI!', color: 'text-emerald-400 font-bold' },
        { text: '', color: '' },
        { text: '  ✔ LocalStorage Emergency Flag diaktifkan.', color: 'text-emerald-400' },
        { text: '  ✔ Layar kunci dinonaktifkan secara offline.', color: 'text-emerald-400' },
        { text: '  Website klien kini dapat diakses sementara tanpa koneksi internet pusat.', color: 'text-slate-200' },
      ],
    },
    'cmd-update': {
      title: 'Output: npx @masdannn/license-guard update',
      lines: [
        { text: '$ npx @masdannn/license-guard update', color: 'text-slate-400' },
        { text: '', color: '' },
        { text: '╔══════════════════════════════════════════════════════════╗', color: 'text-cyan-400 font-bold' },
        { text: '║  🔄 AUTO-UPDATE CENTRAL LICENSE GUARD (v3.0.0)           ║', color: 'text-cyan-400 font-bold' },
        { text: '╚══════════════════════════════════════════════════════════╝', color: 'text-cyan-400 font-bold' },
        { text: '', color: '' },
        { text: '  Versi Terpasang : @masdannn/license-guard@2.0.4', color: 'text-slate-400' },
        { text: '  Versi Terbaru   : @masdannn/license-guard@3.0.0', color: 'text-emerald-400 font-bold' },
        { text: '', color: '' },
        { text: '  ✔ Mengunduh dan memperbarui dependensi NPM...', color: 'text-emerald-400' },
        { text: '  ✔ Memperbarui berkas runtime helper ke versi 3.0.0...', color: 'text-emerald-400' },
        { text: '  ✔ Sinkronisasi selesai. Proyek kini berjalan dengan SDK v3.0.0!', color: 'text-cyan-300 font-bold' },
      ],
    },
    'cmd-finish': {
      title: 'Output: npx @masdannn/license-guard finish',
      lines: [
        { text: '$ npx @masdannn/license-guard finish', color: 'text-slate-400' },
        { text: '', color: '' },
        { text: '╔══════════════════════════════════════════════════════════╗', color: 'text-amber-400 font-bold' },
        { text: '║  🧹 FINALISASI & UNINSTALLER BERSIH TOTAL (v3.0.0)       ║', color: 'text-amber-400 font-bold' },
        { text: '╚══════════════════════════════════════════════════════════╝', color: 'text-amber-400 font-bold' },
        { text: '', color: '' },
        { text: '? Yakin ingin mencabut proteksi lisensi dan menghapus modul? (y/N): y', color: 'text-slate-200' },
        { text: '', color: '' },
        { text: '  ✔ Menghapus berkas .licenseguard.json', color: 'text-emerald-400' },
        { text: '  ✔ Menghapus berkas app/license-guard.ts', color: 'text-emerald-400' },
        { text: '  ✔ Mencabut import dari app/layout.tsx', color: 'text-emerald-400' },
        { text: '  ✔ Menghapus dependensi @masdannn/license-guard dari package.json', color: 'text-emerald-400' },
        { text: '', color: '' },
        { text: 'Proyek telah bersih total. Terima kasih telah menggunakan License Guard!', color: 'text-cyan-300 font-bold' },
      ],
    },
    'cmd-version': {
      title: 'Output: npx @masdannn/license-guard version',
      lines: [
        { text: '$ npx @masdannn/license-guard version', color: 'text-slate-400' },
        { text: '', color: '' },
        { text: '  Versi Terinstall : 3.0.0', color: 'text-emerald-400 font-bold' },
        { text: '  NPM Registry     : @masdannn/license-guard@3.0.0 (Latest)', color: 'text-slate-300' },
        { text: '  Status           : Versi paling mutakhir (Up to date)', color: 'text-cyan-300' },
      ],
    },
  };

  const apiEndpoints = [
    {
      id: 'api-register',
      method: 'POST',
      path: '/api/license/register',
      body: '{ apiKey, domain }',
      desc: 'Mendaftarkan website klien & mendapatkan token JWT asimetris',
    },
    {
      id: 'api-heartbeat',
      method: 'POST',
      path: '/api/license/heartbeat',
      body: '{ apiKey, domain, serverIp? }',
      desc: 'Memperbarui status lisensi secara berkala (Killswitch Check)',
    },
    {
      id: 'api-verify',
      method: 'GET',
      path: '/api/license/verify?token=',
      body: null,
      desc: 'Memvalidasi keabsahan token JWT secara langsung ke server',
    },
    {
      id: 'api-pairing-init',
      method: 'POST',
      path: '/api/pairing/init',
      body: '{ name, domain, email, apiKey, framework }',
      desc: 'Endpoint inisialisasi instan via CLI tanpa antrian pairing terhubung ke akun email',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Pengaturan &amp; Dokumentasi Sistem
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Panduan integrasi terminal CLI, SDK multi-bahasa, REST API, dan kebijakan keamanan anti-tamper
        </p>
      </div>

      {/* ── 2-Column Sidebar + Content Layout ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Sub-Sidebar (4 Cols) */}
        <div className="md:col-span-4 space-y-1.5 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
          <p className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Panduan
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`p-1.5 rounded-md mt-0.5 ${isSelected ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {item.label}
                    </p>
                    <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {item.desc}
                    </p>
                  </div>
                </div>

                <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-white translate-x-0.5' : 'text-slate-400'}`} />
              </button>
            );
          })}
        </div>

        {/* Right Content Panel (8 Cols) */}
        <div className="md:col-span-8 space-y-6">
          {/* 1. CLI Commands Section */}
          {activeTab === 'cli' && (
            <div className="space-y-6">
              {/* Commands List Card */}
              <Card className="border-slate-200 bg-white shadow-2xs">
                <CardHeader className="py-4 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-slate-700" />
                    <CardTitle className="text-sm font-bold text-slate-900">
                      Cheat Sheet CLI (@masdannn/license-guard v3.0)
                    </CardTitle>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    7 Perintah
                  </span>
                </CardHeader>

                <CardContent className="p-0 divide-y divide-slate-100">
                  {cliCommands.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors ${
                        selectedCliId === item.id ? 'bg-slate-50/90' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{item.name}</span>
                          <span className="text-[11px] font-mono text-slate-400">alias: {item.alias}</span>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5">
                          <code className="text-xs font-mono font-bold text-slate-800 select-all truncate flex-1">
                            {item.cmd}
                          </code>
                        </div>

                        <p className="text-xs text-slate-500 leading-relaxed pt-0.5">{item.desc}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto mt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCliId(item.id);
                            setShowModal(true);
                          }}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold text-xs h-8 cursor-pointer shadow-2xs flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                          <span>Simulasi</span>
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          onClick={() => copyText(item.cmd, item.id)}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-8 cursor-pointer"
                        >
                          {copiedKey === item.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                              <span>Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 mr-1" />
                              <span>Salin</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* ── Pop-Up Modal: Interactive Terminal Simulator ── */}
              {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
                    {/* Modal Header */}
                    <div className="py-3 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                        </div>
                        <span className="text-xs font-mono text-slate-300 ml-2 font-semibold">
                          terminal — {cliOutputs[selectedCliId]?.title || 'Live Output Preview'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick Command Switcher Tabs inside Modal */}
                    <div className="flex items-center gap-1 px-3 py-2 bg-slate-900/60 border-b border-slate-800/80 overflow-x-auto text-[11px] font-mono">
                      {cliCommands.map((cmd) => (
                        <button
                          key={cmd.id}
                          type="button"
                          onClick={() => setSelectedCliId(cmd.id)}
                          className={`px-2.5 py-1 rounded-md transition-colors shrink-0 cursor-pointer ${
                            selectedCliId === cmd.id
                              ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                          }`}
                        >
                          {cmd.cmd.replace('npx @masdannn/license-guard ', '')}
                        </button>
                      ))}
                    </div>

                    {/* Terminal Logs Body */}
                    <div className="p-4 sm:p-5 font-mono text-xs overflow-y-auto space-y-1 text-slate-200 flex-1 leading-relaxed select-text">
                      {cliOutputs[selectedCliId]?.lines.map((line, idx) => (
                        <div
                          key={idx}
                          className={`${line.color || 'text-slate-300'} whitespace-pre leading-relaxed`}
                        >
                          {line.text || ' '}
                        </div>
                      ))}
                    </div>

                    {/* Modal Footer */}
                    <div className="py-3 px-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        @masdannn/license-guard v3.0.0
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            const cmd = cliCommands.find((c) => c.id === selectedCliId)?.cmd || 'npx @masdannn/license-guard';
                            copyText(cmd, selectedCliId);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-7.5 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          <span>Salin Perintah</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowModal(false)}
                          className="text-slate-400 hover:text-white text-xs h-7.5 cursor-pointer"
                        >
                          Tutup
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Client SDK Hub Section */}
          {activeTab === 'sdk' && (
            <IntegrationSnippet
              apiKey="LG-API-KEY-PROJECT-ANDA"
              domain="client-domain.com"
            />
          )}

          {/* 3. RSA Key Section */}
          {activeTab === 'rsa' && (
            <Card className="border-slate-200 bg-white shadow-2xs">
              <CardHeader className="py-4 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-slate-700" />
                  <CardTitle className="text-sm font-bold text-slate-900">
                    RSA-2048 Public Key Kriptografi
                  </CardTitle>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Dapat Dibagikan
                </span>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Kunci publik ini aman untuk diletakkan di server klien guna memverifikasi keaslian token JWT secara offline tanpa request berulang:
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => copyText(publicKey, 'rsa-pub')}
                    className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-8 cursor-pointer self-start sm:self-auto"
                  >
                    {copiedKey === 'rsa-pub' ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        <span>Salin RSA Key</span>
                      </>
                    )}
                  </Button>
                </div>

                <pre className="font-mono text-xs text-emerald-400 bg-slate-950 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap leading-relaxed overflow-x-auto select-all">
                  {publicKey}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* 4. REST API Endpoints Section */}
          {activeTab === 'api' && (
            <Card className="border-slate-200 bg-white shadow-2xs">
              <CardHeader className="py-4 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-slate-700" />
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Endpoint REST API Langsung
                  </CardTitle>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  HTTP REST
                </span>
              </CardHeader>

              <CardContent className="p-0 divide-y divide-slate-100">
                {apiEndpoints.map((ep) => (
                  <div key={ep.id} className="p-4 sm:p-5 space-y-2 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                          ep.method === 'POST'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <code className="text-xs font-mono font-bold text-slate-900">{ep.path}</code>
                    </div>
                    <p className="text-xs text-slate-500">{ep.desc}</p>
                    {ep.body && (
                      <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Body Payload (JSON):</span>
                        <code className="text-xs font-mono text-slate-700">{ep.body}</code>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 5. Security & Anti-Tamper Policy Section */}
          {activeTab === 'security' && (
            <Card className="border-slate-200 bg-white shadow-2xs">
              <CardHeader className="py-4 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-700" />
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Kebijakan Keamanan &amp; Anti-Tamper SDK v3.0
                  </CardTitle>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Perlindungan Aktif
                </span>
              </CardHeader>

              <CardContent className="p-5 space-y-4 text-xs text-slate-600 leading-relaxed">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>1. Enkripsi Kunci &amp; Obfuscation Payload</span>
                  </p>
                  <p>
                    Kunci lisensi klien yang dihasilkan CLI dienkripsi menggunakan sandi reversible cipher `LGK_` sehingga aman dan tidak mudah dibaca langsung dari kode frontend klien.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>2. DOM Lockdown &amp; MutationObserver Defense</span>
                  </p>
                  <p>
                    Jika penyerang mencoba menghapus elemen overlay layar kunci atau menyembunyikannya melalui DevTools (Inspect Element), SDK akan secara otomatis membuat ulang overlay dalam hitungan milidetik dan melaporkan insiden ke server pusat.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>3. Toleransi Offline &amp; Fail-Safe Recovery</span>
                  </p>
                  <p>
                    Setiap lisensi memiliki masa toleransi offline (Grace Period, default 24 jam). Jika server pusat mengalami gangguan jaringan, website klien tetap dapat berjalan normal dan tersedia kunci Emergency Bypass Token (`EBP-XXXX`) untuk pemulihan offline instan.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
