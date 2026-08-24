import { db } from '@/lib/db';
import { signLicenseToken } from '@/lib/jwt';
import { jsonWithCors, handleOptions } from '@/lib/cors';
import { NextRequest } from 'next/server';

export async function OPTIONS() {
  return handleOptions();
}

/**
 * POST /api/license/register
 * Body: { apiKey: string, domain: string }
 *
 * Client sites call this to register themselves and receive a signed JWT.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, domain } = body as { apiKey?: string; domain?: string };

    if (!apiKey || !domain) {
      return jsonWithCors(
        { error: 'apiKey and domain are required' },
        { status: 400 }
      );
    }

    const project = await db.project.findUnique({ where: { apiKey } });

    if (!project) {
      return jsonWithCors({ error: 'Invalid API key' }, { status: 401 });
    }

    // Validate domain matches
    const normalizedDomain = domain.trim().toLowerCase();
    if (project.domain !== normalizedDomain) {
      // Log tamper attempt
      await db.activityLog.create({
        data: {
          projectId: project.id,
          event: 'TAMPER_ATTEMPT',
          ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown',
          metadata: { reason: 'domain_mismatch', provided: normalizedDomain, expected: project.domain },
        },
      });
      return jsonWithCors({ error: 'Domain mismatch' }, { status: 403 });
    }

    if (project.status === 'SUSPENDED') {
      return jsonWithCors(
        { error: 'License suspended', status: 'SUSPENDED' },
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
        metadata: { domain: normalizedDomain },
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
    return jsonWithCors({ error: 'Internal server error' }, { status: 500 });
  }
}
