'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createProject } from '@/lib/actions';
import {
  ArrowLeft,
  Globe,
  Server,
  Tag,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function NewProjectPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createProject(formData);
      if ('error' in result) {
        setError(result.error ?? 'Terjadi kesalahan saat membuat project.');
      } else {
        setSuccess(true);
        setTimeout(() => router.push(`/projects/${result.project.id}`), 600);
      }
    });
  }

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in-up">
      {/* Header */}
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 text-zinc-400 hover:text-white">
          <Link href="/projects">
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Back to Projects</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-white">Add New Project</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Register a client site domain to manage its remote killswitch license
        </p>
      </div>

      {/* Form Card */}
      <Card className="border-zinc-800 bg-zinc-900/80 shadow-xl">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Project Information</CardTitle>
          <CardDescription className="text-xs">
            Enter the client domain and grace period configuration
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="success">
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>Project created successfully! Redirecting...</AlertDescription>
            </Alert>
          )}

          <form id="new-project-form" onSubmit={handleSubmit} className="space-y-5">
            <Field>
              <FieldLabel htmlFor="name" required>
                <Tag className="w-3.5 h-3.5 mr-1 text-zinc-500" />
                Project Name
              </FieldLabel>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="e.g. SaaSify Client Instance"
                className="bg-zinc-950 border-zinc-800"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="domain" required>
                <Globe className="w-3.5 h-3.5 mr-1 text-zinc-500" />
                Target Domain
              </FieldLabel>
              <Input
                id="domain"
                name="domain"
                type="text"
                required
                placeholder="e.g. client.example.com or localhost"
                className="bg-zinc-950 border-zinc-800 font-mono text-xs"
              />
              <FieldDescription>
                Domain tanpa http/https. Untuk pengujian lokal gunakan <code className="bg-zinc-950 px-1 py-0.5 rounded border border-zinc-800">localhost</code>.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="serverIp">
                <Server className="w-3.5 h-3.5 mr-1 text-zinc-500" />
                Server IP <span className="text-zinc-500 font-normal font-sans">(Optional)</span>
              </FieldLabel>
              <Input
                id="serverIp"
                name="serverIp"
                type="text"
                placeholder="e.g. 192.168.1.1"
                className="bg-zinc-950 border-zinc-800 font-mono text-xs"
              />
              <FieldDescription>
                Digunakan untuk mendeteksi perubahan IP server backend klien.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="gracePeriod">
                <Clock className="w-3.5 h-3.5 mr-1 text-zinc-500" />
                Grace Period (Hours)
              </FieldLabel>
              <Input
                id="gracePeriod"
                name="gracePeriod"
                type="number"
                min={1}
                max={720}
                defaultValue={24}
                className="bg-zinc-950 border-zinc-800 font-mono text-xs"
              />
              <FieldDescription>
                Batas waktu token JWT tetap berlaku jika server pusat offline sementara (default: 24 jam).
              </FieldDescription>
            </Field>

            <div className="flex items-center gap-3 pt-3 border-t border-zinc-800/80">
              <Button
                type="submit"
                id="new-project-submit"
                disabled={isPending || success}
                variant="default"
              >
                <Plus className="w-4 h-4" />
                <span>{isPending ? 'Creating...' : 'Create Project'}</span>
              </Button>
              <Button asChild variant="outline">
                <Link href="/projects">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
