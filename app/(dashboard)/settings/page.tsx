import type { Metadata } from 'next';
import { Settings, Key, Info, ShieldCheck } from 'lucide-react';
import IntegrationSnippet from '@/components/integration-snippet';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export const metadata: Metadata = { title: 'Settings — License Guard' };

const publicKey = (process.env.RSA_PUBLIC_KEY ?? '').replace(/\\n/g, '\n');

export default function SettingsPage() {
  const apiEndpoints = [
    {
      method: 'POST',
      path: '/api/license/register',
      body: '{ apiKey, domain }',
      desc: 'Mendaftarkan website klien & mendapatkan token JWT asimetris',
      badge: 'default',
    },
    {
      method: 'POST',
      path: '/api/license/heartbeat',
      body: '{ apiKey, domain, serverIp? }',
      desc: 'Memperbarui status lisensi secara berkala (Killswitch Check)',
      badge: 'success',
    },
    {
      method: 'GET',
      path: '/api/license/verify?token=',
      body: null,
      desc: 'Memvalidasi keabsahan token JWT secara langsung ke server',
      badge: 'secondary',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in-up">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-zinc-400" />
          <span>System Settings & SDK Hub</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Cryptographic public keys, client SDK integrations, and REST API references
        </p>
      </div>

      {/* RSA Public Key Card */}
      <Card className="border-zinc-800 bg-zinc-900/60 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-zinc-400" />
            <div>
              <CardTitle className="text-sm font-semibold">RSA-2048 Public Key</CardTitle>
              <CardDescription className="text-xs">
                Asymmetric key for local offline token verification on client instances
              </CardDescription>
            </div>
          </div>
          <Badge variant="success" dot>
            Publicly Shareable
          </Badge>
        </CardHeader>

        <CardContent className="space-y-3 pt-2">
          <p className="text-xs text-zinc-400">
            Kunci publik ini aman untuk dibagikan ke server klien untuk memvalidasi token JWT secara offline:
          </p>

          {publicKey ? (
            <pre className="font-mono text-xs text-zinc-300 bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto">
              {publicKey}
            </pre>
          ) : (
            <Alert variant="warning">
              <Info className="w-4 h-4" />
              <AlertTitle>Kunci RSA Belum Dikonfigurasi</AlertTitle>
              <AlertDescription>
                Jalankan <code className="font-mono bg-zinc-950 px-1.5 py-0.5 rounded text-white">node scripts/generate-keys.mjs</code> untuk membuat pasangan kunci RSA-2048 baru.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Multi-Language & Native HTML Integration Guide */}
      <IntegrationSnippet
        apiKey="YOUR_PROJECT_API_KEY"
        domain="client-domain.com"
      />

      {/* API Reference Card */}
      <Card className="border-zinc-800 bg-zinc-900/60 shadow-lg">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-zinc-400" />
            <CardTitle className="text-sm font-semibold">Universal REST API Endpoints</CardTitle>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase">CORS Enabled</span>
        </CardHeader>

        <div className="divide-y divide-zinc-800/60">
          {apiEndpoints.map((api) => (
            <div key={api.path} className="p-4 flex items-start gap-4 hover:bg-zinc-800/20 transition-colors">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-zinc-800 text-white border border-zinc-700">
                {api.method}
              </span>
              <div className="min-w-0 flex-1">
                <code className="text-xs font-mono font-semibold text-zinc-200">{api.path}</code>
                {api.body && (
                  <code className="block text-[11px] font-mono text-zinc-400 mt-1 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800/60 inline-block">
                    Body: {api.body}
                  </code>
                )}
                <p className="text-xs text-zinc-400 mt-1">{api.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
