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
  ShieldCheck,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Project Details — License Guard' };

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
    { label: 'Target Domain', value: project.domain, icon: Globe, mono: true, link: `https://${project.domain}` },
    { label: 'Server IP Filter', value: project.serverIp ?? 'Not set (Any)', icon: Server, mono: true },
    { label: 'Grace Period', value: `${project.gracePeriod} hours`, icon: Clock, mono: false },
    { label: 'Last Heartbeat', value: formatDate(project.lastHeartbeat), icon: Activity, mono: false },
    { label: 'Created At', value: formatDate(project.createdAt), icon: Calendar, mono: false },
    { label: 'Project ID', value: project.id, icon: Key, mono: true },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Header */}
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-3 text-zinc-400 hover:text-white">
          <Link href="/projects">
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Back to Projects</span>
          </Link>
        </Button>

        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
              <Globe className="w-3.5 h-3.5" />
              <span className="font-mono text-zinc-300">{project.domain}</span>
            </div>
          </div>

          <ProjectControls project={{ id: project.id, status: project.status, name: project.name }} />
        </div>
      </div>

      {/* Grid: Info + API Key + Activity */}
      <div className="grid grid-cols-5 gap-6">
        {/* Left 2 Cols: Project Info & API Key */}
        <div className="col-span-2 space-y-6">
          {/* Metadata Card */}
          <Card className="border-zinc-800 bg-zinc-900/60 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-zinc-400" />
                <CardTitle className="text-sm">Instance Configuration</CardTitle>
              </div>
            </CardHeader>
            <div className="divide-y divide-zinc-800/60">
              {infoRows.map(({ label, value, icon: Icon, mono, link }) => (
                <div key={label} className="p-3.5 px-4 flex items-center justify-between text-xs">
                  <span className="text-zinc-400 flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{label}</span>
                  </span>
                  {link ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-zinc-200 hover:text-white underline truncate max-w-[200px]"
                    >
                      {value}
                    </a>
                  ) : (
                    <span className={`text-zinc-200 ${mono ? 'font-mono' : 'font-medium'} truncate max-w-[200px]`}>
                      {value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* API Key Card */}
          <Card className="border-zinc-800 bg-zinc-900/60 shadow-lg">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-zinc-400" />
                <CardTitle className="text-sm">Secret API Key</CardTitle>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                Confidential
              </span>
            </CardHeader>
            <CardContent className="space-y-2 pt-2">
              <p className="text-xs text-zinc-400">
                Gunakan API key ini untuk mengautentikasi website klien Anda:
              </p>
              <div className="font-mono text-xs text-zinc-100 bg-zinc-950 p-3 rounded-lg border border-zinc-800 select-all break-all shadow-inner">
                {project.apiKey}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 3 Cols: Activity Stream */}
        <div className="col-span-3">
          <Card className="border-zinc-800 bg-zinc-900/60 shadow-lg h-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-zinc-400" />
                <CardTitle className="text-sm">Instance Activity Logs</CardTitle>
              </div>
              <span className="text-[11px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                Last {project.logs.length} Events
              </span>
            </CardHeader>
            <LogTable logs={project.logs} />
          </Card>
        </div>
      </div>

      {/* Multi-Language & Native HTML Code Integration Snippet */}
      <div className="pt-2">
        <IntegrationSnippet apiKey={project.apiKey} domain={project.domain} />
      </div>
    </div>
  );
}
