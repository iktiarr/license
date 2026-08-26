import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Plus } from 'lucide-react';
import ProjectTable from '@/components/project-table';

export const metadata: Metadata = { title: 'Projects — License Guard' };

export default async function ProjectsPage() {
  const projects = await db.project.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      domain: true,
      status: true,
      lastHeartbeat: true,
      serverIp: true,
      createdAt: true,
      apiKey: true,
    },
  });

  const active = projects.filter(p => p.status === 'ACTIVE').length;
  const suspended = projects.filter(p => p.status === 'SUSPENDED').length;

  return (
    <div className="font-mono space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="text-emerald-500">$</span>
            <span className="text-zinc-300 font-semibold">ls -la ./projects</span>
          </div>
          <p className="text-[10px] text-zinc-600 mt-0.5 pl-4">
            // {projects.length} domain terdaftar &mdash; {active} active, {suspended} suspended
          </p>
        </div>
        <Link
          href="/projects/new"
          id="projects-new-btn"
          className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 text-black text-xs font-bold rounded hover:bg-emerald-400 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>[ new project ]</span>
        </Link>
      </div>

      {/* ── Table ── */}
      <div className="border border-zinc-800 rounded bg-zinc-950">
        {/* Table Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/60">
          <span className="text-[10px] font-semibold text-zinc-400 tracking-wider uppercase">
            registered domains
          </span>
          <span className="text-[10px] text-zinc-600">
            {projects.length} total
          </span>
        </div>

        <ProjectTable projects={projects} />
      </div>
    </div>
  );
}
