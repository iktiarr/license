'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Terminal, Eye, EyeOff, ShieldAlert, CheckCircle2, ArrowRight, UserPlus, Phone, Mail, User, Lock } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const username = (formData.get('username') as string || '').trim();
    const email = (formData.get('email') as string || '').trim();
    const phone = (formData.get('phone') as string || '').trim();
    const password = (formData.get('password') as string || '').trim();

    if (!username || !email || !phone || !password) {
      setError('VALIDATION ERROR: Semua kolom wajib diisi.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, phone, password }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.error || 'Gagal mendaftar. Silakan coba lagi.');
          return;
        }

        setSuccess('REGISTRATION SUCCESSFUL: Membuka dashboard...');

        // Auto sign-in after successful registration
        const loginRes = await signIn('credentials', {
          email: username,
          password,
          redirect: false,
        });

        if (loginRes?.ok) {
          router.push('/');
          router.refresh();
        } else {
          setTimeout(() => {
            router.push('/login?registered=true');
          }, 1500);
        }
      } catch {
        setError('NETWORK ERROR: Gagal terhubung ke server.');
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
      <div className="relative w-full max-w-md border border-zinc-800 bg-zinc-950/95 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden">
        {/* Terminal Titlebar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-zinc-200 font-bold tracking-wider">root@guard:~$ auth --register</span>
          </div>
          <span className="w-2.5 h-2.5" />
        </div>

        <div className="p-6 space-y-5">
          {/* Header Info */}
          <div className="border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <h1 className="text-sm font-bold text-zinc-100 tracking-wide uppercase">
                Developer Registration
              </h1>
            </div>
            <p className="text-xs text-zinc-500 mt-1 pl-6">
              {"// Daftarkan akun developer baru untuk mengelola lisensi aplikasi"}
            </p>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs animate-shake">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 p-3 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Username Field */}
            <div className="space-y-1">
              <label htmlFor="username" className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-zinc-400 font-bold">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>[ USERNAME ]</span>
              </label>
              <div className="relative flex items-center bg-black border border-zinc-800 rounded-lg focus-within:border-emerald-500/80 focus-within:ring-1 focus-within:ring-emerald-500/40 transition-all">
                <span className="pl-3 text-emerald-500 text-xs select-none">&gt;</span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="developer_name"
                  autoComplete="username"
                  className="w-full bg-transparent px-2.5 py-2 text-xs text-zinc-100 focus:outline-none font-mono placeholder:text-zinc-700"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label htmlFor="email" className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-zinc-400 font-bold">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>[ EMAIL ]</span>
              </label>
              <div className="relative flex items-center bg-black border border-zinc-800 rounded-lg focus-within:border-emerald-500/80 focus-within:ring-1 focus-within:ring-emerald-500/40 transition-all">
                <span className="pl-3 text-emerald-500 text-xs select-none">&gt;</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="developer@example.com"
                  autoComplete="email"
                  className="w-full bg-transparent px-2.5 py-2 text-xs text-zinc-100 focus:outline-none font-mono placeholder:text-zinc-700"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="space-y-1">
              <label htmlFor="phone" className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-zinc-400 font-bold">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>[ NOMOR TELEPON / WA ]</span>
              </label>
              <div className="relative flex items-center bg-black border border-zinc-800 rounded-lg focus-within:border-emerald-500/80 focus-within:ring-1 focus-within:ring-emerald-500/40 transition-all">
                <span className="pl-3 text-emerald-500 text-xs select-none">&gt;</span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="081234567890"
                  autoComplete="tel"
                  className="w-full bg-transparent px-2.5 py-2 text-xs text-zinc-100 focus:outline-none font-mono placeholder:text-zinc-700"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label htmlFor="password" className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-zinc-400 font-bold">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>[ PASSWORD ]</span>
              </label>
              <div className="relative flex items-center bg-black border border-zinc-800 rounded-lg focus-within:border-emerald-500/80 focus-within:ring-1 focus-within:ring-emerald-500/40 transition-all">
                <span className="pl-3 text-emerald-500 text-xs select-none">&gt;</span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  autoComplete="new-password"
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
              id="register-submit"
              type="submit"
              disabled={isPending}
              className="w-full mt-4 py-2.5 px-4 bg-zinc-100 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg"
            >
              {isPending ? (
                <span>[ REGISTERING DEVELOPER... ]</span>
              ) : (
                <>
                  <span>[ CREATE DEVELOPER ACCOUNT ]</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link to Login */}
          <div className="border-t border-zinc-800/80 pt-3 text-center">
            <Link
              href="/login"
              className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
            >
              <span>Sudah memiliki akun?</span>
              <span className="font-bold underline text-zinc-300 hover:text-emerald-400">cd ../login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
