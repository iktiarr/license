'use client';

import { useState } from 'react';
import { Key, ShieldCheck, Terminal, Copy, Check, Code2 } from 'lucide-react';
import IntegrationSnippet from '@/components/integration-snippet';

const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyXz7vE1k...
-----END PUBLIC KEY-----`;

export default function SettingsPage() {
  const [activePanel, setActivePanel] = useState<'cli' | 'rsa' | 'sdk' | 'api'>('cli');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

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

  const panels = [
    { id: 'cli', label: 'CLI Commands Cheat Sheet', icon: Terminal, count: '6 Perintah' },
    { id: 'sdk', label: 'Client SDK & Code Hub', icon: Code2, count: 'Multi-bahasa' },
    { id: 'rsa', label: 'RSA-2048 Public Key', icon: Key, count: 'Cryptographic' },
    { id: 'api', label: 'REST API Endpoints', icon: ShieldCheck, count: '4 Endpoints' },
  ] as const;

  return (
    <div className="font-mono space-y-6 max-w-5xl">
      {/* ── Header ── */}
      <div className="border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="text-emerald-500">$</span>
          <span className="text-zinc-200 font-bold">./settings.sh --panel-view</span>
        </div>
        <p className="text-xs text-zinc-600 mt-1 pl-4">
          // Pengaturan sistem, panduan perintah CLI, integrasi kode, dan referensi API
        </p>
      </div>

      {/* ── Panel Navigation Tabs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {panels.map((p) => {
          const Icon = p.icon;
          const isActive = activePanel === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setActivePanel(p.id)}
              className={`text-left p-3 rounded border transition-all cursor-pointer ${
                isActive
                  ? 'border-emerald-500/60 bg-emerald-500/10 text-zinc-100 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-600'}`} />
                <span className="text-xs font-bold truncate">{p.label}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-zinc-600">{p.count}</span>
                {isActive && <span className="text-emerald-400 font-bold">AKTIF</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Panel Content ── */}

      {/* 1. CLI Commands Panel */}
      {activePanel === 'cli' && (
        <div className="border border-zinc-800 rounded bg-zinc-950 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/60">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-zinc-300 tracking-wide uppercase">
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

                  <div className="flex items-center gap-2 max-w-2xl bg-black border border-zinc-800 rounded px-3 py-1.5">
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

      {/* 2. Client SDK Hub Panel */}
      {activePanel === 'sdk' && (
        <div className="animate-fade-in">
          <IntegrationSnippet
            apiKey="YOUR_PROJECT_API_KEY"
            domain="client-domain.com"
          />
        </div>
      )}

      {/* 3. RSA Key Panel */}
      {activePanel === 'rsa' && (
        <div className="border border-zinc-800 rounded bg-zinc-950 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/60">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-zinc-300 tracking-wide uppercase">
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

      {/* 4. REST API Endpoints Panel */}
      {activePanel === 'api' && (
        <div className="border border-zinc-800 rounded bg-zinc-950 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/60">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-bold text-zinc-300 tracking-wide uppercase">
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
    </div>
  );
}
