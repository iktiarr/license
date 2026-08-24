import type { Metadata } from 'next';
import { Settings, Key, Info } from 'lucide-react';
import IntegrationSnippet from '@/components/integration-snippet';

export const metadata: Metadata = { title: 'Settings' };

const publicKey = (process.env.RSA_PUBLIC_KEY ?? '').replace(/\\n/g, '\n');




export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-600" />
          Settings
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Cryptographic keys and client integration guide
        </p>
      </div>

      {/* RSA Public Key */}
      <div className="card animate-fade-in-up delay-100">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-700">RSA Public Key</h2>
          </div>
          <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
            Safe to share
          </span>
        </div>
        <div className="card-body space-y-3">
          <p className="text-sm text-slate-600">
            Share this public key with client sites to verify JWT tokens locally without network calls.
          </p>
          {publicKey ? (
            <div className="code-block text-xs leading-relaxed whitespace-pre-wrap">
              {publicKey}
            </div>
          ) : (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">RSA keys not configured</p>
                <p className="text-xs text-amber-700 mt-1">
                  Run{' '}
                  <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">
                    node scripts/generate-keys.mjs
                  </code>{' '}
                  to generate RSA-2048 key pair and restart the server.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Language & Native HTML Integration Guide */}
      <div className="animate-fade-in-up delay-200">
        <IntegrationSnippet
          apiKey="YOUR_PROJECT_API_KEY"
          domain="client-domain.com"
        />
      </div>

      {/* API Reference */}
      <div className="card animate-fade-in-up delay-300">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-slate-700">API Reference</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {[
            {
              method: 'POST',
              path: '/api/license/register',
              body: '{ apiKey, domain }',
              desc: 'Register site, receive signed JWT',
              color: 'bg-blue-500',
            },
            {
              method: 'POST',
              path: '/api/license/heartbeat',
              body: '{ apiKey, domain, serverIp? }',
              desc: 'Renew JWT, update last seen',
              color: 'bg-blue-500',
            },
            {
              method: 'GET',
              path: '/api/license/verify?token=',
              body: null,
              desc: 'Verify a JWT token validity',
              color: 'bg-emerald-500',
            },
          ].map((api) => (
            <div key={api.path} className="px-5 py-4 flex items-start gap-4">
              <span className={`shrink-0 text-xs font-bold text-white px-2 py-0.5 rounded ${api.color}`}>
                {api.method}
              </span>
              <div className="min-w-0">
                <code className="text-sm text-slate-700 font-mono">{api.path}</code>
                {api.body && (
                  <code className="block text-xs text-slate-400 font-mono mt-0.5">{api.body}</code>
                )}
                <p className="text-xs text-slate-500 mt-1">{api.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
