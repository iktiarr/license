import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { PlanTier, PLAN_CONFIGS } from '@/lib/plans';

/**
 * GET /api/templates
 * List all lock screen templates belonging to current user
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const userId = session.user.id;
    const isAdmin = (session.user as { role?: string })?.role === 'ADMIN';

    const templates = await db.lockTemplate.findMany({
      where: isAdmin ? undefined : { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        projects: {
          select: { id: true, name: true, domain: true },
        },
      },
    });

    return NextResponse.json({ templates });
  } catch (err: unknown) {
    console.error('[api/templates/GET]', err);
    return NextResponse.json({ error: 'Gagal memuat template.' }, { status: 500 });
  }
}

/**
 * POST /api/templates
 * Create a new lock screen template
 * Body: { name: string, htmlContent: string, isDefault?: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const userId = session.user.id;
    const isAdmin = (session.user as { role?: string })?.role === 'ADMIN';
    const plan = (isAdmin ? 'MAX' : ((session.user as { plan?: PlanTier })?.plan || 'FREE')) as PlanTier;
    const planConfig = PLAN_CONFIGS[plan] || PLAN_CONFIGS.FREE;

    // Check Plan Quota for Lock Templates (PRO: 3, MAX: 10, FREE/PLUS: 0)
    if (!isAdmin && planConfig.maxLockTemplates <= 0) {
      return NextResponse.json(
        {
          error: 'Fitur Kustomisasi Layar Kunci hanya tersedia untuk paket PRO (3 Template) dan MAX (10 Template). Silakan upgrade paket Anda.',
        },
        { status: 403 }
      );
    }

    // Count existing templates
    const currentCount = await db.lockTemplate.count({
      where: { userId },
    });

    if (!isAdmin && currentCount >= planConfig.maxLockTemplates) {
      return NextResponse.json(
        {
          error: `Batas kuota tercapai: Paket ${planConfig.name} Anda hanya dapat menyimpan maksimal ${planConfig.maxLockTemplates} template.`,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, htmlContent, isDefault } = body as {
      name?: string;
      htmlContent?: string;
      isDefault?: boolean;
    };

    if (!name?.trim() || !htmlContent?.trim()) {
      return NextResponse.json(
        { error: 'Nama template dan konten HTML wajib diisi.' },
        { status: 400 }
      );
    }

    const template = await db.lockTemplate.create({
      data: {
        name: name.trim(),
        htmlContent: htmlContent.trim(),
        isDefault: Boolean(isDefault),
        userId: userId === 'root-admin' ? (await db.user.findFirst())?.id || userId : userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Template "${template.name}" berhasil disimpan.`,
      template,
    });
  } catch (err: unknown) {
    console.error('[api/templates/POST]', err);
    return NextResponse.json({ error: 'Gagal membuat template.' }, { status: 500 });
  }
}
