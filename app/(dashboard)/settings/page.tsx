'use client';

import { useState } from 'react';
import { Key, ShieldCheck, Terminal, Copy, Check, Code2, Lock, Cpu, Server, ChevronRight, HelpCircle } from 'lucide-react';
import IntegrationSnippet from '@/components/integration-snippet';

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
      label: 'CLI Commands',
      desc: 'Cheat sheet & terminal tools',
      icon: Terminal,
      badge: '6 Tools',
    },
    {
      id: 'sdk' as const,
      label: 'Client SDK Hub',
      desc: 'Frontend & backend snippets',
      icon: Code2,
      badge: 'Multi-lang',
    },
    {
      id: 'rsa' as const,
      label: 'RSA Public Key',
      desc: 'Asymmetric offline token key',
      icon: Key,
      badge: 'RSA-2048',
    },
    {
      id: 'api' as const,
      label: 'REST API Reference',
      desc: 'Direct HTTP endpoints',
      icon: Server,
      badge: '4 Routes',
    },
    {
      id: 'security' as const,
      label: 'Security & Anti-Tamper',
      desc: 'Domain matching & killswitch',
      icon: Lock,
      badge: 'Active',
    },
  ];

  const cliCommands = [
    {
      id: 'cmd-init',
      name: 'Install & Setup (Otomatis)',
      cmd: 'npx @masdannn/license-guard init',
      alias: 'setup',
      desc: 'Inisialisasi & daftarkan project baru secara otomatis (generate key terenkripsi, buat lib file, & inject import).',
    },
    {
      id: 'cmd-view',
      name: 'Cek Informasi & Status Live',
      cmd: 'npx @masdannn/license-guard view',
      alias: 'status / info',
      desc: 'Melihat rincian lisensi, status koneksi live di server, dan URL dashboard instance klien.',
    },
    {
      id: 'cmd-fix',
      name: 'Perbaiki & Regenerasi File',
      cmd: 'npx @masdannn/license-guard fix',
      alias: 'repair',
      desc: 'Memperbaiki & meregenerasi file lib/license-guard.ts serta menyisipkan ulang import jika terhapus/rusak.',
    },
    {
      id: 'cmd-new',
      name: 'Reset / Rotasi Kunci Baru',
      cmd: 'npx @masdannn/license-guard new',
      alias: 'update / reset',
      desc: 'Mendaftarkan ulang project dengan API Key / Domain baru jika terjadi rotasi kredensial atau kebocoran data.',
    },
    {
      id: 'cmd-test',
      name: 'Uji Konektivitas Heartbeat',
      cmd: 'npx @masdannn/license-guard test',
      alias: 'check',
      desc: 'Menguji respons heartbeat langsung ke server dari terminal untuk memastikan website terproteksi.',
    },
    {
      id: 'cmd-help',
      name: 'Panduan Seluruh Perintah',
      cmd: 'npx @masdannn/license-guard --help',
      alias: '-h',
      desc: 'Menampilkan daftar seluruh perintah bantuan CLI di terminal.',
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
      body: '{ name, domain, apiKey, framework }',
      desc: 'Endpoint inisialisasi instan via CLI tanpa antrian pairing',
    },
  ];

  return (
    <div className="font-mono space-y-6 max-w-6xl">
      {/* ── Header ── */}
      <div className="border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="text-emerald-500">$</span>
          <span className="text-zinc-200 font-bold">./settings.sh --modular</span>
        </div>
        <p className="text-xs text-zinc-600 mt-1 pl-4">
          // Pengaturan sistem modular: pilih fitur pada menu sidebar di sebelah kiri
        </p>
      </div>

      {/* ── 2-Column Sidebar + Content Layout ── */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left Internal Sidebar Navigation (4 Cols) */}
        <div className="col-span-12 md:col-span-4 space-y-2 border border-zinc-800 rounded bg-zinc-950 p-2">
          <div className="px-3 py-2 border-b border-zinc-800/80 mb-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              {"// FEATURE SECTIONS"}
            </span>
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded transition-all text-left cursor-pointer group ${
                  isSelected
                    ? 'bg-zinc-900 border border-emerald-500/50 text-white shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                    : 'border border-transparent text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`p-1.5 rounded mt-0.5 ${isSelected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-900 text-zinc-600 group-hover:text-zinc-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-emerald-400' : 'text-zinc-200'}`}>
                      {item.label}
                    </p>
                    <p className="text-[11px] text-zinc-600 truncate mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${
                    isSelected
                      ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'
                      : 'border-zinc-800 text-zinc-600'
                  }`}>
                    {item.badge}
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-emerald-400 translate-x-0.5' : 'text-zinc-700'}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Feature Panel Content (8 Cols) */}
        <div className="col-span-12 md:col-span-8">
          {/* 1. CLI Commands Section */}
          {activeTab === 'cli' && (
            <div className="border border-zinc-800 rounded bg-zinc-950 animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/60">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-zinc-200 tracking-wide uppercase">
                    CLI COMMAND CHEAT SHEET (@masdannn/license-guard)
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                  6 PERINTAH
                </span>
              </div>

              <div className="divide-y divide-zinc-800/60">
                {cliCommands.map((item) => (
                  <div key={item.id} className="p-4 flex items-start justify-between gap-4 hover:bg-zinc-900/40 transition-colors">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-200">{item.name}</span>
                        <span className="text-[10px] font-mono text-zinc-600">alias: {item.alias}</span>
                      </div>

                      <div className="flex items-center gap-2 bg-black border border-zinc-800 rounded px-3 py-1.5">
                        <span className="text-emerald-500 text-xs">$</span>
                        <code className="text-xs font-mono font-bold text-emerald-400 select-all truncate flex-1">
                          {item.cmd}
                        </code>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed pt-0.5">{item.desc}</p>
                    </div>

                    <button
                      onClick={() => copyText(item.cmd, item.id)}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-zinc-900 border border-zinc-700 text-zinc-200 rounded hover:bg-emerald-400 hover:text-black hover:border-emerald-400 transition-all cursor-pointer mt-1"
                    >
                      {copiedKey === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>COPIED!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>[ COPY ]</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Client SDK Hub Section */}
          {activeTab === 'sdk' && (
            <div className="animate-fade-in">
              <IntegrationSnippet
                apiKey="YOUR_PROJECT_API_KEY"
                domain="client-domain.com"
              />
            </div>
          )}

          {/* 3. RSA Key Section */}
          {activeTab === 'rsa' && (
            <div className="border border-zinc-800 rounded bg-zinc-950 animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/60">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-zinc-200 tracking-wide uppercase">
                    RSA-2048 CRYPTOGRAPHIC PUBLIC KEY
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                  PUBLICLY SHAREABLE
                </span>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Kunci publik ini aman untuk dibagikan ke server klien untuk memvalidasi token JWT secara offline:
                  </p>
                  <button
                    onClick={() => copyText(publicKey, 'rsa-pub')}
                    className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-zinc-100 text-black rounded hover:bg-emerald-400 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'rsa-pub' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-950" />
                        <span>COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>[ COPY RSA KEY ]</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="font-mono text-xs text-emerald-400 bg-black p-4 rounded border border-zinc-800 whitespace-pre-wrap leading-relaxed overflow-x-auto select-all">
                  {publicKey}
                </pre>
              </div>
            </div>
          )}

          {/* 4. REST API Endpoints Section */}
          {activeTab === 'api' && (
            <div className="border border-zinc-800 rounded bg-zinc-950 animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/60">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs font-bold text-zinc-200 tracking-wide uppercase">
                    UNIVERSAL REST API ENDPOINTS
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 uppercase">CORS ENABLED</span>
              </div>

              <div className="divide-y divide-zinc-800/60">
                {apiEndpoints.map((api) => (
                  <div key={api.id} className="p-4 flex items-start justify-between gap-4 hover:bg-zinc-900/40 transition-colors">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-black text-emerald-400 border border-zinc-800 shrink-0">
                          {api.method}
                        </span>
                        <code className="text-xs font-mono font-bold text-zinc-200">{api.path}</code>
                      </div>
                      {api.body && (
                        <div className="text-[10px] font-mono text-zinc-500 bg-black px-2 py-1 rounded border border-zinc-800 inline-block">
                          Body: {api.body}
                        </div>
                      )}
                      <p className="text-xs text-zinc-400">{api.desc}</p>
                    </div>

                    <button
                      onClick={() => copyText(api.path, api.id)}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-zinc-900 border border-zinc-700 text-zinc-200 rounded hover:bg-emerald-400 hover:text-black hover:border-emerald-400 transition-all cursor-pointer mt-1"
                    >
                      {copiedKey === api.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>COPIED!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>[ COPY PATH ]</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Security & Anti-Tamper Section */}
          {activeTab === 'security' && (
            <div className="border border-zinc-800 rounded bg-zinc-950 animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/60">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-zinc-200 tracking-wide uppercase">
                    SECURITY &amp; ANTI-TAMPER POLICY
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                  ENFORCED
                </span>
              </div>

              <div className="p-4 space-y-4 text-xs text-zinc-400 leading-relaxed">
                <div className="p-3 bg-black border border-zinc-800 rounded space-y-1">
                  <p className="font-bold text-zinc-200">1. Domain Whitelist Enforcement</p>
                  <p className="text-zinc-500">
                    Setiap request verifikasi heartbeat dicocokkan dengan domain target yang terdaftar. Jika request berasal dari domain tidak sah, server akan mencatat log <span className="text-amber-400 font-mono font-bold">TAMPER_ATTEMPT</span> dan memblokir instance klien.
                  </p>
                </div>

                <div className="p-3 bg-black border border-zinc-800 rounded space-y-1">
                  <p className="font-bold text-zinc-200">2. Instant Killswitch &amp; Auto Recovery</p>
                  <p className="text-zinc-500">
                    Saat status diubah ke <span className="text-rose-400 font-mono font-bold">SUSPENDED</span>, client SDK langsung menampilkan layar penangguhan. Saat admin mengaktifkan kembali (<span className="text-emerald-400 font-mono font-bold">ACTIVE</span>), klien otomatis membuka kembali halaman dalam 4 detik tanpa reload.
                  </p>
                </div>

                <div className="p-3 bg-black border border-zinc-800 rounded space-y-1">
                  <p className="font-bold text-zinc-200">3. Credential Encryption (Client-side)</p>
                  <p className="text-zinc-500">
                    File <code className="text-emerald-400 font-mono">lib/license-guard.ts</code> dan <code className="text-emerald-400 font-mono">.licenseguard.json</code> menyimpan token terenkripsi (<code className="text-zinc-300">key: &apos;LGK_...&apos;</code>) sehingga kredensial mentah tidak tampak di kode klien.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
