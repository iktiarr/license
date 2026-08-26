'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProjectStatus, deleteProject } from '@/lib/actions';
import { PauseCircle, PlayCircle, Trash2, Power } from 'lucide-react';

type ProjectStatus = 'ACTIVE' | 'SUSPENDED' | 'TAMPERED';

type Props = {
  project: { id: string; status: ProjectStatus; name: string };
};

export default function ProjectControls({ project }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isActive = project.status === 'ACTIVE';

  function handleToggle(checked: boolean) {
    const newStatus: ProjectStatus = checked ? 'ACTIVE' : 'SUSPENDED';
    startTransition(async () => {
      await updateProjectStatus(project.id, newStatus);
    });
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3500);
      return;
    }
    startTransition(async () => {
      await deleteProject(project.id);
      router.push('/projects');
    });
  }

  return (
    <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 p-2 rounded font-mono">
      {/* Status indicator button */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-black border border-zinc-800/80 rounded text-xs">
        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'bg-rose-500'}`} />
        <span className={`font-bold ${isActive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isActive ? 'ACTIVE' : 'SUSPENDED'}
        </span>
      </div>

      {/* Toggle Killswitch Button */}
      {isActive ? (
        <button
          id="project-suspend-btn"
          disabled={isPending}
          onClick={() => handleToggle(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-400 border border-rose-500/30 bg-rose-500/10 rounded hover:bg-rose-500/20 hover:border-rose-500/50 transition-all disabled:opacity-40 cursor-pointer"
        >
          <PauseCircle className="w-4 h-4" />
          <span>{isPending ? 'LOCKING...' : '[ SUSPEND ]'}</span>
        </button>
      ) : (
        <button
          id="project-activate-btn"
          disabled={isPending}
          onClick={() => handleToggle(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 rounded hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all disabled:opacity-40 cursor-pointer"
        >
          <PlayCircle className="w-4 h-4" />
          <span>{isPending ? 'ACTIVATING...' : '[ ACTIVATE ]'}</span>
        </button>
      )}

      {/* Delete Button */}
      <button
        id="project-delete-btn"
        disabled={isPending}
        onClick={handleDelete}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded border transition-all disabled:opacity-40 cursor-pointer ${
          confirmDelete
            ? 'border-rose-500 bg-rose-600 text-white animate-pulse'
            : 'border-zinc-800 text-zinc-500 hover:text-rose-400 hover:border-rose-500/30 bg-zinc-900/50'
        }`}
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>{confirmDelete ? '[ CONFIRM DELETE? ]' : '[ DELETE ]'}</span>
      </button>
    </div>
  );
}
