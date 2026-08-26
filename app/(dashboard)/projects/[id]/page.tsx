import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
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
  ShieldCheck,
} from 'lucide-react';

export const metadata: Metadata = { title: 'Project Detail — License Guard' };

function formatDate(date: Date | null | undefined) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date)).replace(',', '');
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
    { label: 'Target Domain', value: project.domain, icon: Globe, mono: true, link: `https://${project.domain}` },
    { label: 'Server IP Filter', value: project.serverIp ?? 'Not set (Any)', icon: Server, mono: true },
    { label: 'Grace Period', value: `${project.gracePeriod} hours`, icon: Clock, mono: false },
    { label: 'Last Heartbeat', value: formatDate(project.lastHeartbeat), icon: Activity, mono: false },
    { label: 'Created At', value: formatDate(project.createdAt), icon: Calendar, mono: false },
    { label: 'Project ID', value: project.id, icon: Key, mono: true },
  ];

  return (
    <div className="font-mono space-y-6">
      {/* ── Top Navigation & Header ── */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>cd ../projects</span>
        </Link>

        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-500 text-sm">$</span>
              <h1 className="text-lg font-bold text-zinc-100 tracking-wide">
                {project.name}
              </h1>
              <span className="text-xs text-zinc-500">[{project.domain}]</span>
            </div>
            <p className="text-xs text-zinc-600 mt-1 pl-5">
              // Project ID: <span className="text-zinc-400">{project.id}</span>
            </p>
          </div>

          <ProjectControls project={{ id: project.id, status: project.status, name: project.name }} />
        </div>
      </div>

      {/* ── Grid: Info + API Key + Activity Stream ── */}
      <div className="grid grid-cols-5 gap-5">
        {/* Left 2 Cols: Metadata & API Key */}
        <div className="col-span-2 space-y-5">
          {/* Metadata Card */}
          <div className="border border-zinc-800 rounded bg-zinc-950">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-bold text-zinc-300 tracking-wide uppercase">
                [01] CONFIGURATION
              </span>
            </div>
            <div className="divide-y divide-zinc-800/60">
              {infoRows.map(({ label, value, icon: Icon, mono, link }) => (
                <div key={label} className="p-3 px-4 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-zinc-600" />
                    <span>{label}</span>
                  </span>
                  {link ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-emerald-400 hover:underline truncate max-w-[200px]"
                    >
                      {value}
                    </a>
                  ) : (
                    <span className={`text-zinc-200 ${mono ? 'font-mono' : 'font-semibold'} truncate max-w-[200px]`}>
                      {value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* API Key Card */}
          <div className="border border-zinc-800 rounded bg-zinc-950">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/60">
              <div className="flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold text-zinc-300 tracking-wide uppercase">
                  [02] SECRET API KEY
                </span>
              </div>
              <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                CONFIDENTIAL
              </span>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-xs text-zinc-500">
                Gunakan API key ini untuk mengautentikasi website klien Anda:
              </p>
              <div className="font-mono text-xs text-emerald-400 bg-black p-3 rounded border border-zinc-800 select-all break-all leading-relaxed">
                {project.apiKey}
              </div>
            </div>
          </div>
        </div>

        {/* Right 3 Cols: Activity Stream */}
        <div className="col-span-3 border border-zinc-800 rounded bg-zinc-950 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/60">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs font-bold text-zinc-300 tracking-wide uppercase">
                [03] INSTANCE AUDIT STREAM
              </span>
            </div>
            <span className="text-xs text-zinc-600">
              {project.logs.length} events
            </span>
          </div>
          <div className="flex-1">
            <LogTable logs={project.logs} />
          </div>
        </div>
      </div>

      {/* ── Integration Code Snippet ── */}
      <div>
        <IntegrationSnippet apiKey={project.apiKey} domain={project.domain} />
      </div>
    </div>
  );
}
