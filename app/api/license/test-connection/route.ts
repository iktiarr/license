import { db } from '@/lib/db';
import { jsonWithCors, handleOptions } from '@/lib/cors';
import { NextRequest } from 'next/server';
import { isDomainMatch, normalizeDomain } from '@/lib/domain';

export async function OPTIONS() {
  return handleOptions();
}

/**
 * POST /api/license/test-connection
 * Body: { domain: string, apiKey?: string, projectId?: string }
 * Menguji apakah klien sudah aktif dan merespons heartbeat
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, apiKey, projectId } = body as {
      domain?: string;
      apiKey?: string;
      projectId?: string;
    };

    if (!domain && !apiKey && !projectId) {
      return jsonWithCors(
        { error: 'Domain, ApiKey, atau ProjectId diperlukan' },
        { status: 400 }
      );
    }

    let project = null;
    if (projectId) {
      project = await db.project.findUnique({ where: { id: projectId } });
    } else if (apiKey) {
      project = await db.project.findUnique({ where: { apiKey } });
    } else if (domain) {
      const clean = normalizeDomain(domain);
      project = await db.project.findUnique({ where: { domain: clean } });
      if (!project) {
        // Coba cari dengan domain match
        const all = await db.project.findMany();
        project = all.find((p: { domain: string }) => isDomainMatch(p.domain, clean)) ?? null;
      }
    }

    if (!project) {
      return jsonWithCors({
        connected: false,
        status: 'DISCONNECTED',
        message: 'Project belum terdaftar di sistem Central License Guard.',
      });
    }

    const lastSeen = project.lastHeartbeat;
    const isRecentlyActive =
      lastSeen && Date.now() - new Date(lastSeen).getTime() < 30 * 60 * 1000;

    return jsonWithCors({
      connected: true,
      status: project.status === 'ACTIVE' ? 'CONNECTED' : project.status,
      project: {
        id: project.id,
        name: project.name,
        domain: project.domain,
        status: project.status,
        lastHeartbeat: project.lastHeartbeat,
      },
      isLive: Boolean(isRecentlyActive),
      message: isRecentlyActive
        ? 'Website klien terhubung dan aktif menerima heartbeat!'
        : 'Project terdaftar di database. Menunggu heartbeat pertama dari website klien...',
    });
  } catch (err) {
    console.error('[license/test-connection]', err);
    return jsonWithCors({ error: 'Gagal menguji koneksi', connected: false }, { status: 500 });
  }
}
