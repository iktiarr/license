import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Plus, FolderKanban } from 'lucide-react';
import ProjectTable from '@/components/project-table';

export const metadata: Metadata = { title: 'Projects' };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-slate-600" />
            Projects
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {projects.length} registered site{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/projects/new" className="btn-primary" id="projects-new-btn">
          <Plus className="w-4 h-4" />
          Add Project
        </Link>
      </div>

      {/* Table Card */}
      <div className="card animate-fade-in-up delay-100">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-slate-700">All Projects</h2>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {projects.length} total
          </span>
        </div>
        <ProjectTable projects={projects} />
      </div>
    </div>
  );
}
