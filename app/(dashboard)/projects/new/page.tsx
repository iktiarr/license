'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Code2,
  Copy,
  Check,
  CheckCircle,
  AlertCircle,
  Radio,
  Globe,
  Tag,
  Terminal,
} from 'lucide-react';

export default function NewProjectPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');

  const [selectedFramework, setSelectedFramework] = useState<'html' | 'php' | 'python' | 'go'>('html');
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
      code: `<!-- License Guard — Tempel di dalam <head> -->\n<script src="${origin}/guard.js" data-api-key="YOUR_API_KEY"></script>`,
      desc: 'Tempel 1 baris di dalam <head> pada file HTML, WordPress, atau template web apapun.',
    },
    php: {
      label: 'PHP',
      code: `<?php\n// Tambahkan di middleware atau index.php\n$response = file_get_contents("${origin}/api/license/heartbeat", false,\n  stream_context_create(['http' => [\n    'method' => 'POST',\n    'header' => 'Content-Type: application/json',\n    'content' => json_encode(['apiKey' => 'YOUR_API_KEY', 'domain' => $_SERVER['HTTP_HOST']])\n  ]])\n);\n$data = json_decode($response, true);\nif (!$data['valid'] || $data['status'] !== 'ACTIVE') { http_response_code(403); exit; }\n?>`,
      desc: 'Verifikasi lisensi di backend PHP / Laravel. Letakkan di awal middleware atau index.php.',
    },
    python: {
      label: 'Python',
      code: `import requests\n\n# Tambahkan di startup aplikasi\nres = requests.post("${origin}/api/license/heartbeat",\n  json={"apiKey": "YOUR_API_KEY", "domain": "your-domain.com"}\n)\ndata = res.json()\nif not data.get("valid") or data.get("status") != "ACTIVE":\n    raise Exception("License suspended or invalid")`,
      desc: 'Verifikasi lisensi di FastAPI, Flask, atau Django. Panggil saat startup aplikasi.',
    },
    go: {
      label: 'Go',
      code: `package main\n\nimport (\n  "bytes"\n  "encoding/json"\n  "net/http"\n)\n\nfunc checkLicense() bool {\n  body, _ := json.Marshal(map[string]string{\n    "apiKey": "YOUR_API_KEY",\n    "domain": "your-domain.com",\n  })\n  resp, err := http.Post("${origin}/api/license/heartbeat",\n    "application/json", bytes.NewBuffer(body))\n  if err != nil || resp.StatusCode != 200 { return false }\n  return true\n}`,
      desc: 'Verifikasi lisensi di aplikasi Go backend. Panggil checkLicense() saat startup.',
    },
  };

  const currentSnippet = snippets[selectedFramework];

  async function handleSubmit(e: React.FormEvent) {
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
          setSuccessMsg(`Project "${result.project.name}" berhasil didaftarkan!`);
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
            new_project<span className="text-zinc-600">.register()</span>
          </h1>
          <span className="text-[10px] px-2 py-0.5 rounded border border-zinc-700 text-zinc-500">
            integration hub
          </span>
        </div>
        <p className="text-[11px] text-zinc-600 mt-1.5 pl-5">
          // Untuk project HTML, PHP, Python, Go &mdash; tanpa npm
        </p>
      </div>

      {/* ── NPM Info Banner ── */}
      <div className="flex items-center justify-between gap-3 p-3 mb-5 rounded border border-zinc-800 bg-zinc-900/40">
        <div className="flex items-start gap-3">
          <Terminal className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <div className="text-xs text-zinc-400 leading-relaxed">
            <span className="text-zinc-200 font-semibold">Menggunakan React, Next.js, atau Vue?</span>
            {' '}Jalankan CLI:{' '}
            <code className="text-emerald-400 bg-black px-2 py-0.5 rounded border border-zinc-800 font-bold">
              npx @masdannn/license-guard init
            </code>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText('npx @masdannn/license-guard init');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-zinc-900 border border-zinc-700 text-zinc-200 rounded hover:bg-emerald-400 hover:text-black hover:border-emerald-400 transition-all cursor-pointer"
        >
          {copied ? (
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

      {/* ── Alerts ── */}
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

      {/* ── [01] Info Project ── */}
      <div className="mb-4 border border-zinc-800 rounded bg-zinc-950">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/60">
          <span className="text-[10px] text-zinc-600 font-semibold">[01]</span>
          <span className="text-[11px] text-zinc-300 font-semibold tracking-wide">INFORMASI PROJECT</span>
        </div>
        <div className="p-4 grid grid-cols-2 gap-4">
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

      {/* ── [02] Framework Snippet ── */}
      <div className="mb-4 border border-zinc-800 rounded bg-zinc-950">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/60">
          <span className="text-[10px] text-zinc-600 font-semibold">[02]</span>
          <Code2 className="w-3 h-3 text-zinc-500" />
          <span className="text-[11px] text-zinc-300 font-semibold tracking-wide">KODE INTEGRASI</span>
          <span className="ml-auto text-[10px] text-zinc-600">// salin ke project klien</span>
        </div>
        <div className="p-4 space-y-3">
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

          {/* Description + Copy */}
          <div className="flex items-start justify-between gap-3">
            <p className="text-[10px] text-zinc-500 leading-relaxed">{currentSnippet.desc}</p>
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-[10px] border border-zinc-700 rounded text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-all cursor-pointer"
            >
              {copied
                ? <><Check className="w-3 h-3 text-emerald-400" /><span>Copied</span></>
                : <><Copy className="w-3 h-3" /><span>Copy</span></>
              }
            </button>
          </div>

          {/* Code Block */}
          <pre className="bg-black border border-zinc-800 rounded p-3.5 text-[11px] text-emerald-300 font-mono leading-relaxed overflow-x-auto">
            <code>{currentSnippet.code}</code>
          </pre>

          <p className="text-[10px] text-zinc-600">
            Ganti <code className="text-zinc-400">YOUR_API_KEY</code> dengan API Key yang akan muncul setelah project terdaftar.
          </p>
        </div>
      </div>

      {/* ── [03] Submit ── */}
      <div className="border border-zinc-800 rounded bg-zinc-950">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/60">
          <span className="text-[10px] text-zinc-600 font-semibold">[03]</span>
          <span className="text-[11px] text-zinc-300 font-semibold tracking-wide">DAFTARKAN & CEK KONEKSI</span>
        </div>
        <div className="p-4 space-y-3">
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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !name || !domain}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-black text-xs font-bold rounded hover:bg-zinc-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {isPending ? '[ MENDAFTARKAN... ]' : '[ DAFTARKAN PROJECT ]'}
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
            <Link href="/projects" className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors ml-auto">
              cancel
            </Link>
          </div>
          <p className="text-[10px] text-zinc-600">
            Setelah terdaftar, API Key akan tersedia di halaman detail project. Ganti <code className="text-zinc-400">YOUR_API_KEY</code> di kode integrasi dengan API Key tersebut.
          </p>
        </div>
      </div>

    </div>
  );
}
