'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Terminal,
  Code2,
  Copy,
  Check,
  CheckCircle,
  AlertCircle,
  Radio,
  Globe,
  Tag,
} from 'lucide-react';

export default function NewProjectPage() {
  const router = useRouter();
  const [method, setMethod] = useState<'npm' | 'hub'>('npm');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [pairingCode, setPairingCode] = useState('');

  const [selectedFramework, setSelectedFramework] = useState<'html' | 'react' | 'php' | 'node' | 'python' | 'go'>('html');
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<{
    tested: boolean;
    connected: boolean;
    message: string;
    isChecking?: boolean;
  }>({ tested: false, connected: false, message: '' });

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://license-tau-nine.vercel.app';

  const snippets: Record<string, { label: string; code: string; desc: string }> = {
    html: {
      label: 'HTML',
      code: `<!-- License Guard -->\n<script src="${origin}/guard.js" data-api-key="YOUR_API_KEY"></script>`,
      desc: 'Tempel di dalam <head> pada file HTML, WordPress, atau template web.',
    },
    react: {
      label: 'React',
      code: `// Di root component (layout.tsx / _app.tsx / App.tsx)\nimport { initGuard } from '@masdannn/license-guard';\ninitGuard({ apiKey: 'YOUR_API_KEY' });`,
      desc: 'Import di root component project React atau Next.js.',
    },
    php: {
      label: 'PHP',
      code: `<?php\n// Di middleware atau index.php\n$res = file_get_contents("${origin}/api/license/heartbeat");\n?>`,
      desc: 'HTTP request di backend PHP / Laravel untuk verifikasi lisensi.',
    },
    node: {
      label: 'Node',
      code: `import { guardMiddleware } from '@masdannn/license-guard';\napp.use(guardMiddleware({ apiKey: 'YOUR_API_KEY', domain: '${domain || 'client-domain.com'}' }));`,
      desc: 'Middleware Express.js untuk proteksi routing backend.',
    },
    python: {
      label: 'Python',
      code: `import requests\nres = requests.post("${origin}/api/license/heartbeat",\n  json={"apiKey": "YOUR_API_KEY", "domain": "${domain || 'client-domain.com'}"})`,
      desc: 'Hook verifikasi HTTP di FastAPI atau Flask.',
    },
    go: {
      label: 'Go',
      code: `// License Guard HTTP Check\nhttp.Post("${origin}/api/license/heartbeat",\n  "application/json", payload)`,
      desc: 'Middleware HTTP untuk aplikasi Go backend.',
    },
  };

  const currentSnippet = snippets[selectedFramework];

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
          body: JSON.stringify({ name, domain, code: pairingCode, gracePeriod: 24 }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error || 'Gagal verifikasi kode pairing.');
        } else {
          setSuccessMsg(`Project "${data.project.name}" berhasil dipasangkan!`);
          setTimeout(() => router.push(`/projects/${data.project.id}`), 1200);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Koneksi gagal.');
      }
    });
  }

  async function handleHubSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!name.trim() || !domain.trim()) {
      setError('Nama project dan domain wajib diisi.');
      return;
    }
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('domain', domain);
        formData.append('gracePeriod', '24');
        const { createProject } = await import('@/lib/actions');
        const result = await createProject(formData);
        if ('error' in result) {
          setError(result.error ?? 'Gagal membuat project.');
        } else {
          setSuccessMsg('Project berhasil didaftarkan!');
          setTimeout(() => router.push(`/projects/${result.project.id}`), 1000);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
      }
    });
  }

  async function handleTestConnection() {
    if (!domain.trim()) { setError('Masukkan domain terlebih dahulu.'); return; }
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
      setTestStatus({ tested: true, connected: false, message: 'Gagal menghubungi server.', isChecking: false });
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl font-mono">

      {/* ── Header ── */}
      <div className="mb-6">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>cd ../projects</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-emerald-500 text-sm">$</span>
          <h1 className="text-sm font-bold text-zinc-100 tracking-wide">
            new_project<span className="text-zinc-600">.init()</span>
          </h1>
          <span className="text-[10px] px-2 py-0.5 rounded border border-zinc-700 text-zinc-500">
            setup wizard
          </span>
        </div>
        <p className="text-[11px] text-zinc-600 mt-1.5 pl-5">
          // Daftarkan domain klien baru menggunakan NPM CLI atau kode integrasi manual
        </p>
      </div>

      {/* ── Global Alerts ── */}
      {error && (
        <div className="flex items-start gap-2 p-3 mb-4 rounded border border-rose-500/30 bg-rose-500/5 text-rose-400 text-xs">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-start gap-2 p-3 mb-4 rounded border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-xs">
          <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── [01] Informasi Project ── */}
      <div className="mb-5 border border-zinc-800 rounded bg-zinc-950">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/60">
          <span className="text-[10px] text-zinc-600 font-semibold">[01]</span>
          <span className="text-[11px] text-zinc-300 font-semibold tracking-wide">INFORMASI PROJECT</span>
        </div>
        <div className="p-4 grid grid-cols-2 gap-4">
          {/* Nama */}
          <div className="space-y-1.5">
            <label htmlFor="project-name" className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-widest">
              <Tag className="w-3 h-3" /> Nama Project *
            </label>
            <div className="flex items-center bg-black border border-zinc-800 rounded focus-within:border-emerald-500/60 transition-colors">
              <span className="pl-3 text-emerald-500 text-xs select-none">›</span>
              <input
                id="project-name"
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-transparent px-2.5 py-2 text-xs text-zinc-100 focus:outline-none font-mono"
              />
            </div>
          </div>
          {/* Domain */}
          <div className="space-y-1.5">
            <label htmlFor="project-domain" className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-widest">
              <Globe className="w-3 h-3" /> Domain Target *
            </label>
            <div className="flex items-center bg-black border border-zinc-800 rounded focus-within:border-emerald-500/60 transition-colors">
              <span className="pl-3 text-emerald-500 text-xs select-none">›</span>
              <input
                id="project-domain"
                type="text"
                required
                value={domain}
                onChange={e => setDomain(e.target.value)}
                className="w-full bg-transparent px-2.5 py-2 text-xs text-zinc-100 focus:outline-none font-mono"
              />
            </div>
            <p className="text-[10px] text-zinc-600">Domain tanpa https:// — contoh: client.com</p>
          </div>
        </div>
      </div>

      {/* ── [02] Metode Integrasi ── */}
      <div className="mb-5 border border-zinc-800 rounded bg-zinc-950">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/60">
          <span className="text-[10px] text-zinc-600 font-semibold">[02]</span>
          <span className="text-[11px] text-zinc-300 font-semibold tracking-wide">METODE INTEGRASI</span>
          <span className="ml-auto text-[10px] text-zinc-600">// pilih salah satu</span>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          {/* NPM Option */}
          <button
            type="button"
            onClick={() => setMethod('npm')}
            className={`text-left p-3.5 rounded border transition-all cursor-pointer ${
              method === 'npm'
                ? 'border-emerald-500/60 bg-emerald-500/5 text-zinc-100'
                : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-bold">NPM CLI Pairing</span>
              {method === 'npm' && <span className="ml-auto text-[9px] text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">AKTIF</span>}
            </div>
            <p className="text-[10px] text-zinc-600 leading-relaxed mb-2.5">
              Jalankan perintah di terminal project klien. CLI otomatis setup file integrasi.
            </p>
            <div className="bg-black border border-zinc-800 rounded px-3 py-1.5 text-[10px] text-emerald-400">
              $ npx @masdannn/license-guard init
            </div>
          </button>

          {/* Hub Option */}
          <button
            type="button"
            onClick={() => setMethod('hub')}
            className={`text-left p-3.5 rounded border transition-all cursor-pointer ${
              method === 'hub'
                ? 'border-zinc-400/40 bg-zinc-800/30 text-zinc-100'
                : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Code2 className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs font-bold">Integration Hub</span>
              {method === 'hub' && <span className="ml-auto text-[9px] text-zinc-400 border border-zinc-600 px-1.5 py-0.5 rounded">AKTIF</span>}
            </div>
            <p className="text-[10px] text-zinc-600 leading-relaxed mb-2.5">
              Generate kode snippet siap pakai sesuai framework. Copy & paste manual ke project klien.
            </p>
            <div className="bg-black border border-zinc-800 rounded px-3 py-1.5 text-[10px] text-zinc-500">
              {'<script src="...guard.js">'}
            </div>
          </button>
        </div>
      </div>

      {/* ── [03] Action Panel ── */}
      <div className="border border-zinc-800 rounded bg-zinc-950">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/60">
          <span className="text-[10px] text-zinc-600 font-semibold">[03]</span>
          <span className="text-[11px] text-zinc-300 font-semibold tracking-wide">
            {method === 'npm' ? 'MASUKKAN KODE PAIRING' : 'PILIH FRAMEWORK & DAPATKAN KODE'}
          </span>
        </div>
        <div className="p-4">

          {method === 'npm' ? (
            /* NPM Pairing Input */
            <div className="space-y-4">
              <div className="bg-black border border-zinc-800/60 rounded p-3 space-y-1.5">
                <p className="text-[10px] text-zinc-500">// Jalankan di terminal project klien:</p>
                <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded px-3 py-2">
                  <span className="text-emerald-500 text-xs">$</span>
                  <code className="text-[11px] text-emerald-400">npx @masdannn/license-guard init</code>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="pairing-code" className="text-[10px] text-zinc-500 uppercase tracking-widest">
                  Kode Pairing dari Terminal *
                </label>
                <div className="flex items-center bg-black border border-zinc-800 rounded focus-within:border-emerald-500/60 transition-colors">
                  <span className="pl-3 text-emerald-500 text-xs select-none">›</span>
                  <input
                    id="pairing-code"
                    type="text"
                    value={pairingCode}
                    onChange={e => setPairingCode(e.target.value.toUpperCase())}
                    className="w-full bg-transparent px-3 py-3 text-sm text-emerald-400 focus:outline-none font-mono tracking-[0.3em] font-bold text-center"
                  />
                </div>
                <p className="text-[10px] text-zinc-600">Format: LG-XXXX-XXXX &mdash; berlaku 15 menit</p>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={handleNpmPair}
                  disabled={isPending || !pairingCode || !name || !domain}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-black text-xs font-bold rounded hover:bg-emerald-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  {isPending ? '[ MEMASANGKAN... ]' : '[ PAIR & CONNECT ]'}
                </button>
                <Link href="/projects" className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors">
                  cancel
                </Link>
              </div>
            </div>

          ) : (
            /* Integration Hub */
            <div className="space-y-4">
              {/* Framework Tabs */}
              <div className="flex gap-1 p-1 bg-black border border-zinc-800 rounded">
                {(Object.keys(snippets) as Array<keyof typeof snippets>).map(fw => (
                  <button
                    key={fw}
                    type="button"
                    onClick={() => setSelectedFramework(fw as typeof selectedFramework)}
                    className={`flex-1 py-1.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                      selectedFramework === fw
                        ? 'bg-zinc-800 text-white border border-zinc-700'
                        : 'text-zinc-600 hover:text-zinc-300'
                    }`}
                  >
                    {snippets[fw].label}
                  </button>
                ))}
              </div>

              {/* Snippet desc + copy */}
              <div className="flex items-start justify-between gap-3">
                <p className="text-[10px] text-zinc-500 leading-relaxed">{currentSnippet.desc}</p>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-[10px] border border-zinc-700 rounded text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-all cursor-pointer"
                >
                  {copied ? <><Check className="w-3 h-3 text-emerald-400" /><span>Copied</span></> : <><Copy className="w-3 h-3" /><span>Copy</span></>}
                </button>
              </div>

              {/* Code Block */}
              <pre className="bg-black border border-zinc-800 rounded p-3.5 text-[11px] text-emerald-300 font-mono leading-relaxed overflow-x-auto">
                <code>{currentSnippet.code}</code>
              </pre>

              {/* Test result */}
              {testStatus.tested && (
                <div className={`flex items-center gap-2 p-2.5 rounded border text-[11px] ${
                  testStatus.connected
                    ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/5 border-amber-500/30 text-amber-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${testStatus.connected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  {testStatus.message}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleHubSubmit}
                    disabled={isPending || !name || !domain}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-black text-xs font-bold rounded hover:bg-zinc-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {isPending ? '[ MENDAFTARKAN... ]' : '[ REGISTER PROJECT ]'}
                  </button>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testStatus.isChecking || !domain}
                    className="flex items-center gap-2 px-3 py-2 text-xs border border-zinc-700 text-zinc-400 rounded hover:border-zinc-500 hover:text-zinc-200 transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <Radio className={`w-3 h-3 ${testStatus.isChecking ? 'animate-spin' : ''}`} />
                    {testStatus.isChecking ? 'checking...' : '[ test connection ]'}
                  </button>
                </div>
                <Link href="/projects" className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors">
                  cancel
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
