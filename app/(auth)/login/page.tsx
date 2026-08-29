'use client';

import { signIn } from 'next-auth/react';
import { useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Shield, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, Lock, Mail } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function LoginForm() {
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get('registered') === 'true';
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const infoMsg = isRegistered ? 'Akun developer berhasil dibuat. Silakan masuk ke dashboard.' : '';
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    const identifier = (formData.get('identifier') as string || '').trim();
    const password = (formData.get('password') as string || '').trim();

    if (!identifier || !password) {
      setError('Username/Email dan password wajib diisi.');
      return;
    }

    startTransition(async () => {
      const result = await signIn('credentials', {
        email: identifier,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Username/Email atau Password tidak cocok.');
      } else {
        const callbackUrl = searchParams.get('callbackUrl') || '/';
        window.location.href = callbackUrl;
      }
    });
  }

  return (
    <Card className="w-full max-w-md shadow-lg border-slate-200 bg-white">
      <CardHeader className="text-center space-y-2 pb-6">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
          <Shield className="w-6 h-6 text-emerald-400" />
        </div>
        <CardTitle className="text-xl font-bold text-slate-900">Masuk ke License Guard</CardTitle>
        <CardDescription className="text-xs text-slate-500">
          Kelola lisensi, domain target, dan remote killswitch aplikasi Anda
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info or Error Alerts */}
        {infoMsg && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="identifier" className="text-xs font-semibold text-slate-700 block">
              Username atau Alamat Email
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <Input
                id="identifier"
                name="identifier"
                type="text"
                required
                placeholder="nama_user atau dev@example.com"
                autoComplete="username"
                className="pl-9 h-10 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-semibold text-slate-700 block">
                Password
              </label>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                autoComplete="current-password"
                className="pl-9 pr-10 h-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            id="login-submit"
            type="submit"
            disabled={isPending}
            className="w-full h-10 mt-2 font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
          >
            {isPending ? (
              <span>Memproses...</span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-slate-100 py-4 bg-slate-50/50 rounded-b-xl">
        <p className="text-xs text-slate-500">
          Belum memiliki akun developer?{' '}
          <Link href="/register" className="font-semibold text-slate-900 hover:underline">
            Daftar di sini
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-slate-500 text-xs">Memuat form login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
