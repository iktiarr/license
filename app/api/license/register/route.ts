import { db } from '@/lib/db';
import { signLicenseToken } from '@/lib/jwt';
import { jsonWithCors, handleOptions } from '@/lib/cors';
import { isDomainMatch, normalizeDomain } from '@/lib/domain';
import { NextRequest } from 'next/server';

export async function OPTIONS() {
  return handleOptions();
}

/**
 * POST /api/license/register
 * Body: { apiKey: string, domain: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, domain } = body as { apiKey?: string; domain?: string };

    if (!apiKey) {
      return jsonWithCors(
        { error: 'apiKey is required', valid: false },
        { status: 400 }
      );
    }

    const project = await db.project.findUnique({ where: { apiKey } });

    if (!project) {
      return jsonWithCors({ error: 'Invalid API key', valid: false }, { status: 401 });
    }

    const requestDomain = domain || 'localhost';

    // Validate domain matches
    if (!isDomainMatch(project.domain, requestDomain)) {
      await db.activityLog.create({
        data: {
          projectId: project.id,
          event: 'TAMPER_ATTEMPT',
          ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown',
          metadata: { reason: 'domain_mismatch', provided: requestDomain, expected: project.domain },
        },
      });
      return jsonWithCors({ error: 'Domain mismatch', valid: false, status: 'TAMPERED' }, { status: 403 });
    }

    if (project.status === 'SUSPENDED') {
      return jsonWithCors(
        { error: 'License suspended', valid: false, status: 'SUSPENDED' },
        { status: 403 }
      );
    }

    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? null;

    // Log register
    await db.activityLog.create({
      data: {
        projectId: project.id,
        event: 'REGISTER',
        ipAddress: ip,
        metadata: { domain: normalizeDomain(requestDomain) },
      },
    });

    const token = await signLicenseToken({
      projectId: project.id,
      domain: project.domain,
      status: project.status,
    }, project.gracePeriod + 1);

    return jsonWithCors({
      valid: true,
      status: project.status,
      token,
      gracePeriod: project.gracePeriod,
    });
  } catch (err) {
    console.error('[license/register]', err);
    return jsonWithCors({ error: 'Internal server error', valid: false }, { status: 500 });
  }
}
