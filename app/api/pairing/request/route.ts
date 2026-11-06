import { db } from '@/lib/db';
import { jsonWithCors, handleOptions } from '@/lib/cors';
import { checkRateLimit } from '@/lib/rate-limit';
import { NextRequest } from 'next/server';
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
export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const rateCheck = checkRateLimit(`pairing-req:${clientIp}`, { limit: 20, windowMs: 60 * 1000 });
    if (!rateCheck.success) {
      return jsonWithCors(
        { error: 'Terlalu banyak permintaan pairing. Silakan tunggu sebentar.', success: false },
        { status: 429 }
      );
    }
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
