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
} from 'lucide-react';

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
        setError(result.error ?? 'Unknown error');
      } else {
        setSuccess(true);
        setTimeout(() => router.push(`/projects/${result.project.id}`), 800);
      }
    });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="animate-fade-in-up">
        <Link href="/projects" className="btn-ghost mb-4 inline-flex">
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Add New Project</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Register a client site to manage its license
        </p>
      </div>

      {/* Form Card */}
      <div className="card animate-fade-in-up delay-100">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-slate-700">Project Details</h2>
        </div>
        <div className="card-body">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <p className="text-emerald-700 text-sm">Project created! Redirecting...</p>
            </div>
          )}

          <form id="new-project-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="form-label">
                <Tag className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="My Client Website"
                className="form-input"
              />
            </div>

            {/* Domain */}
            <div>
              <label htmlFor="domain" className="form-label">
                <Globe className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />
                Domain <span className="text-red-500">*</span>
              </label>
              <input
                id="domain"
                name="domain"
                type="text"
                required
                placeholder="example.com"
                className="form-input"
              />
              <p className="text-xs text-slate-400 mt-1">
                Without https:// — e.g. <code className="bg-slate-100 px-1 rounded">client.example.com</code>
              </p>
            </div>

            {/* Server IP */}
            <div>
              <label htmlFor="serverIp" className="form-label">
                <Server className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />
                Server IP{' '}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                id="serverIp"
                name="serverIp"
                type="text"
                placeholder="192.168.1.1"
                className="form-input"
              />
              <p className="text-xs text-slate-400 mt-1">
                Used to detect IP tampering on heartbeat requests
              </p>
            </div>

            {/* Grace Period */}
            <div>
              <label htmlFor="gracePeriod" className="form-label">
                <Clock className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />
                Grace Period (hours)
              </label>
              <input
                id="gracePeriod"
                name="gracePeriod"
                type="number"
                min={1}
                max={720}
                defaultValue={24}
                className="form-input"
              />
              <p className="text-xs text-slate-400 mt-1">
                How long the JWT remains valid without a heartbeat (default: 24h)
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                id="new-project-submit"
                disabled={isPending || success}
                className="btn-primary"
              >
                {isPending ? 'Creating...' : 'Create Project'}
              </button>
              <Link href="/projects" className="btn-ghost">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 animate-fade-in-up delay-200">
        <p className="text-sm font-semibold text-indigo-800 mb-2">
          After creating the project:
        </p>
        <ol className="text-xs text-indigo-700 space-y-1 list-decimal list-inside">
          <li>An API key is auto-generated for the client site</li>
          <li>Client calls <code className="bg-indigo-100 px-1 rounded">/api/license/register</code> with the API key</li>
          <li>A signed RSA JWT token is returned for license verification</li>
          <li>Client heartbeats every N hours to renew the token</li>
        </ol>
      </div>
    </div>
  );
}
