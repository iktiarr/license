import { db } from '@/lib/db';
import { signLicenseToken } from '@/lib/jwt';
import { jsonWithCors, handleOptions } from '@/lib/cors';
import { NextRequest } from 'next/server';

export async function OPTIONS() {
  return handleOptions();
}

/**
 * POST /api/license/heartbeat
 * Body: { apiKey: string, domain: string, serverIp?: string }
 *
 * Client sites call this periodically (e.g. every hour) to renew their JWT.
 * IP changes are flagged but not auto-blocked.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, domain, serverIp } = body as {
      apiKey?: string;
      domain?: string;
      serverIp?: string;
    };

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

    const ip =
      request.headers.get('x-forwarded-for') ??
      request.headers.get('x-real-ip') ??
      null;

    const normalizedDomain = domain.trim().toLowerCase();

    // Domain tamper check
    if (project.domain !== normalizedDomain) {
      await db.activityLog.create({
        data: {
          projectId: project.id,
          event: 'TAMPER_ATTEMPT',
          ipAddress: ip,
          metadata: {
            reason: 'domain_mismatch',
            provided: normalizedDomain,
            expected: project.domain,
          },
        },
      });

      // Auto-flag as tampered
      await db.project.update({
        where: { id: project.id },
        data: { status: 'TAMPERED' },
      });

      return jsonWithCors({ error: 'Domain mismatch — tamper detected', status: 'TAMPERED' }, { status: 403 });
    }

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

    // Update heartbeat timestamp and optionally server IP
    const updateData: { lastHeartbeat: Date; serverIp?: string } = {
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
        metadata: { domain: normalizedDomain, serverIp: serverIp ?? null },
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
    return jsonWithCors({ error: 'Internal server error' }, { status: 500 });
  }
}
