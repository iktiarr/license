'use client';

import { signIn } from 'next-auth/react';
import { useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Terminal, Eye, EyeOff, ShieldAlert, CheckCircle2, ArrowRight, UserPlus, Lock, User } from 'lucide-react';

function LoginForm() {
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get('registered') === 'true';
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const infoMsg = isRegistered ? 'REGISTRATION OK: Akun developer berhasil dibuat. Silakan login.' : '';
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    const identifier = (formData.get('identifier') as string || '').trim();
    const password = (formData.get('password') as string || '').trim();

    if (!identifier || !password) {
      setError('VALIDATION ERROR: Username/Email dan password wajib diisi.');
      return;
    }

    startTransition(async () => {
      const result = await signIn('credentials', {
        email: identifier,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('ACCESS DENIED: Username/Email atau Password salah.');
      } else {
        const callbackUrl = searchParams.get('callbackUrl') || '/';
        window.location.href = callbackUrl;
      }
    });
  }

  return (
    <div className="relative w-full max-w-sm border border-zinc-800 bg-zinc-950/95 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden">
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-zinc-200 font-bold tracking-wider">root@guard:~$ auth --login</span>
        </div>
        <span className="w-2.5 h-2.5" />
      </div>

      <div className="p-6 space-y-5">
        {/* Header Info */}
        <div className="border-b border-zinc-800/80 pb-3">
          <h1 className="text-sm font-bold text-zinc-100 tracking-wide uppercase">
            Developer Login Hub
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {"// Masuk untuk mengelola lisensi & instance klien"}
          </p>
        </div>

        {/* Feedback Messages */}
        {infoMsg && (
          <div className="flex items-start gap-2 p-3 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 rounded border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs animate-shake">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email / Username Field */}
          <div className="space-y-1">
            <label htmlFor="identifier" className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-zinc-400 font-bold">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>[ USERNAME ATAU EMAIL ]</span>
            </label>
            <div className="relative flex items-center bg-black border border-zinc-800 rounded-lg focus-within:border-emerald-500/80 focus-within:ring-1 focus-within:ring-emerald-500/40 transition-all">
              <span className="pl-3 text-emerald-500 text-xs select-none">&gt;</span>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                placeholder="username / email@example.com"
                autoComplete="username"
                className="w-full bg-transparent px-2.5 py-2 text-xs text-zinc-100 focus:outline-none font-mono placeholder:text-zinc-700"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label htmlFor="password" className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-zinc-400 font-bold">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>[ PASSWORD / KEY ]</span>
            </label>
            <div className="relative flex items-center bg-black border border-zinc-800 rounded-lg focus-within:border-emerald-500/80 focus-within:ring-1 focus-within:ring-emerald-500/40 transition-all">
              <span className="pl-3 text-emerald-500 text-xs select-none">&gt;</span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-transparent px-2.5 py-2 pr-9 text-xs text-zinc-100 focus:outline-none font-mono placeholder:text-zinc-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 text-zinc-500 hover:text-zinc-300 transition-colors p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="login-submit"
            type="submit"
            disabled={isPending}
            className="w-full mt-3 py-2.5 px-4 bg-zinc-100 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg"
          >
            {isPending ? (
              <span>[ AUTHENTICATING... ]</span>
            ) : (
              <>
                <span>[ ACCESS SYSTEM ]</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Register */}
        <div className="border-t border-zinc-800/80 pt-3 text-center">
          <Link
            href="/register"
            className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Developer baru?</span>
            <span className="font-bold underline text-zinc-300 hover:text-emerald-400">cd ../register</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-4 font-mono select-none relative overflow-hidden">
      {/* Background Matrix/Grid Texture */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <Suspense fallback={<div className="text-zinc-500 text-xs font-mono">Loading authentication interface...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
