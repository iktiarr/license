'use client';

import { useState } from 'react';
import { Check, Copy, Code2, Globe, Server, Terminal } from 'lucide-react';

type Props = {
  apiKey: string;
  domain: string;
  serverUrl?: string;
};

export default function IntegrationSnippet({ apiKey, domain, serverUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const [category, setCategory] = useState<'frontend' | 'backend'>('frontend');
  const [activeTab, setActiveTab] = useState<string>('html');

  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : serverUrl || 'https://license-tau-nine.vercel.app';

  const frontendSnippets: Record<string, { name: string; desc: string; code: string }> = {
    html: {
      name: 'HTML / WordPress',
      desc: 'Tempelkan 1 baris ini di dalam tag <head> atau <body> pada file HTML, WordPress, atau template web Anda.',
      code: `<!-- Centralized License Guard (Client SDK) -->\n<script src="${origin}/guard.js" data-api-key="${apiKey}"></script>`,
    },
    spa: {
      name: 'React / Next.js / Vue',
      desc: 'Gunakan NPM package untuk proteksi otomatis atau inisialisasi di root component.',
      code: `// Jalankan di terminal:\n// $ npm install @masdannn/license-guard\n\n// Di root layout / _app.tsx:\nimport { initGuard } from '@masdannn/license-guard';\n\ninitGuard({\n  apiKey: '${apiKey}',\n  endpoint: '${origin}',\n});`,
    },
  };

  const backendSnippets: Record<string, { name: string; desc: string; code: string }> = {
    php: {
      name: 'PHP / Laravel',
      desc: 'Letakkan di awal file index.php atau middleware backend PHP Anda.',
      code: `<?php\n// Verifikasi Lisensi via Central License Guard\n$response = file_get_contents("${origin}/api/license/heartbeat", false,\n  stream_context_create(['http' => [\n    'method'  => 'POST',\n    'header'  => 'Content-Type: application/json',\n    'content' => json_encode([\n      'apiKey' => '${apiKey}',\n      'domain' => $_SERVER['HTTP_HOST'] ?? '${domain}'\n    ])\n  ]])\n);\n$data = json_decode($response, true);\nif (!$data['valid'] || $data['status'] !== 'ACTIVE') {\n  http_response_code(403);\n  die("<h1>403 Forbidden - Lisensi Dinonaktifkan</h1>");\n}\n?>`,
    },
    node: {
      name: 'Node.js / Express',
      desc: 'Middleware Express.js untuk verifikasi status lisensi secara berkala.',
      code: `import express from 'express';\n\nconst app = express();\n\nasync function licenseGuardMiddleware(req, res, next) {\n  try {\n    const response = await fetch('${origin}/api/license/heartbeat', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ apiKey: '${apiKey}', domain: '${domain}' }),\n    });\n    const data = await response.json();\n    if (!data.valid || data.status !== 'ACTIVE') {\n      return res.status(403).send('<h1>403 - License Suspended</h1>');\n    }\n    next();\n  } catch (err) {\n    next(); // toleransi jaringan\n  }\n}\n\napp.use(licenseGuardMiddleware);`,
    },
    python: {
      name: 'Python (FastAPI/Django)',
      desc: 'Middleware verifikasi lisensi untuk server backend Python.',
      code: `import requests\nfrom fastapi import FastAPI, HTTPException\n\napp = FastAPI()\n\ndef verify_license():\n    try:\n        res = requests.post(\n            "${origin}/api/license/heartbeat",\n            json={"apiKey": "${apiKey}", "domain": "${domain}"},\n            timeout=5\n        )\n        data = res.json()\n        if not data.get("valid") or data.get("status") != "ACTIVE":\n            raise HTTPException(status_code=403, detail="License Suspended")\n    except Exception:\n        pass`,
    },
    go: {
      name: 'Go (Golang)',
      desc: 'HTTP middleware untuk backend Go (Standard http / Gin / Fiber).',
      code: `package main\n\nimport (\n\t"bytes"\n\t"encoding/json"\n\t"net/http"\n\t"time"\n)\n\nfunc LicenseMiddleware(next http.Handler) http.Handler {\n\treturn http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n\t\tbody, _ := json.Marshal(map[string]string{\n\t\t\t"apiKey": "${apiKey}",\n\t\t\t"domain": "${domain}",\n\t\t})\n\t\tclient := &http.Client{Timeout: 5 * time.Second}\n\t\tresp, err := client.Post("${origin}/api/license/heartbeat", "application/json", bytes.NewBuffer(body))\n\t\tif err != nil || resp.StatusCode != http.StatusOK {\n\t\t\thttp.Error(w, "License Suspended", http.StatusForbidden)\n\t\t\treturn\n\t\t}\n\t\tnext.ServeHTTP(w, r)\n\t})\n}`,
    },
    curl: {
      name: 'cURL / REST API',
      desc: 'HTTP endpoint standar yang kompatibel dengan semua bahasa dan platform.',
      code: `curl -X POST "${origin}/api/license/heartbeat" \\\n  -H "Content-Type: application/json" \\\n  -d '{"apiKey": "${apiKey}", "domain": "${domain}"}'`,
    },
  };

  const activeGroup = category === 'frontend' ? frontendSnippets : backendSnippets;
  const currentSnippet = activeGroup[activeTab] || Object.values(activeGroup)[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-zinc-800 rounded bg-zinc-950 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/60">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-zinc-200 tracking-wide uppercase">
            INTEGRATION SDK &amp; CODE SNIPPETS
          </span>
        </div>

        {/* Category Switcher */}
        <div className="flex items-center p-0.5 bg-black rounded border border-zinc-800">
          <button
            onClick={() => {
              setCategory('frontend');
              setActiveTab('html');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
              category === 'frontend'
                ? 'bg-zinc-800 text-emerald-400 border border-zinc-700'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Frontend / Web</span>
          </button>
          <button
            onClick={() => {
              setCategory('backend');
              setActiveTab('php');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
              category === 'backend'
                ? 'bg-zinc-800 text-emerald-400 border border-zinc-700'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Backend / Server</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Language Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-black rounded border border-zinc-800/80">
          {Object.entries(activeGroup).map(([key, item]) => {
            const isSelected = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60'
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>

        {/* Description + Copy */}
        <div className="flex items-center justify-between gap-4 p-3 bg-black border border-zinc-800 rounded">
          <p className="text-xs text-zinc-400 leading-relaxed">{currentSnippet.desc}</p>
          <button
            onClick={handleCopy}
            className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-zinc-100 text-black rounded hover:bg-emerald-400 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-950" />
                <span>COPIED!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>[ COPY CODE ]</span>
              </>
            )}
          </button>
        </div>

        {/* Code Box */}
        <pre className="p-4 rounded border border-zinc-800 bg-black text-xs text-emerald-400 leading-relaxed font-mono overflow-x-auto select-all">
          <code>{currentSnippet.code}</code>
        </pre>
      </div>
    </div>
  );
}
