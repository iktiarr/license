import { db } from '@/lib/db';
import { jsonWithCors, handleOptions } from '@/lib/cors';
import { NextRequest } from 'next/server';

export async function OPTIONS() {
  return handleOptions();
}

/**
 * GET /api/pairing/status?code=LG-XXXX-XXXX
 * Dipanggil secara polling oleh CLI klien untuk menunggu konfirmasi dari Dashboard Admin
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code')?.trim().toUpperCase();

    if (!code) {
      return jsonWithCors({ error: 'Parameter code diperlukan' }, { status: 400 });
    }

    const session = await db.pairingSession.findUnique({
      where: { code },
    });

    if (!session) {
      return jsonWithCors({ error: 'Kode pairing tidak ditemukan', status: 'NOT_FOUND' }, { status: 404 });
    }

    // Cek expired
    if (new Date() > session.expiresAt && session.status === 'PENDING') {
      await db.pairingSession.update({
        where: { id: session.id },
        data: { status: 'EXPIRED' },
      });
      return jsonWithCors({ status: 'EXPIRED' });
    }

    if (session.status === 'CLAIMED') {
      return jsonWithCors({
        status: 'CLAIMED',
        apiKey: session.apiKey,
        projectId: session.projectId,
        domain: session.domain,
      });
    }

    return jsonWithCors({
      status: session.status,
      expiresAt: session.expiresAt.toISOString(),
    });
  } catch (err) {
    console.error('[pairing/status]', err);
    return jsonWithCors({ error: 'Internal server error' }, { status: 500 });
  }
}
