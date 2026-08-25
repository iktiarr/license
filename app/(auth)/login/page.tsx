'use client';

import { signIn } from 'next-auth/react';
import { useState, useTransition } from 'react';
import { Terminal, Eye, EyeOff, ShieldAlert, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    startTransition(async () => {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('ACCESS DENIED: Invalid credentials');
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        const callbackUrl = urlParams.get('callbackUrl') || '/';
        window.location.href = callbackUrl;
      }
    });
  }

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

      {/* Terminal Box */}
      <div className="relative w-full max-w-sm border border-zinc-800 bg-zinc-950/90 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden">
        {/* Terminal Titlebar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
            <Terminal className="w-3 h-3 text-emerald-400" />
            <span className="text-zinc-300 font-semibold tracking-wider">root@guard:~$ auth</span>
          </div>
          <span className="w-2.5 h-2.5" />
        </div>

        <div className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs animate-shake">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                [USER / EMAIL]
              </label>
              <div className="relative flex items-center bg-black border border-zinc-800 rounded-lg focus-within:border-emerald-500/80 focus-within:ring-1 focus-within:ring-emerald-500/40 transition-all">
                <span className="pl-3 text-emerald-500 text-xs select-none">&gt;</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full bg-transparent px-2.5 py-2 text-xs text-zinc-100 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                [PASSWORD / KEY]
              </label>
              <div className="relative flex items-center bg-black border border-zinc-800 rounded-lg focus-within:border-emerald-500/80 focus-within:ring-1 focus-within:ring-emerald-500/40 transition-all">
                <span className="pl-3 text-emerald-500 text-xs select-none">&gt;</span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="w-full bg-transparent px-2.5 py-2 pr-9 text-xs text-zinc-100 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
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
        </div>
      </div>
    </div>
  );
}
