'use client';

import Link from 'next/link';
import { useTransition, useState } from 'react';
import { Eye, PauseCircle, PlayCircle, Copy, Check, Globe } from 'lucide-react';
import { updateProjectStatus } from '@/lib/actions';
import StatusBadge from '@/components/status-badge';
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
  userId?: string | null;
  user?: {
    id?: string;
    username?: string;
    email?: string;
  } | null;
};

function formatDate(date: Date | null) {
  if (!date) return 'Belum terhubung';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export default function ProjectTable({
  projects,
  showOwner = true,
}: {
  projects: ProjectWithStatus[];
  showOwner?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copyKey(key: string, id: string) {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    startTransition(async () => {
      await updateProjectStatus(id, newStatus);
    });
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <p className="text-sm font-semibold text-slate-700">Belum ada project terdaftar</p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Jalankan perintah CLI <code className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-800">npx @masdannn/license-guard init</code> di terminal atau klik tombol di atas.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
          <tr>
            <th className="px-5 py-3.5">Nama Project</th>
            <th className="px-5 py-3.5">Domain</th>
            {showOwner && <th className="px-5 py-3.5">Pemilik Akun</th>}
            <th className="px-5 py-3.5">Status Lisensi</th>
            <th className="px-5 py-3.5">Heartbeat Terakhir</th>
            <th className="px-5 py-3.5">API Key</th>
            <th className="px-5 py-3.5 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {projects.map((project) => (
            <tr key={project.id} className="hover:bg-slate-50/70 transition-colors">
              {/* Project Name */}
              <td className="px-5 py-4 whitespace-nowrap">
                <Link
                  href={`/projects/${project.id}`}
                  className="font-semibold text-slate-900 hover:text-sky-600 transition-colors block"
                >
                  {project.name}
                </Link>
                <span className="text-[11px] text-slate-400 font-mono">
                  ID: {project.id.slice(0, 8)}...
                </span>
              </td>

              {/* Domain */}
              <td className="px-5 py-4 whitespace-nowrap">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>{project.domain}</span>
                </div>
              </td>

              {/* Owner */}
              {showOwner && (
                <td className="px-5 py-4 whitespace-nowrap">
                  {project.user ? (
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-800">
                        {project.user.email}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        @{project.user.username}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
              )}

              {/* Status */}
              <td className="px-5 py-4 whitespace-nowrap">
                <StatusBadge status={project.status} />
              </td>

              {/* Last Heartbeat */}
              <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
                {formatDate(project.lastHeartbeat)}
              </td>

              {/* API Key */}
              <td className="px-5 py-4 whitespace-nowrap">
                <div className="inline-flex items-center gap-1.5">
                  <span className="text-xs font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    {project.apiKey.slice(0, 10)}••••
                  </span>
                  <button
                    onClick={() => copyKey(project.apiKey, project.id)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Salin API Key"
                  >
                    {copiedId === project.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </td>

              {/* Actions */}
              <td className="px-5 py-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-2">
                  {project.status === 'ACTIVE' ? (
                    <button
                      disabled={isPending}
                      onClick={() => toggleStatus(project.id, project.status)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                      title="Kunci / Tangguhkan lisensi"
                    >
                      <PauseCircle className="w-3.5 h-3.5" />
                      <span>Suspend</span>
                    </button>
                  ) : (
                    <button
                      disabled={isPending}
                      onClick={() => toggleStatus(project.id, project.status)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                      title="Buka / Aktifkan lisensi"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Aktifkan</span>
                    </button>
                  )}

                  <Button asChild variant="outline" size="sm" className="h-7 px-2.5 text-xs">
                    <Link href={`/projects/${project.id}`}>
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      <span>Detail</span>
                    </Link>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
