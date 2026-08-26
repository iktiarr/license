import type { Metadata } from 'next';
import { Key, ShieldCheck, Terminal } from 'lucide-react';
import IntegrationSnippet from '@/components/integration-snippet';

export const metadata: Metadata = { title: 'Settings — License Guard' };

const publicKey = (process.env.RSA_PUBLIC_KEY ?? '').replace(/\\n/g, '\n');

export default function SettingsPage() {
  const cliCommands = [
    {
      cmd: 'npx @masdannn/license-guard init',
      alias: 'setup',
      desc: 'Inisialisasi & daftarkan project baru secara otomatis (generate key terenkripsi, buat lib file, & inject import)',
    },
    {
      cmd: 'npx @masdannn/license-guard view',
      alias: 'status / info',
      desc: 'Melihat rincian lisensi, status koneksi live di server, dan URL dashboard instance klien',
    },
    {
      cmd: 'npx @masdannn/license-guard fix',
      alias: 'repair',
      desc: 'Memperbaiki & meregenerasi file lib/license-guard.ts serta menyisipkan ulang import jika terhapus',
    },
    {
      cmd: 'npx @masdannn/license-guard new',
      alias: 'update / reset',
      desc: 'Mendaftarkan ulang project dengan API Key / Domain baru jika terjadi rotasi kredensial atau kebocoran data',
    },
    {
      cmd: 'npx @masdannn/license-guard test',
      alias: 'check',
      desc: 'Menguji respons heartbeat langsung ke server dari terminal untuk memastikan website terproteksi',
    },
    {
      cmd: 'npx @masdannn/license-guard --help',
      alias: '-h',
      desc: 'Menampilkan daftar seluruh perintah bantuan CLI di terminal',
    },
  ];

  const apiEndpoints = [
    {
      method: 'POST',
      path: '/api/license/register',
      body: '{ apiKey, domain }',
      desc: 'Mendaftarkan website klien & mendapatkan token JWT asimetris',
    },
    {
      method: 'POST',
      path: '/api/license/heartbeat',
      body: '{ apiKey, domain, serverIp? }',
      desc: 'Memperbarui status lisensi secara berkala (Killswitch Check)',
    },
    {
      method: 'GET',
      path: '/api/license/verify?token=',
      body: null,
      desc: 'Memvalidasi keabsahan token JWT secara langsung ke server',
    },
    {
      method: 'POST',
      path: '/api/pairing/init',
      body: '{ name, domain, apiKey, framework }',
      desc: 'Endpoint inisialisasi instan via CLI tanpa antrian pairing',
    },
  ];

  return (
    <div className="font-mono space-y-6 max-w-4xl">
      {/* ── Header ── */}
      <div className="border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="text-emerald-500">$</span>
          <span className="text-zinc-200 font-bold">./settings.sh --sys-info</span>
        </div>
        <p className="text-xs text-zinc-600 mt-1 pl-4">
          // Cryptographic keys, SDK integrations, CLI cheat sheet, and REST API references
        </p>
      </div>

      {/* ── CLI Command Cheat Sheet Card ── */}
      <div className="border border-zinc-800 rounded bg-zinc-950">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold text-zinc-300 tracking-wide uppercase">
              [01] CLI COMMAND CHEAT SHEET (@masdannn/license-guard)
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
            CLI HELP
          </span>
        </div>

        <div className="divide-y divide-zinc-800/60">
          {cliCommands.map((item) => (
            <div key={item.cmd} className="p-4 flex items-start gap-4 hover:bg-zinc-900/40 transition-colors">
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="text-xs font-mono font-bold text-emerald-400 bg-black px-2 py-1 rounded border border-zinc-800">
                    $ {item.cmd}
                  </code>
                  <span className="text-[10px] font-mono text-zinc-500">
                    alias: {item.alias}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RSA Public Key Card ── */}
      <div className="border border-zinc-800 rounded bg-zinc-950">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <Key className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold text-zinc-300 tracking-wide uppercase">
              [02] RSA-2048 PUBLIC KEY
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
            PUBLICLY SHAREABLE
          </span>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Kunci publik ini aman untuk dibagikan ke server klien untuk memvalidasi token JWT secara offline:
          </p>

          {publicKey ? (
            <pre className="font-mono text-xs text-emerald-400 bg-black p-4 rounded border border-zinc-800 whitespace-pre-wrap leading-relaxed overflow-x-auto select-all">
              {publicKey}
            </pre>
          ) : (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400 text-xs">
              ⚠️ Kunci RSA belum terbaca di environment.
            </div>
          )}
        </div>
      </div>

      {/* ── Integration Snippet Hub ── */}
      <div>
        <IntegrationSnippet
          apiKey="YOUR_PROJECT_API_KEY"
          domain="client-domain.com"
        />
      </div>

      {/* ── API Reference Card ── */}
      <div className="border border-zinc-800 rounded bg-zinc-950">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-bold text-zinc-300 tracking-wide uppercase">
              [03] UNIVERSAL REST API ENDPOINTS
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 uppercase">CORS Enabled</span>
        </div>

        <div className="divide-y divide-zinc-800/60">
          {apiEndpoints.map((api) => (
            <div key={api.path} className="p-4 flex items-start gap-4 hover:bg-zinc-900/40 transition-colors">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-black text-emerald-400 border border-zinc-800 shrink-0">
                {api.method}
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono font-bold text-zinc-200">{api.path}</code>
                  {api.body && (
                    <code className="text-[10px] font-mono text-zinc-500 bg-black px-1.5 py-0.5 rounded border border-zinc-800">
                      {api.body}
                    </code>
                  )}
                </div>
                <p className="text-xs text-zinc-500">{api.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
