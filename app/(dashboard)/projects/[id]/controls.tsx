'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProjectStatus, deleteProject } from '@/lib/actions';
import { PauseCircle, PlayCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

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
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    startTransition(async () => {
      await deleteProject(project.id);
      router.push('/projects');
    });
  }

  return (
    <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl shadow-sm">
      {/* Interactive Killswitch Switch */}
      <div className="flex items-center gap-2.5 px-2">
        <Switch
          id="project-killswitch-toggle"
          checked={isActive}
          disabled={isPending}
          onCheckedChange={handleToggle}
        />
        <div className="text-left">
          <p className="text-xs font-semibold text-zinc-100">
            {isActive ? 'Live (Active)' : 'Locked (Suspended)'}
          </p>
          <p className="text-[10px] text-zinc-500">Killswitch Control</p>
        </div>
      </div>

      <div className="h-6 w-px bg-zinc-800" />

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {isActive ? (
          <Button
            id="project-suspend-btn"
            size="sm"
            variant="destructive"
            disabled={isPending}
            onClick={() => handleToggle(false)}
            className="h-8 text-xs font-medium"
          >
            <PauseCircle className="w-3.5 h-3.5" />
            <span>{isPending ? 'Updating...' : 'Suspend'}</span>
          </Button>
        ) : (
          <Button
            id="project-activate-btn"
            size="sm"
            variant="success"
            disabled={isPending}
            onClick={() => handleToggle(true)}
            className="h-8 text-xs font-medium"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>{isPending ? 'Updating...' : 'Activate'}</span>
          </Button>
        )}

        <Button
          id="project-delete-btn"
          size="sm"
          variant={confirmDelete ? 'destructive' : 'outline'}
          disabled={isPending}
          onClick={handleDelete}
          className="h-8 text-xs text-zinc-400 hover:text-white"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{confirmDelete ? 'Confirm Delete?' : 'Delete'}</span>
        </Button>
      </div>
    </div>
  );
}
