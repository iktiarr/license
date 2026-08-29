'use client';

import { useState } from 'react';
import { Key, Terminal, Copy, Check, Code2, Lock, Server, ChevronRight } from 'lucide-react';
import IntegrationSnippet from '@/components/integration-snippet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyXz7vE1k...
-----END PUBLIC KEY-----`;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'cli' | 'sdk' | 'rsa' | 'api' | 'security'>('cli');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const menuItems = [
    {
      id: 'cli' as const,
      label: 'Perintah CLI',
      desc: 'Cheat sheet & tools terminal',
      icon: Terminal,
      badge: '6 Perintah',
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
      id: 'cmd-version',
      name: 'Cek Versi Terinstall & Registry',
      cmd: 'npx @masdannn/license-guard version',
      alias: 'Rahasia (Developer Only)',
      desc: 'Mengecek versi CLI yang terpasang di proyek saat ini dan membandingkannya dengan versi rilis terbaru di NPM registry.',
    },
    {
      id: 'cmd-update',
      name: 'Update Otomatis ke Versi Terbaru',
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
      desc: 'Membuka kunci website klien secara offline (fail-safe) menggunakan Emergency Bypass Token jika server down atau jaringan tertutup. Gunakan argumen --disable untuk mengembalikan mode online.',
    },
  ];

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
        <div className="md:col-span-8">
          {/* 1. CLI Commands Section */}
          {activeTab === 'cli' && (
            <Card className="border-slate-200 bg-white">
              <CardHeader className="py-4 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-700" />
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Cheat Sheet CLI (@masdannn/license-guard)
                  </CardTitle>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  7 Perintah
                </span>
              </CardHeader>

              <CardContent className="p-0 divide-y divide-slate-100">
                {cliCommands.map((item) => (
                  <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-slate-50/60 transition-colors">
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

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => copyText(item.cmd, item.id)}
                      className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-8 cursor-pointer self-start sm:self-auto mt-1"
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
                ))}
              </CardContent>
            </Card>
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
            <Card className="border-slate-200 bg-white">
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
            <Card className="border-slate-200 bg-white">
              <CardHeader className="py-4 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-slate-700" />
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Endpoint REST API Langsung
                  </CardTitle>
                </div>
                <span className="text-xs text-slate-400 font-medium">CORS Enabled</span>
              </CardHeader>

              <CardContent className="p-0 divide-y divide-slate-100">
                {apiEndpoints.map((api) => (
                  <div key={api.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white shrink-0">
                          {api.method}
                        </span>
                        <code className="text-xs font-mono font-bold text-slate-900">{api.path}</code>
                      </div>
                      {api.body && (
                        <div className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 inline-block">
                          Body: {api.body}
                        </div>
                      )}
                      <p className="text-xs text-slate-500">{api.desc}</p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => copyText(api.path, api.id)}
                      className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-8 cursor-pointer self-start sm:self-auto mt-1"
                    >
                      {copiedKey === api.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          <span>Salin Rute</span>
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 5. Security & Anti-Tamper Section */}
          {activeTab === 'security' && (
            <Card className="border-slate-200 bg-white">
              <CardHeader className="py-4 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Kebijakan Keamanan &amp; Anti-Tamper
                  </CardTitle>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Proteksi Aktif
                </span>
              </CardHeader>

              <CardContent className="p-5 space-y-4 text-xs text-slate-600 leading-relaxed">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <p className="font-bold text-slate-900 text-sm">1. Domain Whitelist Enforcement</p>
                  <p className="text-slate-500 leading-relaxed">
                    Setiap request verifikasi heartbeat dicocokkan dengan domain target yang terdaftar. Jika request berasal dari domain tidak sah, server akan mencatat log <strong>TAMPER_ATTEMPT</strong> dan memblokir instance klien secara otomatis.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <p className="font-bold text-slate-900 text-sm">2. Instant Killswitch &amp; Auto Recovery</p>
                  <p className="text-slate-500 leading-relaxed">
                    Saat status project diubah ke <strong>SUSPENDED</strong> di dashboard, client SDK langsung menampilkan layar penangguhan ke pengunjung website klien. Saat Anda mengaktifkan kembali (<strong>ACTIVE</strong>), website klien otomatis pulih dalam 4 detik tanpa perlu me-reload halaman.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <p className="font-bold text-slate-900 text-sm">3. Enkripsi Kredensial di Sisi Klien</p>
                  <p className="text-slate-500 leading-relaxed">
                    File <code className="px-1.5 py-0.5 rounded bg-slate-200/80 font-mono text-slate-800">lib/license-guard.ts</code> dan <code className="px-1.5 py-0.5 rounded bg-slate-200/80 font-mono text-slate-800">.licenseguard.json</code> menyimpan token terenkripsi sehingga kredensial API Key tidak terekspos secara mentah di kode klien.
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
