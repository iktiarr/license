'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Globe,
  Tag,
  AlertCircle,
  CheckCircle,
  Terminal,
  Code2,
  Sparkles,
  Copy,
  Check,
  Radio,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function NewProjectPage() {
  const router = useRouter();
  const [method, setMethod] = useState<'npm' | 'hub'>('npm');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const gracePeriod = 24;

  // Framework tab for Hub
  const [selectedFramework, setSelectedFramework] = useState<'html' | 'react' | 'php' | 'node' | 'python' | 'go'>('html');
  const [copied, setCopied] = useState(false);

  // Test Connection status for Hub
  const [testStatus, setTestStatus] = useState<{
    tested: boolean;
    connected: boolean;
    message: string;
    isChecking?: boolean;
  }>({ tested: false, connected: false, message: '' });

  // Handle NPM Pairing Claim
  async function handleNpmPair(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim() || !domain.trim() || !pairingCode.trim()) {
      setError('Nama project, domain, dan kode pairing wajib diisi.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/pairing/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            domain,
            code: pairingCode,
            gracePeriod,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error || 'Gagal memverifikasi kode pairing.');
        } else {
          setSuccessMsg(`Project "${data.project.name}" berhasil dipasangkan & dihubungkan!`);
          setTimeout(() => router.push(`/projects/${data.project.id}`), 1200);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Koneksi ke server gagal.');
      }
    });
  }

  // Handle Manual Hub Registration & Connection Test
  async function handleHubSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim() || !domain.trim()) {
      setError('Nama project dan domain website wajib diisi.');
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('domain', domain);
        formData.append('gracePeriod', String(gracePeriod));

        // Buat project
        const { createProject } = await import('@/lib/actions');
        const result = await createProject(formData);

        if ('error' in result) {
          setError(result.error ?? 'Gagal membuat project.');
        } else {
          setSuccessMsg('Project berhasil didaftarkan!');
          setTimeout(() => router.push(`/projects/${result.project.id}`), 1000);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.');
      }
    });
  }

  // Test Connection
  async function handleTestConnection() {
    if (!domain.trim()) {
      setError('Masukkan domain website terlebih dahulu untuk menguji koneksi.');
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
        message: data.message || (data.connected ? 'Terhubung!' : 'Belum terhubung.'),
        isChecking: false,
      });
    } catch {
      setTestStatus({
        tested: true,
        connected: false,
        message: 'Gagal menghubungi server untuk verifikasi koneksi.',
        isChecking: false,
      });
    }
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://license-tau-nine.vercel.app';

  const snippets: Record<string, { name: string; code: string; desc: string }> = {
    html: {
      name: 'HTML Native (1-Baris Tag Script)',
      code: `<!-- Centralized License Guard -->\n<script src="${origin}/guard.js" data-api-key="AUTO_GENERATED_API_KEY"></script>`,
      desc: 'Tempelkan di dalam tag <head> atau <body> pada website HTML biasa, WordPress, atau template web Anda.',
    },
    react: {
      name: 'React / Next.js / Vue (NPM SDK)',
      code: `import { useEffect } from 'react';\nimport { initGuard } from '@masdannn/license-guard';\n\nexport default function App() {\n  useEffect(() => {\n    initGuard({ apiKey: "AUTO_GENERATED_API_KEY" });\n  }, []);\n  return <YourApp />;\n}`,
      desc: 'Import client SDK di root component (_app.tsx / layout.tsx / App.vue).',
    },
    php: {
      name: 'PHP (Native / Laravel)',
      code: `<?php\n// Tambahkan di middleware atau index.php\n$res = file_get_contents("${origin}/api/license/heartbeat");\n?>`,
      desc: 'Gunakan HTTP request di backend PHP untuk memverifikasi lisensi.',
    },
    node: {
      name: 'Node.js (Express)',
      code: `import { guardMiddleware } from '@masdannn/license-guard';\napp.use(guardMiddleware({ apiKey: "AUTO_GENERATED_API_KEY", domain: "${domain || 'client-domain.com'}" }));`,
      desc: 'Middleware Express.js untuk memproteksi routing backend.',
    },
    python: {
      name: 'Python (FastAPI / Flask)',
      code: `import requests\nres = requests.post("${origin}/api/license/heartbeat", json={"apiKey": "AUTO_GENERATED_API_KEY", "domain": "${domain || 'client-domain.com'}"})`,
      desc: 'Hook HTTP verification pada aplikasi Python.',
    },
    go: {
      name: 'Go (Golang)',
      code: `// License Guard HTTP Middleware\nhttp.Post("${origin}/api/license/heartbeat", "application/json", payload)`,
      desc: 'Middleware HTTP untuk aplikasi Go backend.',
    },
  };

  const currentSnippet = snippets[selectedFramework];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in-up">
      {/* Header */}
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-3 text-zinc-400 hover:text-white">
          <Link href="/projects">
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Back to Projects</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>Add New Project</span>
          <Badge variant="default" className="text-[11px] font-mono">
            Setup Wizard
          </Badge>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Daftarkan domain klien baru menggunakan metode Pairing Otomatis (NPM) atau Kode Integrasi Manual
        </p>
      </div>

      {/* Global Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMsg && (
        <Alert variant="success">
          <CheckCircle className="w-4 h-4" />
          <AlertDescription>{successMsg}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Basic Info */}
      <Card className="border-zinc-800 bg-zinc-900/60 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">1. Informasi Website Klien</CardTitle>
          <CardDescription className="text-xs">
            Tentukan identitas dan domain target website klien yang ingin dilindungi
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 pt-1">
          <Field>
            <FieldLabel htmlFor="project-name" required>
              <Tag className="w-3.5 h-3.5 mr-1 text-zinc-500" />
              Nama Project
            </FieldLabel>
            <Input
              id="project-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Toko Online Klien A"
              className="bg-zinc-950 border-zinc-800"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="project-domain" required>
              <Globe className="w-3.5 h-3.5 mr-1 text-zinc-500" />
              Domain Website Target
            </FieldLabel>
            <Input
              id="project-domain"
              type="text"
              required
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="contoh.com atau localhost"
              className="bg-zinc-950 border-zinc-800 font-mono text-xs"
            />
            <FieldDescription>
              Domain utama website tanpa <code className="text-zinc-400">https://</code>
            </FieldDescription>
          </Field>
        </CardContent>
      </Card>

      {/* Step 2: Choose Integration Method (Single Select) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono">
            2. Pilih Metode Integrasi (Pilih 1 Opsi)
          </h2>
          <span className="text-xs text-zinc-500 font-mono">Hanya perlu memilih salah satu</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Card Option 1: NPM CLI Pairing */}
          <button
            type="button"
            onClick={() => setMethod('npm')}
            className={`text-left p-5 rounded-xl border transition-all cursor-pointer select-none ${
              method === 'npm'
                ? 'bg-zinc-900 border-white text-white shadow-md ring-1 ring-white/20'
                : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm text-white">NPM CLI Pairing</span>
              </div>
              <Badge variant={method === 'npm' ? 'success' : 'secondary'} className="text-[10px]">
                {method === 'npm' ? 'Pilihan Aktif' : 'Pilih Ini'}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              Jalankan perintah di terminal project klien untuk mendapatkan kode pairing instan tanpa buka source code.
            </p>
            <div className="bg-zinc-950 p-2 rounded border border-zinc-800 font-mono text-[11px] text-emerald-400">
              npx @masdannn/license-guard init
            </div>
          </button>

          {/* Card Option 2: Integration Hub Snippet */}
          <button
            type="button"
            onClick={() => setMethod('hub')}
            className={`text-left p-5 rounded-xl border transition-all cursor-pointer select-none ${
              method === 'hub'
                ? 'bg-zinc-900 border-white text-white shadow-md ring-1 ring-white/20'
                : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-sm text-white">Integration Hub (Snippet)</span>
              </div>
              <Badge variant={method === 'hub' ? 'default' : 'secondary'} className="text-[10px]">
                {method === 'hub' ? 'Pilihan Aktif' : 'Pilih Ini'}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              Generate kode integrasi siap pakai sesuai framework (HTML 1-baris, PHP, Node.js, React, Python, Go).
            </p>
            <div className="bg-zinc-950 p-2 rounded border border-zinc-800 font-mono text-[11px] text-zinc-400">
              &lt;script src=&quot;.../guard.js&quot;&gt;&lt;/script&gt;
            </div>
          </button>
        </div>
      </div>

      {/* Step 3: Action Panel Depending on Method */}
      {method === 'npm' ? (
        /* NPM CLI Pairing Section */
        <Card className="border-zinc-800 bg-zinc-900/80 shadow-xl">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <CardTitle className="text-sm font-semibold">Hubungkan dengan Pairing Code Terminal</CardTitle>
            </div>
            <span className="text-[11px] font-mono text-zinc-400 bg-zinc-950 px-2.5 py-0.5 rounded border border-zinc-800">
              Handshake Mode
            </span>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-zinc-300">
                1. Jalankan perintah ini di terminal folder project klien:
              </p>
              <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800/80 font-mono text-xs text-emerald-400 flex items-center justify-between">
                <code>npx @masdannn/license-guard init</code>
                <span className="text-[10px] text-zinc-500">Ketik di terminal</span>
              </div>
            </div>

            <div className="space-y-2">
              <Field>
                <FieldLabel htmlFor="pairing-code" required>
                  2. Masukkan Kode Pairing yang Muncul di Terminal:
                </FieldLabel>
                <Input
                  id="pairing-code"
                  type="text"
                  required
                  value={pairingCode}
                  onChange={(e) => setPairingCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: LG-8942-XK91"
                  className="bg-zinc-950 border-zinc-800 font-mono text-base tracking-widest uppercase font-bold text-center text-white py-5"
                />
                <FieldDescription>
                  Kode pairing acak berformat <code className="text-emerald-400 font-bold">LG-XXXX-XXXX</code> berlaku selama 15 menit.
                </FieldDescription>
              </Field>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-zinc-800/80">
              <Button
                id="npm-pair-submit-btn"
                type="button"
                onClick={handleNpmPair}
                disabled={isPending || !pairingCode || !name || !domain}
                variant="default"
                className="bg-white text-zinc-950 hover:bg-zinc-200 font-bold shadow-md"
              >
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>{isPending ? 'Memasangkan Sesi...' : '⚡ Tes Koneksi & Pasangkan'}</span>
              </Button>
              <Button asChild variant="outline">
                <Link href="/projects">Batal</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Integration Hub Snippet Section */
        <Card className="border-zinc-800 bg-zinc-900/80 shadow-xl">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <CardTitle className="text-sm font-semibold">Pilih Framework Klien & Dapatkan Kode</CardTitle>
            </div>
            <span className="text-[11px] font-mono text-zinc-400 bg-zinc-950 px-2.5 py-0.5 rounded border border-zinc-800">
              Snippet Generator
            </span>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            {/* Framework Tabs */}
            <div className="flex flex-wrap gap-1 p-1 bg-zinc-950 rounded-lg border border-zinc-800/80">
              {(Object.keys(snippets) as Array<keyof typeof snippets>).map((fwKey) => {
                const fw = snippets[fwKey];
                const isSelected = selectedFramework === fwKey;
                return (
                  <button
                    key={fwKey}
                    type="button"
                    onClick={() => setSelectedFramework(fwKey as 'html' | 'react' | 'php' | 'node' | 'python' | 'go')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-800 text-white font-semibold shadow-sm border border-zinc-700'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    {fw.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>

            {/* Snippet Display */}
            <div className="flex items-center justify-between gap-3 text-xs text-zinc-400 bg-zinc-950/80 border border-zinc-800/80 rounded-lg p-3">
              <p className="leading-relaxed text-zinc-300">{currentSnippet.desc}</p>
              <Button
                size="sm"
                variant="default"
                onClick={handleCopy}
                className="shrink-0 h-8 text-xs font-semibold gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Kode</span>
                  </>
                )}
              </Button>
            </div>

            <div className="relative">
              <pre className="font-mono text-xs leading-relaxed overflow-x-auto p-4 rounded-xl text-zinc-200 bg-zinc-950 border border-zinc-800 shadow-inner">
                <code>{currentSnippet.code}</code>
              </pre>
            </div>

            {/* Test Connection Live Box */}
            {testStatus.tested && (
              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  testStatus.connected
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${testStatus.connected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span>{testStatus.message}</span>
                </div>
                {testStatus.connected && (
                  <Badge variant="success" className="text-[10px]">
                    Koneksi Aktif
                  </Badge>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
              <div className="flex items-center gap-3">
                <Button
                  id="hub-submit-btn"
                  type="button"
                  onClick={handleHubSubmit}
                  disabled={isPending || !name || !domain}
                  variant="default"
                  className="font-bold"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span>{isPending ? 'Mendaftarkan...' : 'Daftarkan Project'}</span>
                </Button>

                <Button
                  id="hub-test-connection-btn"
                  type="button"
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={testStatus.isChecking || !domain}
                  className="text-xs"
                >
                  <Radio className={`w-3.5 h-3.5 mr-1 ${testStatus.isChecking ? 'animate-spin' : 'text-indigo-400'}`} />
                  <span>{testStatus.isChecking ? 'Menguji...' : '🔍 Hubungkan & Cek Status'}</span>
                </Button>
              </div>

              <Button asChild variant="ghost" className="text-zinc-500">
                <Link href="/projects">Batal</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
