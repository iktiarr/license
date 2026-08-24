'use client';

import { useState } from 'react';
import { Check, Copy, Code2, Sparkles, FileCode2, Globe } from 'lucide-react';

type Props = {
  apiKey: string;
  domain: string;
  serverUrl?: string;
};

export default function IntegrationSnippet({ apiKey, domain, serverUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'html' | 'php' | 'node' | 'python' | 'go' | 'curl'>('html');

  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : serverUrl || 'http://localhost:3000';

  const snippets = {
    html: {
      name: 'HTML Native / Universal Web',
      icon: Globe,
      desc: 'Cukup tempelkan 1 baris ini di dalam tag <head> atau <body> pada file HTML/PHP/WordPress/Webflow Anda.',
      code: `<!-- Centralized License Guard (Native HTML / Web) -->\n<script src="${origin}/guard.js" data-api-key="${apiKey}"></script>`,
      lang: 'html',
    },
    php: {
      name: 'PHP (Native / Laravel)',
      icon: FileCode2,
      desc: 'Tempelkan di file index.php atau middleware backend PHP Anda untuk memblokir request jika suspended.',
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
      desc: 'Middleware Express.js untuk verifikasi lisensi sebelum routing dijalankan.',
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
    // If server unreachable, allow or handle according to grace policy
    next();
  }
}

app.use(licenseGuardMiddleware);`,
      lang: 'javascript',
    },
    python: {
      name: 'Python (Flask / FastAPI)',
      icon: FileCode2,
      desc: 'Middleware atau hook verifikasi untuk aplikasi backend Python.',
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
    except Exception as e:
        pass # Handle according to grace period policy

@app.middleware("http")
async def license_guard(request, call_next):
    # Call check_license() periodically or on startup
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

  const currentSnippet = snippets[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card">
      <div className="card-header border-b border-slate-100 bg-slate-900 text-white">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold">Integrasi & Script Client</h2>
        </div>
        <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-medium">
          Multi-Language SDK
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-lg">
          {(Object.keys(snippets) as Array<keyof typeof snippets>).map((tabKey) => {
            const tab = snippets[tabKey];
            const Icon = tab.icon;
            const isActive = activeTab === tabKey;
            return (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Description */}
        <div className="flex items-start justify-between gap-3 text-xs text-slate-600 bg-indigo-50/50 border border-indigo-100/80 rounded-lg p-3">
          <p className="leading-relaxed">{currentSnippet.desc}</p>
          <button
            onClick={handleCopy}
            className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm transition-all text-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Kode</span>
              </>
            )}
          </button>
        </div>

        {/* Code Snippet Box */}
        <div className="relative">
          <pre className="code-block text-xs leading-relaxed overflow-x-auto p-4 rounded-xl font-mono text-slate-200 bg-slate-950 border border-slate-800">
            <code>{currentSnippet.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
