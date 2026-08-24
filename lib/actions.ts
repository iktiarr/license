'use server';

import { db } from '@/lib/db';
import { signLicenseToken } from '@/lib/jwt';
import { revalidatePath } from 'next/cache';
type ProjectStatus = 'ACTIVE' | 'SUSPENDED' | 'TAMPERED';

// ── Create Project ──────────────────────────────────────────────────────────

export async function createProject(formData: FormData) {
  const name = formData.get('name') as string;
  const domain = formData.get('domain') as string;
  const serverIp = formData.get('serverIp') as string;
  const gracePeriodRaw = formData.get('gracePeriod') as string;
  const gracePeriod = gracePeriodRaw ? parseInt(gracePeriodRaw, 10) : 24;

  if (!name || !domain) {
    return { error: 'Name and Domain are required.' };
  }

  try {
    const project = await db.project.create({
      data: {
        name: name.trim(),
        domain: domain.trim().toLowerCase(),
        serverIp: serverIp?.trim() || null,
        gracePeriod,
      },
    });

    await db.activityLog.create({
      data: {
        projectId: project.id,
        event: 'REGISTER',
        metadata: { name: project.name, domain: project.domain },
      },
    });

    revalidatePath('/projects');
    revalidatePath('/');
    return { success: true, project };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg.includes('Unique constraint')) {
      return { error: 'A project with this domain already exists.' };
    }
    return { error: 'Failed to create project.' };
  }
}

// ── Update Project Status ───────────────────────────────────────────────────

export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus
) {
  const eventMap: Record<string, string> = {
    ACTIVE: 'ACTIVATED',
    SUSPENDED: 'SUSPENDED',
    TAMPERED: 'TAMPER_ATTEMPT',
  };

  const project = await db.project.update({
    where: { id: projectId },
    data: { status },
  });

  await db.activityLog.create({
    data: {
      projectId,
      event: eventMap[status],
      metadata: { changedBy: 'admin', newStatus: status },
    },
  });

  revalidatePath('/projects');
  revalidatePath(`/projects/${projectId}`);
  revalidatePath('/');
  return { success: true, project };
}

// ── Delete Project ──────────────────────────────────────────────────────────

export async function deleteProject(projectId: string) {
  await db.project.delete({ where: { id: projectId } });
  revalidatePath('/projects');
  revalidatePath('/');
  return { success: true };
}

// ── Refresh License Token ───────────────────────────────────────────────────

export async function refreshLicenseToken(projectId: string) {
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) return { error: 'Project not found' };

  const token = await signLicenseToken({
    projectId: project.id,
    domain: project.domain,
    status: project.status,
  });

  return { token };
}

// ── Update Project Info ─────────────────────────────────────────────────────

export async function updateProject(projectId: string, formData: FormData) {
  const name = formData.get('name') as string;
  const serverIp = formData.get('serverIp') as string;
  const gracePeriodRaw = formData.get('gracePeriod') as string;
  const gracePeriod = gracePeriodRaw ? parseInt(gracePeriodRaw, 10) : 24;

  await db.project.update({
    where: { id: projectId },
    data: {
      name: name?.trim(),
      serverIp: serverIp?.trim() || null,
      gracePeriod,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath('/projects');
  return { success: true };
}
