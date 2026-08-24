import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import StatusBadge from '@/components/status-badge';
import LogTable from '@/components/log-table';
import ProjectControls from './controls';
import IntegrationSnippet from '@/components/integration-snippet';
import {
  ArrowLeft,
  Globe,
  Server,
  Clock,
  Calendar,
  Key,
  Activity,
} from 'lucide-react';

export const metadata: Metadata = { title: 'Project Detail' };

function formatDate(date: Date | null | undefined) {
  if (!date) return 'Never';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(date));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await db.project.findUnique({
    where: { id },
    include: {
      logs: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  });

  if (!project) notFound();

  const infoRows = [
    { label: 'Domain', value: project.domain, icon: Globe, mono: false, link: `https://${project.domain}` },
    { label: 'Server IP', value: project.serverIp ?? 'Not set', icon: Server, mono: true },
    { label: 'Grace Period', value: `${project.gracePeriod} hours`, icon: Clock, mono: false },
    { label: 'Last Heartbeat', value: formatDate(project.lastHeartbeat), icon: Activity, mono: false },
    { label: 'Created', value: formatDate(project.createdAt), icon: Calendar, mono: false },
    { label: 'Project ID', value: project.id, icon: Key, mono: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <Link href="/projects" className="btn-ghost mb-4 inline-flex">
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge status={project.status} />
              <a
                href={`https://${project.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Globe className="w-3.5 h-3.5" />
                {project.domain}
              </a>
            </div>
          </div>
          <ProjectControls project={{ id: project.id, status: project.status, name: project.name }} />
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left: Info + API Key */}
        <div className="col-span-2 space-y-5">
          {/* Project Info */}
          <div className="card animate-fade-in-up delay-100">
            <div className="card-header">
              <h2 className="text-sm font-semibold text-slate-700">Project Info</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {infoRows.map(({ label, value, icon: Icon, mono, link }) => (
                <div key={label} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 font-medium">{label}</p>
                    {link ? (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-sm text-indigo-600 hover:underline ${mono ? 'font-mono' : 'font-medium'} truncate block`}
                      >
                        {value}
                      </a>
                    ) : (
                      <p className={`text-sm text-slate-700 ${mono ? 'font-mono' : 'font-medium'} truncate`}>
                        {value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div className="card animate-fade-in-up delay-200">
            <div className="card-header">
              <h2 className="text-sm font-semibold text-slate-700">API Key</h2>
              <span className="text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                Secret
              </span>
            </div>
            <div className="card-body">
              <p className="text-xs text-slate-500 mb-2">
                Share this with the client site for authentication:
              </p>
              <div className="code-block select-all break-all">{project.apiKey}</div>
              <p className="text-xs text-slate-400 mt-2">
                Used in <code className="bg-slate-100 px-1 rounded">POST /api/license/register</code>
              </p>
            </div>
          </div>
        </div>

        {/* Right: Activity Logs */}
        <div className="col-span-3 card animate-fade-in-up delay-200">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-slate-700">Activity Logs</h2>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              Last 50
            </span>
          </div>
          <LogTable logs={project.logs} />
        </div>
      </div>

      {/* Full Width: Multi-Language Integration Snippet */}
      <div className="animate-fade-in-up delay-300">
        <IntegrationSnippet apiKey={project.apiKey} domain={project.domain} />
      </div>
    </div>
  );
}
