import { verifyLicenseToken } from '@/lib/jwt';
import { jsonWithCors, handleOptions } from '@/lib/cors';
import { NextRequest } from 'next/server';

export async function OPTIONS() {
  return handleOptions();
}

/**
 * GET /api/license/verify?token=<jwt>
 *
 * Client sites can verify their stored JWT locally, but also call this
 * endpoint to cross-check against the server (e.g., on startup).
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return jsonWithCors({ valid: false, error: 'token is required' }, { status: 400 });
  }

  const payload = await verifyLicenseToken(token);

  if (!payload) {
    return jsonWithCors({ valid: false, error: 'Invalid or expired token' }, { status: 401 });
  }

  const isActive = payload.status === 'ACTIVE';

  return jsonWithCors({
    valid: isActive,
    status: payload.status,
    projectId: payload.projectId,
    domain: payload.domain,
  });
}
