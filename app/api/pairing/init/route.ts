import { db } from '@/lib/db';
import { jsonWithCors, handleOptions } from '@/lib/cors';
import { NextRequest } from 'next/server';
import { normalizeDomain } from '@/lib/domain';

export async function OPTIONS() {
  return handleOptions();
}

/**
 * POST /api/pairing/init
 * Dipanggil oleh CLI saat `npx @masdannn/license-guard init`
 * Body: { name: string, domain: string, apiKey: string, framework: string }
 * Langsung buat Project baru dengan status ACTIVE
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

    // Cek apakah apiKey sudah terdaftar
    const existing = await db.project.findUnique({ where: { apiKey } });
    if (existing) {
      return jsonWithCors(
        { error: 'API Key ini sudah terdaftar sebelumnya.' },
        { status: 400 }
      );
    }

    // Buat project langsung dengan ACTIVE dan gunakan apiKey dari klien
    const project = await db.project.create({
      data: {
        name: cleanName,
        domain: cleanDomain,
        apiKey,           // pakai apiKey yang digenerate klien
        gracePeriod: 24,
        status: 'ACTIVE',
      },
    });

    // Catat activity log
    await db.activityLog.create({
      data: {
        projectId: project.id,
        event: 'REGISTER',
        metadata: {
          name: project.name,
          domain: project.domain,
          registeredVia: 'NPM_CLI_AUTO',
          framework: framework ?? 'unknown',
        },
      },
    });

    return jsonWithCors({
      success: true,
      projectId: project.id,
      name: project.name,
      domain: project.domain,
      status: project.status,
    });
  } catch (err: unknown) {
    console.error('[pairing/init]', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg.includes('Unique constraint')) {
      return jsonWithCors(
        { error: 'Project dengan domain ini sudah terdaftar.' },
        { status: 400 }
      );
    }
    return jsonWithCors({ error: 'Gagal mendaftarkan project.' }, { status: 500 });
  }
}
