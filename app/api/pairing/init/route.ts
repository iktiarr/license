import { db } from '@/lib/db';
import { jsonWithCors, handleOptions } from '@/lib/cors';
import { NextRequest } from 'next/server';
import { normalizeDomain } from '@/lib/domain';
import { PlanTier } from '@/lib/plans';

export async function OPTIONS() {
  return handleOptions();
}

/**
 * POST /api/pairing/init
 * Dipanggil oleh CLI saat `npx @masdannn/license-guard init` / `new` / `fix`
 * Body: { name: string, domain: string, email: string, apiKey: string, framework: string }
 *
 * Logika Seamless Re-registration & Account Ownership:
 * - Memvalidasi kepemilikan akun developer berdasarkan email yang dimasukkan di CLI.
 * - Jika akun belum ada di database, tolak dengan instruksi registrasi akun.
 * - Jika akun ada, hubungkan project ke akun tersebut (userId) dan periksa kuota paket jika bukan Admin.
 * - Jika domain sudah ada sebelumnya: perbarui apiKey & nama serta transfer kepemilikan bila perlu,
 *   namun tetap PERTAHANKAN status lisensi saat ini (ACTIVE / SUSPENDED).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, domain, email, apiKey, framework } = body as {
      name?: string;
      domain?: string;
      email?: string;
      apiKey?: string;
      framework?: string;
    };

    if (!name || !domain || !apiKey || !email) {
      return jsonWithCors(
        { error: 'Nama project, domain, email akun, dan apiKey wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanDomain = normalizeDomain(domain.trim());
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return jsonWithCors(
        { error: 'Format email tidak valid. Pastikan memasukkan alamat email yang benar.' },
        { status: 400 }
      );
    }

    // 1. Cari akun developer berdasarkan email
    const user = await db.user.findFirst({
      where: { email: cleanEmail },
    });

    if (!user) {
      return jsonWithCors(
        {
          error: `Akun dengan email "${cleanEmail}" belum terdaftar di License Guard Hub. Silakan registrasi terlebih dahulu di website/dashboard dengan email ini sebelum menginisialisasi lisensi.`,
        },
        { status: 404 }
      );
    }

    // 2. Cek apakah project dengan domain ini sudah ada sebelumnya
    const existingProject = await db.project.findUnique({
      where: { domain: cleanDomain },
    });

    // 3. Cek kuota lisensi jika user bukan ROOT/ADMIN
    const isUserAdmin = user.role === 'ADMIN';
    if (!isUserAdmin) {
      const { getPlanConfigById } = await import('@/lib/plans');
      const planConfig = await getPlanConfigById((user.plan as PlanTier) || 'FREE');
      const userProjectsCount = await db.project.count({
        where: {
          userId: user.id,
          ...(existingProject ? { id: { not: existingProject.id } } : {}),
        },
      });

      if (userProjectsCount >= planConfig.maxProjects) {
        return jsonWithCors(
          {
            error: `Batas domain tercapai (${userProjectsCount}/${planConfig.maxProjects}). Paket ${planConfig.name} hanya mengizinkan maksimal ${planConfig.maxProjects} domain. Silakan upgrade paket Anda di dashboard.`,
          },
          { status: 403 }
        );
      }
    }

    let project;
    let isReRegistration = false;
    const frameworkType = framework === 'NATIVE' ? 'NATIVE' : 'FRAMEWORK';

    if (existingProject) {
      // Domain sudah ada: Update apiKey, nama, dan userId, TETAPI PERTAHANKAN STATUS SEBELUMNYA
      isReRegistration = true;
      project = await db.project.update({
        where: { id: existingProject.id },
        data: {
          name: cleanName,
          apiKey,
          userId: user.id,
          frameworkType,
          updatedAt: new Date(),
        },
      });
    } else {
      // Domain baru: Buat project baru dengan status ACTIVE dan tautkan ke user
      project = await db.project.create({
        data: {
          name: cleanName,
          domain: cleanDomain,
          apiKey,
          gracePeriod: 24,
          status: 'ACTIVE',
          frameworkType,
          userId: user.id,
        },
      });
    }

    // Catat activity log
    await db.activityLog.create({
      data: {
        projectId: project.id,
        event: 'REGISTER',
        metadata: {
          name: project.name,
          domain: project.domain,
          ownerEmail: user.email,
          ownerUsername: user.username,
          userId: user.id,
          action: isReRegistration ? 'RE_REGISTERED_CREDENTIALS_UPDATED' : 'NEW_PROJECT_REGISTERED',
          registeredVia: 'NPM_CLI_AUTO',
          framework: framework ?? 'unknown',
          preservedStatus: project.status,
        },
      },
    });

    return jsonWithCors({
      success: true,
      projectId: project.id,
      name: project.name,
      domain: project.domain,
      email: user.email,
      owner: user.username,
      status: project.status, // status yang dipertahankan (ACTIVE atau SUSPENDED)
      isUpdate: isReRegistration,
    });
  } catch (err: unknown) {
    console.error('[pairing/init]', err);
    return jsonWithCors(
      { error: err instanceof Error ? err.message : 'Gagal memproses pendaftaran project.' },
      { status: 500 }
    );
  }
}
