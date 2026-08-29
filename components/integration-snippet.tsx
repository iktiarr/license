'use client';

import { useState } from 'react';
import { Check, Copy, Layers } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type FrameworkKey = 'nextjs' | 'vite_react' | 'html' | 'php' | 'flutter' | 'express';

type Props = {
  apiKey: string;
  domain: string;
  serverUrl?: string;
};

export default function IntegrationSnippet({ apiKey, domain, serverUrl }: Props) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [framework, setFramework] = useState<FrameworkKey>('nextjs');

  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : serverUrl || 'https://license-tau-nine.vercel.app';

  const effectiveApiKey =
    apiKey && apiKey !== 'YOUR_PROJECT_API_KEY' && !apiKey.includes('YOUR_')
      ? apiKey
      : 'LG-API-KEY-PROJECT-ANDA';

  const targetDomain = domain || 'domain-klien.com';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const manualGuides: Record<
    string,
    {
      name: string;
      badge: string;
      steps: Array<{
        step: number;
        title: string;
        file?: string;
        desc: string;
        code: string;
      }>;
    }
  > = {
    nextjs: {
      name: 'Next.js',
      badge: 'App & Pages Router',
      steps: [
        {
          step: 1,
          title: 'Install SDK',
          desc: 'Install dependensi di terminal proyek Next.js:',
          code: 'npm install @masdannn/license-guard',
        },
        {
          step: 2,
          title: 'Buat file lib/license-guard.ts',
          file: 'lib/license-guard.ts',
          desc: 'Simpan file berikut di folder lib/license-guard.ts:',
          code: `'use client';

import { initGuard } from '@masdannn/license-guard';
import { useEffect } from 'react';

const LICENSE_KEY = '${effectiveApiKey}';
const ENDPOINT = '${origin}';

if (typeof window !== 'undefined') {
  initGuard({ apiKey: LICENSE_KEY, endpoint: ENDPOINT, domain: '${targetDomain}' });
}

export function LicenseGuard() {
  useEffect(() => {
    initGuard({ apiKey: LICENSE_KEY, endpoint: ENDPOINT, domain: '${targetDomain}' });
  }, []);
  return null;
}
`,
        },
        {
          step: 3,
          title: 'Pasang di app/layout.tsx',
          file: 'app/layout.tsx',
          desc: 'Import di root layout agar aktif di seluruh halaman:',
          code: `import { LicenseGuard } from '@/lib/license-guard';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <LicenseGuard />
        {children}
      </body>
    </html>
  );
}`,
        },
      ],
    },
    vite_react: {
      name: 'Vite (React / Vue)',
      badge: 'SPA Client',
      steps: [
        {
          step: 1,
          title: 'Install SDK',
          desc: 'Install di terminal proyek Vite Anda:',
          code: 'npm install @masdannn/license-guard',
        },
        {
          step: 2,
          title: 'Buat file src/lib/license-guard.ts',
          file: 'src/lib/license-guard.ts',
          desc: 'Buat file di src/lib/license-guard.ts:',
          code: `import { initGuard } from '@masdannn/license-guard';

initGuard({
  apiKey: '${effectiveApiKey}',
  endpoint: '${origin}',
  domain: '${targetDomain}',
});`,
        },
        {
          step: 3,
          title: 'Import di src/main.tsx',
          file: 'src/main.tsx',
          desc: 'Import di baris paling atas berkas main entry:',
          code: `import './lib/license-guard';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);`,
        },
      ],
    },
    html: {
      name: 'HTML / WordPress',
      badge: 'Statis / Native Web',
      steps: [
        {
          step: 1,
          title: 'Tempel Script di <head>',
          file: 'index.html / header.php',
          desc: 'Tempelkan 1 baris script ini di dalam tag <head>:',
          code: `<script src="${origin}/guard.js" data-api-key="${effectiveApiKey}" data-endpoint="${origin}"></script>`,
        },
      ],
    },
    php: {
      name: 'PHP / Laravel',
      badge: 'Backend PHP',
      steps: [
        {
          step: 1,
          title: 'Pasang di index.php atau Middleware',
          file: 'index.php',
          desc: 'Letakkan di awal file index.php sebelum routing dieksekusi:',
          code: `<?php
function checkLicense() {
    $payload = json_encode(['apiKey' => '${effectiveApiKey}', 'domain' => $_SERVER['HTTP_HOST'] ?? '${targetDomain}']);
    $ch = curl_init('${origin}/api/license/heartbeat');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 3);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($code === 403 || $code === 401) {
        http_response_code(403);
        die("<h1>403 Forbidden - Lisensi Ditangguhkan</h1>");
    }
}
checkLicense();
?>`,
        },
      ],
    },
    flutter: {
      name: 'Flutter / Dart',
      badge: 'Mobile & Desktop App',
      steps: [
        {
          step: 1,
          title: 'Buat file lib/license_guard.dart',
          file: 'lib/license_guard.dart',
          desc: 'Buat berkas guard di folder lib/license_guard.dart:',
          code: `import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class LicenseGuard {
  static const String apiKey = '${effectiveApiKey}';
  static const String endpoint = '${origin}';
  static const String domain = '${targetDomain}';

  static void init(BuildContext context) {
    _check(context);
    Timer.periodic(const Duration(minutes: 5), (_) => _check(context));
  }

  static Future<void> _check(BuildContext context) async {
    try {
      final res = await http.post(
        Uri.parse('$endpoint/api/license/heartbeat'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'apiKey': apiKey, 'domain': domain}),
      ).timeout(const Duration(seconds: 4));

      if (res.statusCode == 403 || res.statusCode == 401) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => WillPopScope(
            onWillPop: () async => false,
            child: const AlertDialog(
              title: Text('Lisensi Ditangguhkan', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
              content: Text('Akses aplikasi ini dinonaktifkan oleh administrator.'),
            ),
          ),
        );
      }
    } catch (_) {}
  }
}`,
        },
        {
          step: 2,
          title: 'Panggil di main.dart',
          file: 'lib/main.dart',
          desc: 'Panggil LicenseGuard.init(context) saat aplikasi start:',
          code: `// Di dalam build widget utama:
WidgetsBinding.instance.addPostFrameCallback((_) {
  LicenseGuard.init(context);
});`,
        },
      ],
    },
    express: {
      name: 'Node.js Express',
      badge: 'Express Backend',
      steps: [
        {
          step: 1,
          title: 'Pasang Middleware di Express',
          file: 'server.js',
          desc: 'Gunakan guardMiddleware di Express app:',
          code: `import express from 'express';
import { guardMiddleware } from '@masdannn/license-guard';

const app = express();

app.use(guardMiddleware({
  apiKey: '${effectiveApiKey}',
  endpoint: '${origin}',
  domain: '${targetDomain}',
}));

app.listen(3000);`,
        },
      ],
    },
  };

  const currentManualGuide = manualGuides[framework] || manualGuides.nextjs;

  return (
    <Card className="border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Header */}
      <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-row items-center justify-between gap-2 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-700" />
          <CardTitle className="text-xs font-bold text-slate-900">
            Panduan Pemasangan Kode
          </CardTitle>
        </div>

        <Badge variant="outline" className="text-[10px] bg-white border-slate-200 text-slate-600 font-medium">
          {currentManualGuide.badge}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Framework Switcher */}
        <div className="flex flex-wrap gap-1">
          {Object.entries(manualGuides).map(([key, guide]) => {
            const isSelected = framework === key;
            return (
              <button
                type="button"
                key={key}
                onClick={() => setFramework(key as FrameworkKey)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                {guide.name}
              </button>
            );
          })}
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          {currentManualGuide.steps.map((s, idx) => (
            <div
              key={s.step}
              className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-4.5 h-4.5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center font-mono shrink-0">
                    {s.step}
                  </span>
                  <span className="text-xs font-bold text-slate-900 truncate">{s.title}</span>
                  {s.file && (
                    <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                      {s.file}
                    </span>
                  )}
                </div>
              </div>

              {/* Code Box with integrated icon button on top right */}
              <div className="relative group">
                <pre className="p-3 pr-10 rounded-md border border-slate-800 bg-slate-950 text-xs text-emerald-400 font-mono overflow-x-auto select-all leading-relaxed max-h-60">
                  <code>{s.code}</code>
                </pre>

                <button
                  type="button"
                  title="Salin Kode"
                  onClick={() => copyToClipboard(s.code, `code-step-${idx}`)}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700 shadow-xs"
                >
                  {copiedKey === `code-step-${idx}` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
