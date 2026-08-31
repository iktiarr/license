'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProjectStatus, deleteProject } from '@/lib/actions';
import { PauseCircle, PlayCircle, Trash2, Globe, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

type ProjectStatus = 'ACTIVE' | 'SUSPENDED' | 'TAMPERED';

type Props = {
  project: { id: string; status: ProjectStatus; name: string; domain?: string };
};

export default function ProjectControls({ project }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isActive = project.status === 'ACTIVE';

  function handleToggle(checked: boolean) {
    const newStatus: ProjectStatus = checked ? 'ACTIVE' : 'SUSPENDED';
    startTransition(async () => {
      await updateProjectStatus(project.id, newStatus);
    });
  }

  function handleDelete() {
    setShowDeleteModal(false);
    startTransition(async () => {
      await deleteProject(project.id);
      router.push('/projects');
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {project.domain && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 text-xs font-semibold text-slate-700 hover:text-slate-900 border-slate-200"
          >
            <a href={`https://${project.domain}`} target="_blank" rel="noopener noreferrer">
              <Globe className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <span>Buka Domain</span>
              <ExternalLink className="w-3 h-3 ml-1 text-slate-400" />
            </a>
          </Button>
        )}

        {/* Toggle Killswitch Button */}
        {isActive ? (
          <Button
            id="project-suspend-btn"
            type="button"
            disabled={isPending}
            onClick={() => handleToggle(false)}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs font-semibold text-xs h-9 cursor-pointer"
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
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-2xs font-semibold text-xs h-9 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4 mr-1.5" />
            <span>{isPending ? 'Memproses...' : 'Buka / Aktifkan'}</span>
          </Button>
        )}

        {/* Delete Button */}
        <Button
          id="project-delete-btn"
          type="button"
          disabled={isPending}
          onClick={() => setShowDeleteModal(true)}
          variant="outline"
          className="text-xs h-9 font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border-slate-200 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          <span>Hapus</span>
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Hapus Project &ldquo;{project.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 leading-relaxed">
              Tindakan ini permanen. Seluruh kunci lisensi, log aktivitas, dan sesi pairing untuk project ini akan dihapus dari server pusat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs h-9">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="text-xs h-9 bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              Ya, Hapus Permanen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
