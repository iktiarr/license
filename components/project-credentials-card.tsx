'use client';

import { useState } from 'react';
import { Key, Copy, Check, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProjectCredentialsCardProps {
  apiKey: string;
  domain: string;
}

export default function ProjectCredentialsCard({ apiKey, domain }: ProjectCredentialsCardProps) {
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedBypass, setCopiedBypass] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);

  // Generate deterministic Emergency Bypass Key
  const bypassKey = (() => {
    const secret = 'EBP_SALT_masdannn_guard_98f4';
    let hash = 0;
    const str = `${apiKey}:${domain}:${secret}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    const part2 = Math.abs(hash ^ 0x5a5a5a5a).toString(16).toUpperCase().padStart(8, '0');
    return `EBP-${hex}${part2}`;
  })();

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyBypass = () => {
    navigator.clipboard.writeText(bypassKey);
    setCopiedBypass(true);
    setTimeout(() => setCopiedBypass(false), 2000);
  };

  const handleCopyCli = () => {
    navigator.clipboard.writeText('npx @masdannn/license-guard bypass');
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* ── 1. Secret API Key Card ── */}
      <Card className="border-slate-200 bg-white shadow-2xs">
        <CardHeader className="py-3.5 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-500" />
            <CardTitle className="text-sm font-bold text-slate-900">
              Secret API Key
            </CardTitle>
          </div>
          <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full uppercase">
            Client SDK Secret
          </span>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <p className="text-xs text-slate-500 leading-relaxed">
            Kunci otentikasi unik untuk SDK client di website klien:
          </p>

          <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-mono text-xs text-slate-800 flex-1 truncate font-semibold">
              {showKey ? apiKey : `${apiKey.slice(0, 8)}••••••••••••••••••••••••`}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowKey(!showKey)}
              className="h-7 px-2 text-slate-500 hover:text-slate-800"
              title={showKey ? 'Sembunyikan' : 'Tampilkan'}
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyKey}
              className="h-7 px-2.5 text-xs font-semibold bg-white text-slate-700 border-slate-200 shadow-2xs"
            >
              {copiedKey ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600 mr-1" />
                  <span className="text-emerald-700">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  <span>Salin</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Emergency Fail-Safe Bypass Key Card ── */}
      <Card className="border-rose-200 bg-rose-50/20 shadow-2xs">
        <CardHeader className="py-3 px-5 border-b border-rose-100 bg-rose-100/30 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <CardTitle className="text-sm font-bold text-rose-950">
              Emergency Offline Key
            </CardTitle>
          </div>
          <span className="text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-full uppercase">
            Fail-Safe
          </span>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Kunci pemulihan darurat untuk meng-unlock website klien jika server pusat down:
          </p>

          <div className="flex items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-rose-200 shadow-2xs">
            <span className="font-mono text-xs font-bold text-rose-900 truncate">
              {bypassKey}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyBypass}
              className="h-7 px-2.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200 shrink-0"
            >
              {copiedBypass ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600 mr-1" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  <span>Salin Kunci</span>
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between gap-2 p-2 bg-slate-900 text-slate-200 rounded-lg text-[11px] font-mono">
            <span className="truncate">npx @masdannn/license-guard bypass</span>
            <button
              onClick={handleCopyCli}
              className="text-slate-400 hover:text-white p-1 rounded"
              title="Salin Perintah"
            >
              {copiedCli ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
