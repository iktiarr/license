import { db } from '@/lib/db';
import { signLicenseToken } from '@/lib/jwt';
import { jsonWithCors, handleOptions } from '@/lib/cors';
import { isDomainMatch, normalizeDomain } from '@/lib/domain';
import { NextRequest } from 'next/server';

export async function OPTIONS() {
  return handleOptions();
}

/**
 * POST /api/license/heartbeat
 * Body: { apiKey: string, domain: string, serverIp?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, domain, serverIp } = body as {
      apiKey?: string;
      domain?: string;
      serverIp?: string;
    };

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

    const ip =
      request.headers.get('x-forwarded-for') ??
      request.headers.get('x-real-ip') ??
      null;

    const requestDomain = domain || 'localhost';

    // Domain tamper check using smart matcher
    if (!isDomainMatch(project.domain, requestDomain)) {
      await db.activityLog.create({
        data: {
          projectId: project.id,
          event: 'TAMPER_ATTEMPT',
          ipAddress: ip,
          metadata: {
            reason: 'domain_mismatch',
            provided: requestDomain,
            expected: project.domain,
          },
        },
      });

      return jsonWithCors(
        {
          error: 'Domain mismatch — tamper detected',
          valid: false,
          status: 'TAMPERED',
        },
        { status: 403 }
      );
    }

    // Check if project is suspended by Admin
    if (project.status === 'SUSPENDED') {
      await db.activityLog.create({
        data: {
          projectId: project.id,
          event: 'HEARTBEAT',
          ipAddress: ip,
          metadata: { blocked: true, status: 'SUSPENDED' },
        },
      });
      return jsonWithCors({ valid: false, status: 'SUSPENDED' }, { status: 403 });
    }

    // Update heartbeat timestamp and server IP
    const updateData: { lastHeartbeat: Date; serverIp?: string; status?: 'ACTIVE' } = {
      lastHeartbeat: new Date(),
    };
    if (serverIp) updateData.serverIp = serverIp;

    await db.project.update({
      where: { id: project.id },
      data: updateData,
    });

    await db.activityLog.create({
      data: {
        projectId: project.id,
        event: 'HEARTBEAT',
        ipAddress: ip,
        metadata: { domain: normalizeDomain(requestDomain), serverIp: serverIp ?? null },
      },
    });

    const token = await signLicenseToken(
      {
        projectId: project.id,
        domain: project.domain,
        status: project.status,
      },
      project.gracePeriod + 1
    );

    return jsonWithCors({
      valid: true,
      status: project.status,
      token,
    });
  } catch (err) {
    console.error('[license/heartbeat]', err);
    return jsonWithCors({ error: 'Internal server error', valid: false }, { status: 500 });
  }
}
