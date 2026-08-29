'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProjectStatus, deleteProject } from '@/lib/actions';
import { PauseCircle, PlayCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="flex flex-wrap items-center gap-2">
      {/* Toggle Killswitch Button */}
      {isActive ? (
        <Button
          id="project-suspend-btn"
          type="button"
          disabled={isPending}
          onClick={() => handleToggle(false)}
          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-none font-semibold text-xs h-9 cursor-pointer"
        >
          <PauseCircle className="w-4 h-4 mr-1.5" />
          <span>{isPending ? 'Memproses...' : 'Kunci / Suspend'}</span>
        </Button>
      ) : (
        <Button
          id="project-activate-btn"
          type="button"
          disabled={isPending}
          onClick={() => handleToggle(true)}
          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-none font-semibold text-xs h-9 cursor-pointer"
        >
          <PlayCircle className="w-4 h-4 mr-1.5" />
          <span>{isPending ? 'Memproses...' : 'Aktifkan Lisensi'}</span>
        </Button>
      )}

      {/* Delete Button */}
      <Button
        id="project-delete-btn"
        type="button"
        disabled={isPending}
        onClick={handleDelete}
        variant="outline"
        className={`text-xs h-9 font-medium transition-colors cursor-pointer ${
          confirmDelete
            ? 'border-rose-300 bg-rose-600 text-white hover:bg-rose-700'
            : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50 border-slate-200'
        }`}
      >
        <Trash2 className="w-3.5 h-3.5 mr-1" />
        <span>{confirmDelete ? 'Yakin Hapus?' : 'Hapus'}</span>
      </Button>
    </div>
  );
}
