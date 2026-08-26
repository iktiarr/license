'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { Eye, PauseCircle, PlayCircle } from 'lucide-react';
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

const statusCfg = {
  ACTIVE:    { dot: 'bg-emerald-500', text: 'text-emerald-400', label: 'ACTIVE' },
  SUSPENDED: { dot: 'bg-rose-500',    text: 'text-rose-400',    label: 'SUSPEND' },
  TAMPERED:  { dot: 'bg-amber-500',   text: 'text-amber-400',   label: 'TAMPER' },
};

function formatDate(date: Date | null) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date)).replace(',', '');
}

export default function ProjectTable({ projects }: { projects: ProjectWithStatus[] }) {
  const [isPending, startTransition] = useTransition();

  function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    startTransition(async () => {
      await updateProjectStatus(id, newStatus);
    });
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-16 font-mono">
        <p className="text-[11px] text-zinc-600">// no projects registered yet</p>
        <p className="text-[10px] text-zinc-700 mt-1">
          run <span className="text-emerald-500">npx @masdannn/license-guard init</span> or add via dashboard
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left font-mono">
        <thead className="border-b border-zinc-800/60 text-[9px] text-zinc-600 uppercase tracking-widest">
          <tr>
            <th className="px-4 py-3">Project</th>
            <th className="px-4 py-3">Domain</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Last Seen</th>
            <th className="px-4 py-3">API Key</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/40">
          {projects.map((project) => {
            const cfg = statusCfg[project.status];
            return (
              <tr key={project.id} className="hover:bg-zinc-900/40 transition-colors group">
                {/* Project Name */}
                <td className="px-4 py-3.5">
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors"
                  >
                    {project.name}
                  </Link>
                  <p className="text-[9px] text-zinc-700 mt-0.5">{project.id.slice(0, 12)}...</p>
                </td>

                {/* Domain */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className="text-[11px] text-zinc-400 bg-black px-2 py-0.5 rounded border border-zinc-800">
                    {project.domain}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${project.status === 'ACTIVE' ? 'shadow-[0_0_4px_rgba(16,185,129,0.8)]' : ''}`} />
                    <span className={`text-[10px] font-bold ${cfg.text}`}>{cfg.label}</span>
                  </div>
                </td>

                {/* Last Heartbeat */}
                <td className="px-4 py-3.5 whitespace-nowrap text-[10px] text-zinc-600">
                  {formatDate(project.lastHeartbeat)}
                </td>

                {/* API Key */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className="text-[9px] text-zinc-700 font-mono">
                    {project.apiKey.slice(0, 16)}...
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    {project.status === 'ACTIVE' ? (
                      <button
                        disabled={isPending}
                        onClick={() => toggleStatus(project.id, project.status)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-rose-400 border border-rose-500/30 bg-rose-500/5 rounded hover:bg-rose-500/10 hover:border-rose-500/50 transition-all disabled:opacity-40 cursor-pointer"
                      >
                        <PauseCircle className="w-3 h-3" />
                        suspend
                      </button>
                    ) : (
                      <button
                        disabled={isPending}
                        onClick={() => toggleStatus(project.id, project.status)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30 bg-emerald-500/5 rounded hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all disabled:opacity-40 cursor-pointer"
                      >
                        <PlayCircle className="w-3 h-3" />
                        activate
                      </button>
                    )}
                    <Link
                      href={`/projects/${project.id}`}
                      className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-zinc-400 border border-zinc-800 rounded hover:border-zinc-600 hover:text-zinc-200 transition-all"
                    >
                      <Eye className="w-3 h-3" />
                      view
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
