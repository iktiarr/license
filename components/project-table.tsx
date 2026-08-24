'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { Eye, PauseCircle, PlayCircle, Globe, Key } from 'lucide-react';
import StatusBadge from './status-badge';
import { updateProjectStatus } from '@/lib/actions';
import { Button } from '@/components/ui/button';

export type ProjectWithStatus = {
  id: string;
  name: string;
  domain: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TAMPERED';
  lastHeartbeat: Date | null;
  serverIp: string | null;
  createdAt: Date;
  apiKey: string;
};

function formatDate(date: Date | null) {
  if (!date) return 'Never';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

export default function ProjectTable({
  projects,
}: {
  projects: ProjectWithStatus[];
}) {
  const [isPending, startTransition] = useTransition();

  function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    startTransition(async () => {
      await updateProjectStatus(id, newStatus);
    });
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <Globe className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
        <p className="text-sm font-medium text-zinc-300">No projects created yet</p>
        <p className="text-xs text-zinc-500 mt-1">
          Click the "Add Project" button to register your first client website.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-zinc-300">
        <thead className="bg-zinc-950/60 border-b border-zinc-800/80 text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
          <tr>
            <th className="px-5 py-3.5">Project Name</th>
            <th className="px-5 py-3.5">Domain</th>
            <th className="px-5 py-3.5">Status</th>
            <th className="px-5 py-3.5">Last Seen</th>
            <th className="px-5 py-3.5 text-right">Killswitch Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {projects.map((project) => (
            <tr key={project.id} className="hover:bg-zinc-800/30 transition-colors">
              <td className="px-5 py-4">
                <Link
                  href={`/projects/${project.id}`}
                  className="font-semibold text-sm text-zinc-100 hover:text-white transition-colors block"
                >
                  {project.name}
                </Link>
                <span className="text-[10px] text-zinc-400 font-mono mt-0.5 inline-flex items-center gap-1">
                  <Key className="w-2.5 h-2.5" />
                  {project.id.slice(0, 10)}...
                </span>
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                <span className="font-mono text-xs text-zinc-300 bg-zinc-950 px-2.5 py-1 rounded-md border border-zinc-800/80">
                  {project.domain}
                </span>
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                <StatusBadge status={project.status} />
              </td>
              <td className="px-5 py-4 whitespace-nowrap text-zinc-400 font-mono text-[11px]">
                {formatDate(project.lastHeartbeat)}
              </td>
              <td className="px-5 py-4 text-right whitespace-nowrap space-x-2">
                {project.status === 'ACTIVE' ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isPending}
                    onClick={() => toggleStatus(project.id, project.status)}
                    className="h-7 text-xs px-2.5"
                  >
                    <PauseCircle className="w-3.5 h-3.5" />
                    <span>Suspend</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="success"
                    disabled={isPending}
                    onClick={() => toggleStatus(project.id, project.status)}
                    className="h-7 text-xs px-2.5"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Activate</span>
                  </Button>
                )}

                <Button asChild size="sm" variant="outline" className="h-7 text-xs px-2.5">
                  <Link href={`/projects/${project.id}`}>
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
