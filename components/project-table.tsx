'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { ExternalLink, Eye, PauseCircle, PlayCircle, Clock, Globe } from 'lucide-react';
import StatusBadge from './status-badge';
import { updateProjectStatus } from '@/lib/actions';
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

function HeartbeatCell({ date }: { date: Date | null }) {
  if (!date) return <span className="text-slate-400 text-xs">Never</span>;
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const hours = diff / (1000 * 60 * 60);
  const isStale = hours > 2;

  return (
    <span className={`text-xs flex items-center gap-1.5 ${isStale ? 'text-amber-600' : 'text-slate-500'}`}>
      <Clock className={`w-3.5 h-3.5 ${isStale ? 'text-amber-500' : 'text-emerald-500'}`} />
      {formatDate(date)}
    </span>
  );
}

function ActionButtons({ project }: { project: ProjectWithStatus }) {
  const [isPending, startTransition] = useTransition();

  function toggleStatus() {
    const newStatus = project.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    startTransition(async () => {
      await updateProjectStatus(project.id, newStatus);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Link href={`/projects/${project.id}`} className="btn-ghost py-1.5">
        <Eye className="w-3.5 h-3.5" />
        <span>View</span>
      </Link>
      {project.status === 'ACTIVE' ? (
        <button
          onClick={toggleStatus}
          disabled={isPending}
          className="btn-danger"
        >
          <PauseCircle className="w-3.5 h-3.5" />
          <span>{isPending ? 'Updating...' : 'Suspend'}</span>
        </button>
      ) : (
        <button
          onClick={toggleStatus}
          disabled={isPending}
          className="btn-success"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span>{isPending ? 'Updating...' : 'Activate'}</span>
        </button>
      )}
    </div>
  );
}

export default function ProjectTable({ projects }: { projects: ProjectWithStatus[] }) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">No projects yet</p>
        <p className="text-slate-400 text-sm mt-1">Add your first project to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Domain</th>
            <th>Status</th>
            <th>Last Heartbeat</th>
            <th>Server IP</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project, i) => (
            <tr
              key={project.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <td>
                <div>
                  <p className="font-medium text-slate-800">{project.name}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {project.id.slice(0, 12)}...
                  </p>
                </div>
              </td>
              <td>
                <a
                  href={`https://${project.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                  {project.domain}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </td>
              <td>
                <StatusBadge status={project.status} />
              </td>
              <td>
                <HeartbeatCell date={project.lastHeartbeat} />
              </td>
              <td>
                <span className="text-xs text-slate-500 font-mono">
                  {project.serverIp ?? '—'}
                </span>
              </td>
              <td>
                <ActionButtons project={project} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
