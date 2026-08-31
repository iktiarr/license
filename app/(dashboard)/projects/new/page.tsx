'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  AlertCircle,
  Radio,
  Globe,
  Tag,
  Terminal,
  Copy,
  Key,
  RotateCw,
  Zap,
  ExternalLink,
  Play,
  X,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import IntegrationSnippet from '@/components/integration-snippet';

function generateRandomApiKey() {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return 'LG-' + window.crypto.randomUUID().replace(/-/g, '').substring(0, 32);
  }
  return 'LG-8f4a1c9e2b7d3056e184c902fa11de7b';
}

export default function NewProjectPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [apiKey, setApiKey] = useState(() => generateRandomApiKey());
  const [cliCopied, setCliCopied] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const [showCliModal, setShowCliModal] = useState(false);

  const handleRegenerateKey = () => {
    setApiKey(generateRandomApiKey());
  };

  const [testStatus, setTestStatus] = useState<{
    tested: boolean;
    connected: boolean;
    message: string;
    isChecking?: boolean;
  }>({ tested: false, connected: false, message: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim() || !domain.trim()) {
      setError('Nama project dan domain target wajib diisi.');
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('domain', domain);
        formData.append('apiKey', apiKey);
        formData.append('gracePeriod', '24');

        const { createProject } = await import('@/lib/actions');
        const result = await createProject(formData);

        if ('error' in result) {
          setError(result.error ?? 'Gagal menghubungkan project.');
        } else {
          setCreatedProjectId(result.project.id);
          setSuccessMsg(`Project "${result.project.name}" (${result.project.domain}) berhasil terhubung & aktif.`);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menghubungkan project.');
      }
    });
  }

  async function handleTestConnection() {
    if (!domain.trim()) {
      setError('Masukkan domain target terlebih dahulu.');
      return;
    }
    setError('');
    setTestStatus({ tested: false, connected: false, message: '', isChecking: true });

    try {
      const res = await fetch('/api/license/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      setTestStatus({
        tested: true,
        connected: Boolean(data.connected),
        message: data.message || (data.connected ? 'Domain terjangkau!' : 'Domain belum aktif/terjangkau.'),
        isChecking: false,
      });
    } catch {
      setTestStatus({ tested: true, connected: false, message: 'Gagal menghubungi server.', isChecking: false });
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb & Header ── */}
      <div className="space-y-1 pb-2 border-b border-slate-200">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors -ml-1 py-0.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Projects</span>
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Hubungkan Project Baru
        </h1>
        <p className="text-xs text-slate-500">
          Pilih setup otomatis via terminal CLI atau salin kunci &amp; kode secara manual
        </p>
      </div>

      {/* ── Dual Setup Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* 1. CLI Setup (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <Card className="border-emerald-200 bg-emerald-50/40 shadow-xs flex-1 flex flex-col justify-between">
            <CardHeader className="py-3 px-4 border-b border-emerald-100 bg-emerald-100/40 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-700" />
                <CardTitle className="text-xs font-bold text-emerald-950">
                  Setup Otomatis (CLI)
                </CardTitle>
              </div>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                Rekomendasi
              </span>
            </CardHeader>

            <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <p className="text-xs text-slate-600">
                Jalankan di folder project klien untuk setup otomatis tanpa perlu copy-paste file:
              </p>

              {/* Input with embedded copy icon button */}
              <div className="relative flex items-center">
                <Input
                  readOnly
                  value="npx @masdannn/license-guard"
                  className="pr-9 h-9 text-xs font-mono font-semibold bg-slate-950 text-emerald-400 border-slate-800 select-all"
                />
                <button
                  type="button"
                  title="Salin Perintah"
                  onClick={() => {
                    navigator.clipboard.writeText('npx @masdannn/license-guard');
                    setCliCopied(true);
                    setTimeout(() => setCliCopied(false), 2000);
                  }}
                  className="absolute right-2 p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {cliCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCliModal(true)}
                className="w-full h-8 text-xs font-semibold bg-white hover:bg-emerald-100 text-emerald-900 border-emerald-300 shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                <span>Lihat Simulasi Output CLI</span>
              </Button>

              <div className="pt-2 border-t border-emerald-200/50 space-y-1 text-[11px] text-emerald-900 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Next.js, Vite, Vue, Flutter, PHP, HTML</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2. Manual Setup (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <Card className="border-slate-200 bg-white shadow-xs flex-1 flex flex-col justify-between">
            <CardHeader className="py-3 px-4 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-700" />
                <CardTitle className="text-xs font-bold text-slate-900">
                  Setup Manual (Kunci &amp; Kode di Bawah)
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <div className="flex-1">
                    <span className="font-semibold">{error}</span>
                    {error.toLowerCase().includes('batas') && (
                      <Link href="/billing" className="block mt-1 text-[11px] text-rose-900 underline font-semibold">
                        Lihat Upgrade Paket →
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Connected Success Card */}
              {successMsg && (
                <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{successMsg}</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">
                      ACTIVE
                    </span>
                  </div>
                  {createdProjectId && (
                    <div className="pt-1.5 border-t border-emerald-200 flex items-center justify-between">
                      <Button asChild size="sm" className="h-7 text-xs bg-emerald-800 hover:bg-emerald-900 text-white font-semibold">
                        <Link href={`/projects/${createdProjectId}`}>
                          <span>Buka Detail Project</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                      <Link href="/projects" className="text-xs text-emerald-800 hover:underline">
                        Daftar Projects
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 flex-1 flex flex-col justify-between">
                {/* Embedded Secret API Key Input with Copy Icon inside */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-amber-500" />
                      <span>Secret API Key</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleRegenerateKey}
                      title="Acak Kunci Baru"
                      className="text-[10px] text-slate-500 hover:text-slate-900 flex items-center gap-1 px-1 rounded hover:bg-slate-100 cursor-pointer"
                    >
                      <RotateCw className="w-2.5 h-2.5" />
                      <span>Acak Kunci</span>
                    </button>
                  </div>

                  <div className="relative flex items-center">
                    <Input
                      readOnly
                      value={apiKey}
                      className="pr-9 h-8.5 text-xs font-mono font-semibold bg-amber-50/60 border-amber-200 text-slate-900 select-all"
                    />
                    <button
                      type="button"
                      title="Salin Kunci"
                      onClick={() => {
                        navigator.clipboard.writeText(apiKey);
                        setKeyCopied(true);
                        setTimeout(() => setKeyCopied(false), 2000);
                      }}
                      className="absolute right-2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      {keyCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="project-name" className="text-xs font-semibold text-slate-700 block">
                      Nama Project *
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-2.5 text-slate-400">
                        <Tag className="w-3.5 h-3.5" />
                      </span>
                      <Input
                        id="project-name"
                        type="text"
                        required
                        placeholder="Contoh: Toko Online Bu Siti"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-8 h-8.5 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="project-domain" className="text-xs font-semibold text-slate-700 block">
                      Domain Target *
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-2.5 text-slate-400">
                        <Globe className="w-3.5 h-3.5" />
                      </span>
                      <Input
                        id="project-domain"
                        type="text"
                        required
                        placeholder="tokobusiti.com"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="pl-8 h-8.5 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Connection Status */}
                {testStatus.tested && (
                  <div
                    className={`p-2 rounded-md border text-xs flex items-center gap-1.5 ${
                      testStatus.connected
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        testStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    <span>{testStatus.message}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                  <Button
                    type="submit"
                    disabled={isPending || !name || !domain}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-8.5 cursor-pointer shadow-xs"
                  >
                    <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                    <span>{isPending ? 'Menghubungkan...' : 'Hubungkan Project'}</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={testStatus.isChecking || !domain}
                    className="text-xs h-8.5 font-medium cursor-pointer"
                  >
                    <Radio className={`w-3 h-3 mr-1 ${testStatus.isChecking ? 'animate-spin' : ''}`} />
                    <span>{testStatus.isChecking ? 'Menguji...' : 'Uji Koneksi'}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Clean Step-by-Step Code Tutorial with Live Sync ── */}
      <IntegrationSnippet
        apiKey={apiKey}
        domain={domain || 'domain-klien.com'}
      />

      {/* ── Modal: CLI Output Simulation ── */}
      {showCliModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            {/* Modal Terminal Header */}
            <div className="py-3 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                </div>
                <span className="text-xs font-mono text-slate-300 ml-2 font-semibold">
                  terminal — Simulasi Wizard CLI (v3.0.0)
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowCliModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Terminal Body */}
            <div className="p-5 font-mono text-xs text-slate-200 space-y-1 overflow-y-auto flex-1 leading-relaxed select-text">
              <div className="text-slate-400">$ npx @masdannn/license-guard init</div>
              <div className="text-cyan-400 font-bold">╔══════════════════════════════════════════════════════════╗</div>
              <div className="text-cyan-400 font-bold">║  🛡️  CENTRALIZED LICENSE GUARD CLI (v3.0.0)             ║</div>
              <div className="text-cyan-400 font-bold">║  Proteksi Lisensi, Anti-Tamper & Remote Killswitch       ║</div>
              <div className="text-cyan-400 font-bold">╚══════════════════════════════════════════════════════════╝</div>
              <div className="text-amber-300">Terdeteksi Environment: Next.js (App/Pages Router)</div>
              <div>&nbsp;</div>
              <div className="text-slate-200">? 1. Nama Project: <span className="text-cyan-300 font-bold">{name || 'Toko Online Fashion Klien'}</span></div>
              <div className="text-slate-200">? 2. Domain Website Target: <span className="text-cyan-300 font-bold">{domain || 'tokofashion.com'}</span></div>
              <div className="text-slate-200">? 3. Email Akun Developer: <span className="text-cyan-300 font-bold">dev@agensi-digital.com</span></div>
              <div>&nbsp;</div>
              <div className="text-slate-400">Menghubungkan ke Central License Guard Server...</div>
              <div className="text-emerald-400 font-bold">✔ Inisialisasi Lisensi Berhasil!</div>
              <div className="text-slate-300">  Project ID  : clx98a42f0001</div>
              <div className="text-slate-300">  Secret Key  : <span className="text-amber-300 font-mono">{apiKey || 'LG-8f4a1c9e2b7d3056e184c902fa11de7b'}</span></div>
              <div className="text-slate-300">  Target Host : {domain || 'tokofashion.com'}</div>
              <div className="text-emerald-400 font-semibold">  Status      : ACTIVE (Lisensi Terverifikasi)</div>
              <div>&nbsp;</div>
              <div className="text-slate-300 font-bold">Menyiapkan berkas proteksi lisensi:</div>
              <div className="text-emerald-400">  ✔ Dibuat: app/license-guard.ts (Runtime SDK Hook)</div>
              <div className="text-emerald-400">  ✔ Dibuat: .licenseguard.json (Konfigurasi Proyek)</div>
              <div className="text-emerald-400">  ✔ Terhubung ke: app/layout.tsx (Auto Mount Root)</div>
              <div className="text-emerald-400">  ✔ Dependensi @masdannn/license-guard@^3.0.0 ditambahkan ke package.json</div>
              <div>&nbsp;</div>
              <div className="text-cyan-300 font-bold">🎉 Project berhasil diamankan dengan Central License Guard!</div>
            </div>

            {/* Modal Footer */}
            <div className="py-3 px-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Jalankan perintah ini langsung di terminal laptop Anda.
              </span>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText('npx @masdannn/license-guard init');
                  setCliCopied(true);
                  setTimeout(() => setCliCopied(false), 2000);
                  setShowCliModal(false);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-7.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 mr-1" />
                <span>Salin Perintah &amp; Tutup</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
