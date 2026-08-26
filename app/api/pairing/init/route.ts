import { db } from '@/lib/db';
import { jsonWithCors, handleOptions } from '@/lib/cors';
import { NextRequest } from 'next/server';
import { normalizeDomain } from '@/lib/domain';

export async function OPTIONS() {
  return handleOptions();
}

/**
 * POST /api/pairing/init
 * Dipanggil oleh CLI saat `npx @masdannn/license-guard init` / `new` / `fix`
 * Body: { name: string, domain: string, apiKey: string, framework: string }
 *
 * Logika Seamless Re-registration:
 * - Jika domain belum terdaftar: Buat project baru (status: ACTIVE)
 * - Jika domain SUDAH terdaftar: Update apiKey & nama, tapi PERTAHANKAN status saat ini
 *   (misal jika statusnya SUSPENDED, tetap SUSPENDED agar killswitch tidak bocor).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, domain, apiKey, framework } = body as {
      name?: string;
      domain?: string;
      apiKey?: string;
      framework?: string;
    };

    if (!name || !domain || !apiKey) {
      return jsonWithCors(
        { error: 'name, domain, dan apiKey wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanDomain = normalizeDomain(domain.trim());
    const cleanName = name.trim();

    // Cek apakah project dengan domain ini sudah ada sebelumnya
    const existingProject = await db.project.findUnique({
      where: { domain: cleanDomain },
    });

    let project;
    let isReRegistration = false;

    if (existingProject) {
      // Domain sudah ada: Update apiKey dan nama, TETAPI PERTAHANKAN STATUS SEBELUMNYA
      isReRegistration = true;
      project = await db.project.update({
        where: { id: existingProject.id },
        data: {
          name: cleanName,
          apiKey, // perbarui dengan apiKey baru
          updatedAt: new Date(),
        },
      });
    } else {
      // Domain baru: Buat project baru dengan status ACTIVE
      project = await db.project.create({
        data: {
          name: cleanName,
          domain: cleanDomain,
          apiKey,
          gracePeriod: 24,
          status: 'ACTIVE',
        },
      });
    }

    // Catat activity log
    await db.activityLog.create({
      data: {
        projectId: project.id,
        event: isReRegistration ? 'REGISTER' : 'REGISTER',
        metadata: {
          name: project.name,
          domain: project.domain,
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
