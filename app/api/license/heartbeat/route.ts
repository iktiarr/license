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
 * Body: { apiKey: string, domain: string, serverIp?: string, tamperReason?: string }
 *
 * Catatan: Heartbeat rutin HANYA memperbarui lastHeartbeat di data Project
 * dan TIDAK dicatat ke ActivityLog agar database tidak penuh.
 * Namun jika terdeteksi modifikasi / tamper attempt, log dicatat ke ActivityLog.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, domain, serverIp, tamperReason } = body as {
      apiKey?: string;
      domain?: string;
      serverIp?: string;
      tamperReason?: string;
    };

    const ip =
      request.headers.get('x-forwarded-for') ??
      request.headers.get('x-real-ip') ??
      null;

    const requestDomain = domain || 'localhost';
    const cleanRequestDomain = normalizeDomain(requestDomain);

    // 1. Handle Tamper Telemetry from SDK
    if (tamperReason || apiKey === 'TAMPER_REPORT') {
      const project = await db.project.findFirst({
        where: {
          OR: [
            { domain: cleanRequestDomain },
            apiKey && apiKey !== 'TAMPER_REPORT' ? { apiKey } : {},
          ],
        },
      });

      if (project) {
        await db.activityLog.create({
          data: {
            projectId: project.id,
            event: 'TAMPER_ATTEMPT',
            ipAddress: ip,
            metadata: {
              reason: tamperReason || 'Client license configuration missing or tampered',
              domain: requestDomain,
            },
          },
        });
      }

      return jsonWithCors(
        {
          error: 'Tamper attempt recorded: ' + (tamperReason || 'Configuration tampered'),
          valid: false,
          status: 'TAMPERED',
        },
        { status: 403 }
      );
    }

    if (!apiKey) {
      return jsonWithCors(
        { error: 'apiKey is required', valid: false },
        { status: 400 }
      );
    }

    const project = await db.project.findUnique({
      where: { apiKey },
      include: {
        template: {
          select: { id: true, name: true, htmlContent: true },
        },
      },
    });

    if (!project) {
      return jsonWithCors({ error: 'Invalid API key', valid: false }, { status: 401 });
    }

    // Domain tamper check using smart matcher
    if (!isDomainMatch(project.domain, requestDomain)) {
      // Catat log HANYA jika terjadi percobaan pembajakan / domain tidak sah
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
          customHtml: project.template?.htmlContent || null,
        },
        { status: 403 }
      );
    }

    // Check if project is suspended by Admin (tanpa insert log rutin)
    if (project.status === 'SUSPENDED') {
      return jsonWithCors({
        valid: false,
        status: 'SUSPENDED',
        customHtml: project.template?.htmlContent || null,
      }, { status: 403 });
    }

    // Update heartbeat timestamp & server IP pada data Project
    const updateData: { lastHeartbeat: Date; serverIp?: string; status?: 'ACTIVE' } = {
      lastHeartbeat: new Date(),
    };
    if (serverIp) updateData.serverIp = serverIp;

    await db.project.update({
      where: { id: project.id },
      data: updateData,
    });

    // Generate fresh token
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
      gracePeriod: project.gracePeriod,
    });
  } catch (err) {
    console.error('[license/heartbeat]', err);
    return jsonWithCors({ error: 'Internal server error', valid: false }, { status: 500 });
  }
}
