'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Shield, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, User, Mail, Phone, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
      setError('Semua kolom formulir wajib diisi.');
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

        setSuccess('Pendaftaran berhasil! Mengalihkan ke dashboard...');

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
          }, 1200);
        }
      } catch {
        setError('Gagal terhubung ke server registrasi.');
      }
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200 bg-white">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <CardTitle className="text-xl font-bold text-slate-900">Registrasi Akun Developer</CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Buat akun developer gratis untuk mulai mengamankan lisensi website klien Anda
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-xs font-semibold text-slate-700 block">
                Username
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="developer_name"
                  autoComplete="username"
                  className="pl-9 h-10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-700 block">
                Alamat Email
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="dev@example.com"
                  autoComplete="email"
                  className="pl-9 h-10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-xs font-semibold text-slate-700 block">
                Nomor WhatsApp / HP
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400">
                  <Phone className="w-4 h-4" />
                </span>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="081234567890"
                  autoComplete="tel"
                  className="pl-9 h-10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-slate-700 block">
                Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimal 6 karakter"
                  autoComplete="new-password"
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
              id="register-submit"
              type="submit"
              disabled={isPending}
              className="w-full h-10 mt-3 font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
            >
              {isPending ? (
                <span>Mendaftarkan akun...</span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Daftar Akun Developer</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-slate-100 py-4 bg-slate-50/50 rounded-b-xl">
          <p className="text-xs text-slate-500">
            Sudah memiliki akun?{' '}
            <Link href="/login" className="font-semibold text-slate-900 hover:underline">
              Masuk di sini
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
