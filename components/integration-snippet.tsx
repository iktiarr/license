'use client';

import { useState } from 'react';
import { Check, Copy, Code2, Sparkles, FileCode2, Globe, Server, Layers } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
      : serverUrl || 'http://localhost:3000';

  const frontendSnippets: Record<string, { name: string; icon: typeof Globe; desc: string; code: string; lang: string }> = {
    html: {
      name: 'HTML Native (1-Baris Tag Script)',
      icon: Globe,
      desc: 'Cukup tempelkan 1 baris ini di dalam tag <head> atau <body> pada website HTML biasa, PHP template, WordPress, atau Webflow Anda.',
      code: `<!-- Centralized License Guard (Universal Client SDK) -->\n<script src="${origin}/guard.js" data-api-key="${apiKey}"></script>`,
      lang: 'html',
    },
    spa: {
      name: 'React / Vue / Next.js / SPA',
      icon: Layers,
      desc: 'Integrasi client-side programmatic menggunakan script helper dan event listener.',
      code: `// Pasang di _app.tsx / layout.tsx / index.html
import useEffect from 'react';

export function LicenseGuardProvider({ children }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '${origin}/guard.js';
    script.setAttribute('data-api-key', '${apiKey}');
    document.head.appendChild(script);

    window.onLicenseSuspended = (status) => {
      console.warn('License suspended:', status);
    };
  }, []);

  return <>{children}</>;
}`,
      lang: 'javascript',
    },
  };

  const backendSnippets: Record<string, { name: string; icon: typeof Server; desc: string; code: string; lang: string }> = {
    php: {
      name: 'PHP (Native / Laravel / CI)',
      icon: FileCode2,
      desc: 'Tempelkan di file index.php atau middleware backend PHP Anda untuk memverifikasi lisensi di tingkat server.',
      code: `<?php
function verifyLicenseGuard() {
    $apiKey = "${apiKey}";
    $domain = "${domain}";
    $endpoint = "${origin}/api/license/heartbeat";

    $ch = curl_init($endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'apiKey' => $apiKey,
        'domain' => $domain
    ]));
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $data = json_decode($response, true);
    if ($httpCode !== 200 || empty($data['valid']) || $data['status'] !== 'ACTIVE') {
        http_response_code(403);
        die("<h1>403 Forbidden - License Suspended</h1><p>Contact administrator to reactivate.</p>");
    }
}
verifyLicenseGuard();
?>`,
      lang: 'php',
    },
    node: {
      name: 'Node.js / Express',
      icon: Code2,
      desc: 'Middleware Express.js untuk verifikasi lisensi sebelum request di-handle oleh route controller.',
      code: `import express from 'express';

const app = express();

async function licenseGuardMiddleware(req, res, next) {
  try {
    const response = await fetch('${origin}/api/license/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: '${apiKey}',
        domain: '${domain}',
      }),
    });

    const data = await response.json();
    if (!data.valid || data.status !== 'ACTIVE') {
      return res.status(403).send('<h1>License Suspended</h1>');
    }
    next();
  } catch (err) {
    // Toleransi jika server guard sementara offline
    next();
  }
}

app.use(licenseGuardMiddleware);`,
      lang: 'javascript',
    },
    python: {
      name: 'Python (FastAPI / Django)',
      icon: FileCode2,
      desc: 'Middleware verifikasi lisensi untuk aplikasi server Python.',
      code: `import requests
from fastapi import FastAPI, HTTPException

app = FastAPI()

def check_license():
    try:
        res = requests.post(
            "${origin}/api/license/heartbeat",
            json={"apiKey": "${apiKey}", "domain": "${domain}"},
            timeout=5
        )
        data = res.json()
        if res.status_code != 200 or not data.get("valid") or data.get("status") != "ACTIVE":
            raise HTTPException(status_code=403, detail="License Suspended")
    except Exception:
        pass # Grace period fallback

@app.middleware("http")
async def license_guard(request, call_next):
    # Verifikasi lisensi pada startup / per interval
    return await call_next(request)`,
      lang: 'python',
    },
    go: {
      name: 'Go (Golang)',
      icon: Code2,
      desc: 'HTTP Middleware untuk framework Go (Gin / Chi / Fiber / Standard net/http).',
      code: `package main

import (
    "bytes"
    "encoding/json"
    "net/http"
    "time"
)

func LicenseGuardMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        payload, _ := json.Marshal(map[string]string{
            "apiKey": "${apiKey}",
            "domain": "${domain}",
        })
        
        client := &http.Client{Timeout: 5 * time.Second}
        resp, err := client.Post("${origin}/api/license/heartbeat", "application/json", bytes.NewBuffer(payload))
        
        if err != nil || resp.StatusCode != http.StatusOK {
            http.Error(w, "License Suspended", http.StatusForbidden)
            return
        }
        next.ServeHTTP(w, r)
    })
}`,
      lang: 'go',
    },
    curl: {
      name: 'cURL / REST API',
      icon: Sparkles,
      desc: 'Endpoint standar JSON REST API yang kompatibel dengan semua bahasa pemrograman.',
      code: `curl -X POST "${origin}/api/license/heartbeat" \\
  -H "Content-Type: application/json" \\
  -d '{
    "apiKey": "${apiKey}",
    "domain": "${domain}"
  }'`,
      lang: 'bash',
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
    <Card className="border-zinc-800 bg-zinc-900/60 shadow-lg">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-zinc-300" />
          <CardTitle className="text-sm">Client Integration Hub</CardTitle>
        </div>
        
        {/* Main Category Switcher: Frontend vs Backend */}
        <div className="flex items-center p-0.5 bg-zinc-950 rounded-lg border border-zinc-800">
          <button
            onClick={() => {
              setCategory('frontend');
              setActiveTab('html');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              category === 'frontend'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Frontend (Web / HTML)</span>
          </button>
          <button
            onClick={() => {
              setCategory('backend');
              setActiveTab('php');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              category === 'backend'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Backend (Server / API)</span>
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {/* Sub Language Tabs */}
        <div className="flex flex-wrap gap-1 p-1 bg-zinc-950 rounded-lg border border-zinc-800/80">
          {Object.entries(activeGroup).map(([key, item]) => {
            const Icon = item.icon;
            const isSelected = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-800 text-white font-semibold shadow-sm border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Description & Copy Button */}
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

        {/* Code Box */}
        <div className="relative">
          <pre className="font-mono text-xs leading-relaxed overflow-x-auto p-4 rounded-xl text-zinc-200 bg-zinc-950 border border-zinc-800 shadow-inner">
            <code>{currentSnippet.code}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
