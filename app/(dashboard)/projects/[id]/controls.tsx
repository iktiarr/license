'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProjectStatus, deleteProject } from '@/lib/actions';
import { PauseCircle, PlayCircle, Trash2 } from 'lucide-react';
type ProjectStatus = 'ACTIVE' | 'SUSPENDED' | 'TAMPERED';

type Props = {
  project: { id: string; status: ProjectStatus; name: string };
};

export default function ProjectControls({ project }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  function toggleStatus() {
    const newStatus: ProjectStatus = project.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    startTransition(async () => {
      await updateProjectStatus(project.id, newStatus);
    });
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    startTransition(async () => {
      await deleteProject(project.id);
      router.push('/projects');
    });
  }

  return (
    <div className="flex items-center gap-2">
      {project.status === 'ACTIVE' ? (
        <button
          id="project-suspend-btn"
          onClick={toggleStatus}
          disabled={isPending}
          className="btn-danger"
        >
          <PauseCircle className="w-4 h-4" />
          {isPending ? 'Updating...' : 'Suspend License'}
        </button>
      ) : (
        <button
          id="project-activate-btn"
          onClick={toggleStatus}
          disabled={isPending}
          className="btn-success"
        >
          <PlayCircle className="w-4 h-4" />
          {isPending ? 'Updating...' : 'Activate License'}
        </button>
      )}
      <button
        id="project-delete-btn"
        onClick={handleDelete}
        disabled={isPending}
        className={confirmDelete ? 'btn-danger' : 'btn-ghost'}
      >
        <Trash2 className="w-4 h-4" />
        {confirmDelete ? 'Confirm Delete?' : 'Delete'}
      </button>
    </div>
  );
}
