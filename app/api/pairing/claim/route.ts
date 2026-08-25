import { db } from '@/lib/db';
import { jsonWithCors, handleOptions } from '@/lib/cors';
import { NextRequest } from 'next/server';
import { normalizeDomain } from '@/lib/domain';

export async function OPTIONS() {
  return handleOptions();
}

/**
 * POST /api/pairing/claim
 * Body: { code: string, name: string, domain: string, gracePeriod?: number }
 * Menghubungkan sesi pairing dengan project baru di dashboard
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, domain, gracePeriod } = body as {
      code?: string;
      name?: string;
      domain?: string;
      gracePeriod?: number;
    };

    if (!code || !name || !domain) {
      return jsonWithCors(
        { error: 'Code, Name, dan Domain wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanDomain = normalizeDomain(domain.trim());

    const session = await db.pairingSession.findUnique({
      where: { code: cleanCode },
    });

    if (!session) {
      return jsonWithCors(
        { error: 'Kode pairing tidak valid atau tidak ditemukan.' },
        { status: 404 }
      );
    }

    if (session.status === 'CLAIMED') {
      return jsonWithCors(
        { error: 'Kode pairing ini sudah pernah digunakan sebelumnya.' },
        { status: 400 }
      );
    }

    if (session.status === 'EXPIRED' || new Date() > session.expiresAt) {
      return jsonWithCors(
        { error: 'Kode pairing telah kedaluwarsa. Silakan jalankan CLI ulang untuk kode baru.' },
        { status: 400 }
      );
    }

    // Buat project baru
    const project = await db.project.create({
      data: {
        name: name.trim(),
        domain: cleanDomain,
        gracePeriod: gracePeriod || 24,
        status: 'ACTIVE',
      },
    });

    // Update session pairing ke CLAIMED
    await db.pairingSession.update({
      where: { id: session.id },
      data: {
        status: 'CLAIMED',
        apiKey: project.apiKey,
        projectId: project.id,
        domain: cleanDomain,
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
          pairedVia: 'NPM_CLI',
          pairingCode: cleanCode,
        },
      },
    });

    return jsonWithCors({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        domain: project.domain,
        apiKey: project.apiKey,
      },
    });
  } catch (err: unknown) {
    console.error('[pairing/claim]', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg.includes('Unique constraint')) {
      return jsonWithCors(
        { error: 'Project dengan domain ini sudah terdaftar di sistem.' },
        { status: 400 }
      );
    }
    return jsonWithCors({ error: 'Gagal menghubungkan sesi pairing.' }, { status: 500 });
  }
}
