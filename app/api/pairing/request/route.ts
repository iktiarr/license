import { db } from '@/lib/db';
import { jsonWithCors, handleOptions } from '@/lib/cors';
import crypto from 'crypto';

export async function OPTIONS() {
  return handleOptions();
}

function generatePairingCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let part1 = '';
  let part2 = '';
  for (let i = 0; i < 4; i++) {
    part1 += chars.charAt(crypto.randomInt(0, chars.length));
    part2 += chars.charAt(crypto.randomInt(0, chars.length));
  }
  return `LG-${part1}-${part2}`;
}

/**
 * POST /api/pairing/request
 * Dipanggil oleh CLI (npx @iktiarr/license-guard init) untuk meminta kode pairing handshake
 */
export async function POST() {
  try {
    let code = generatePairingCode();

    let attempts = 0;
    while (attempts < 5) {
      const existing = await db.pairingSession.findUnique({ where: { code } });
      if (!existing) break;
      code = generatePairingCode();
      attempts++;
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const session = await db.pairingSession.create({
      data: {
        code,
        status: 'PENDING',
        expiresAt,
      },
    });

    return jsonWithCors({
      success: true,
      code: session.code,
      expiresAt: session.expiresAt.toISOString(),
    });
  } catch (err) {
    console.error('[pairing/request]', err);
    return jsonWithCors(
      { error: 'Gagal membuat sesi pairing', success: false },
      { status: 500 }
    );
  }
}
