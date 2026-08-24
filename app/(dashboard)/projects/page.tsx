import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Plus, FolderKanban } from 'lucide-react';
import ProjectTable from '@/components/project-table';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-zinc-400" />
            <span>Projects Management</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage client websites, active licenses, and operational status
          </p>
        </div>
        <Button asChild variant="default" size="sm">
          <Link href="/projects/new" id="projects-new-btn">
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </Link>
        </Button>
      </div>

      {/* Projects Table Card */}
      <Card className="border-zinc-800 bg-zinc-900/60 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-semibold">Registered Domains</CardTitle>
            <CardDescription className="text-xs">
              List of all client instances currently governed by Centralized License Guard
            </CardDescription>
          </div>
          <span className="text-xs font-mono text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded-md border border-zinc-800">
            {projects.length} Total Sites
          </span>
        </CardHeader>
        <ProjectTable projects={projects} />
      </Card>
    </div>
  );
}
