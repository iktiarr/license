'use server';

import { db } from '@/lib/db';
import { signLicenseToken } from '@/lib/jwt';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { checkPlanAllowance, PlanTier } from '@/lib/plans';

type ProjectStatus = 'ACTIVE' | 'SUSPENDED' | 'TAMPERED';

// ── Create Project ──────────────────────────────────────────────────────────

export async function createProject(formData: FormData) {
  const session = await auth();
  const name = formData.get('name') as string;
  const domain = formData.get('domain') as string;
  const serverIp = formData.get('serverIp') as string;
  const gracePeriodRaw = formData.get('gracePeriod') as string;
  const gracePeriod = gracePeriodRaw ? parseInt(gracePeriodRaw, 10) : 24;
  const frameworkType = (formData.get('frameworkType') as string) || 'NATIVE';

  if (!name || !domain) {
    return { error: 'Nama project dan domain wajib diisi.' };
  }

  const userId = session?.user?.id;
  const role = (session?.user as { role?: string })?.role;
  const isAdmin = role === 'ADMIN';
  const plan = ((session?.user as { plan?: PlanTier })?.plan || (isAdmin ? 'MAX' : 'FREE')) as PlanTier;

  // Check quota if not admin
  if (!isAdmin && userId) {
    const userProjects = await db.project.findMany({
      where: { userId },
      select: { frameworkType: true },
    });

    const totalProjects = userProjects.length;
    const frameworkProjects = userProjects.filter((p) => p.frameworkType === 'FRAMEWORK').length;
    const isNewFramework = frameworkType === 'FRAMEWORK';

    const allowance = checkPlanAllowance(plan, totalProjects, frameworkProjects, isNewFramework);
    if (!allowance.allowed) {
      return { error: allowance.reason || 'Kapasitas paket lisensi Anda telah tercapai.' };
    }
  }

  try {
    const project = await db.project.create({
      data: {
        name: name.trim(),
        domain: domain.trim().toLowerCase(),
        serverIp: serverIp?.trim() || null,
        gracePeriod,
        frameworkType,
        userId: userId || null,
      },
    });

    await db.activityLog.create({
      data: {
        projectId: project.id,
        event: 'REGISTER',
        metadata: { name: project.name, domain: project.domain, frameworkType },
      },
    });

    revalidatePath('/projects');
    revalidatePath('/');
    return { success: true, project };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg.includes('Unique constraint')) {
      return { error: 'Project dengan domain ini sudah terdaftar.' };
    }
    return { error: 'Gagal membuat project.' };
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
