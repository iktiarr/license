'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTransition, useState, useMemo } from 'react';
import {
  Eye,
  PauseCircle,
  PlayCircle,
  Copy,
  Check,
  Globe,
  MoreHorizontal,
  Search,
  ExternalLink,
  Trash2,
  Layers,
} from 'lucide-react';
import { updateProjectStatus, deleteProject } from '@/lib/actions';
import StatusBadge from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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

function formatRelativeTime(date: Date | null) {
  if (!date) return 'Belum terhubung';
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 2) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} mnt lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(date));
}

export default function ProjectTable({
  projects,
  showOwner = true,
}: {
  projects: ProjectWithStatus[];
  showOwner?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [projectToDelete, setProjectToDelete] = useState<ProjectWithStatus | null>(null);

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

  function handleDeleteConfirm() {
    if (!projectToDelete) return;
    const id = projectToDelete.id;
    setProjectToDelete(null);
    startTransition(async () => {
      await deleteProject(id);
    });
  }

  // Filter & Search logic
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'ACTIVE'
          ? p.status === 'ACTIVE'
          : p.status === 'SUSPENDED';

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.domain.toLowerCase().includes(q) ||
        p.apiKey.toLowerCase().includes(q) ||
        (p.user?.email && p.user.email.toLowerCase().includes(q)) ||
        (p.user?.username && p.user.username.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [projects, searchQuery, statusFilter]);

  if (projects.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mx-auto mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-slate-800">Belum Ada Project Terdaftar</p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
          Hubungkan website klien pertama Anda menggunakan tombol &ldquo;Tambah Project&rdquo; di atas atau melalui CLI terminal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Search & Filter Controls Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Cari project, domain, email, atau API key..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs bg-slate-50/50 border-slate-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <Button
            size="sm"
            variant={statusFilter === 'ALL' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('ALL')}
            className={`h-8 text-xs font-semibold px-3 ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Semua ({projects.length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('ACTIVE')}
            className={`h-8 text-xs font-semibold px-3 ${
              statusFilter === 'ACTIVE'
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Aktif ({projects.filter((p) => p.status === 'ACTIVE').length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'SUSPENDED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('SUSPENDED')}
            className={`h-8 text-xs font-semibold px-3 ${
              statusFilter === 'SUSPENDED'
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Suspend ({projects.filter((p) => p.status === 'SUSPENDED').length})
          </Button>
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Nama Project</th>
                <th className="px-5 py-3.5">Domain Target</th>
                {showOwner && <th className="px-5 py-3.5">Pemilik Akun</th>}
                <th className="px-5 py-3.5">Status Lisensi</th>
                <th className="px-5 py-3.5">Heartbeat</th>
                <th className="px-5 py-3.5">Secret API Key</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={showOwner ? 7 : 6} className="text-center py-12 text-slate-500">
                    <p className="text-xs font-medium">Tidak ada project yang cocok dengan pencarian &ldquo;{searchQuery}&rdquo;</p>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => {
                  const isRecentlyActive =
                    project.lastHeartbeat &&
                    new Date().getTime() - new Date(project.lastHeartbeat).getTime() < 300000;

                  return (
                    <tr key={project.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* 1. Project Name */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <Link
                            href={`/projects/${project.id}`}
                            className="font-bold text-slate-900 hover:text-sky-600 transition-colors block text-sm"
                          >
                            {project.name}
                          </Link>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {project.id.slice(0, 10)}...
                          </span>
                        </div>
                      </td>

                      {/* 2. Domain Target */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <a
                          href={`https://${project.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors group"
                        >
                          <Globe className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600" />
                          <span className="group-hover:text-sky-700">{project.domain}</span>
                          <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-sky-500" />
                        </a>
                      </td>

                      {/* 3. Owner (if shown) */}
                      {showOwner && (
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {project.user ? (
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-slate-800">
                                {project.user.email}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                @{project.user.username}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                      )}

                      {/* 4. Status Badge */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <StatusBadge status={project.status} />
                      </td>

                      {/* 5. Last Heartbeat */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          {isRecentlyActive ? (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live online" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-300" />
                          )}
                          <span className="text-[11px] font-medium">
                            {formatRelativeTime(project.lastHeartbeat)}
                          </span>
                        </div>
                      </td>

                      {/* 6. Secret API Key */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="text-[11px] font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
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

                      {/* 7. Action Dropdown Button (3 Dots) */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer">
                            <MoreHorizontal className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 text-xs">
                            <DropdownMenuLabel className="text-[10px] text-slate-400 font-bold uppercase">
                              Aksi Project
                            </DropdownMenuLabel>

                            <DropdownMenuItem
                              onClick={() => router.push(`/projects/${project.id}`)}
                              className="flex items-center gap-2 cursor-pointer font-medium"
                            >
                              <Eye className="w-3.5 h-3.5 text-sky-600" />
                              <span>Buka Detail Project</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => copyKey(project.apiKey, project.id)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-600" />
                              <span>Salin Secret API Key</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => window.open(`https://${project.domain}`, '_blank')}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Globe className="w-3.5 h-3.5 text-slate-600" />
                              <span>Kunjungi Domain</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {project.status === 'ACTIVE' ? (
                              <DropdownMenuItem
                                disabled={isPending}
                                onClick={() => toggleStatus(project.id, project.status)}
                                className="flex items-center gap-2 text-rose-600 hover:text-rose-700 cursor-pointer"
                              >
                                <PauseCircle className="w-3.5 h-3.5" />
                                <span>Kunci / Suspend Lisensi</span>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                disabled={isPending}
                                onClick={() => toggleStatus(project.id, project.status)}
                                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 cursor-pointer"
                              >
                                <PlayCircle className="w-3.5 h-3.5" />
                                <span>Buka / Aktifkan Lisensi</span>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => setProjectToDelete(project)}
                              className="flex items-center gap-2 text-rose-600 hover:text-rose-700 cursor-pointer font-medium"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus Project</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Konfirmasi Hapus Project ── */}
      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Hapus Project &ldquo;{projectToDelete?.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 leading-relaxed">
              Tindakan ini permanen. Semua kunci lisensi, log aktivitas, dan sesi pairing untuk domain{' '}
              <strong className="text-slate-800 font-mono">{projectToDelete?.domain}</strong> akan dihapus dan website klien tidak akan dapat melakukan verifikasi lagi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs h-9">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="text-xs h-9 bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              Ya, Hapus Permanen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
