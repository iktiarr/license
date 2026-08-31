import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getDynamicPlanConfigs, PlanTier } from '@/lib/plans';

export async function GET() {
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN';

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized: Admin only' }, { status: 403 });
  }

  const configs = await getDynamicPlanConfigs();
  return NextResponse.json({ success: true, plans: configs });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN';

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized: Admin only' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { plans } = body as {
      plans: Array<{
        id: PlanTier;
        name?: string;
        price: number;
        maxProjects: number;
        retentionDays: number;
        maxLockTemplates?: number;
        tagline?: string;
      }>;
    };

    if (!Array.isArray(plans) || plans.length === 0) {
      return NextResponse.json({ error: 'Payload tidak valid.' }, { status: 400 });
    }

    for (const p of plans) {
      const planId = p.id;
      const planName = p.name || planId;
      const planPrice = Number(p.price) || 0;
      const planMaxProjects = Number(p.maxProjects) || 1;
      const planRetentionDays = Number(p.retentionDays) || 0;
      const planMaxLockTemplates = typeof p.maxLockTemplates === 'number' ? p.maxLockTemplates : 0;
      const planTagline = p.tagline || '';

      await db.$executeRawUnsafe(
        `INSERT INTO "plan_settings" ("id", "name", "price", "maxProjects", "retentionDays", "maxLockTemplates", "tagline", "features", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         ON CONFLICT ("id") DO UPDATE SET
           "name" = EXCLUDED."name",
           "price" = EXCLUDED."price",
           "maxProjects" = EXCLUDED."maxProjects",
           "retentionDays" = EXCLUDED."retentionDays",
           "maxLockTemplates" = EXCLUDED."maxLockTemplates",
           "tagline" = EXCLUDED."tagline",
           "updatedAt" = NOW()`,
        planId,
        planName,
        planPrice,
        planMaxProjects,
        planRetentionDays,
        planMaxLockTemplates,
        planTagline,
        []
      );
    }

    const updatedConfigs = await getDynamicPlanConfigs();
    revalidatePath('/billing');
    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath('/users');

    return NextResponse.json({
      success: true,
      message: 'Pengaturan limit dan harga paket berhasil disimpan & diterapkan ke seluruh sistem.',
      plans: updatedConfigs,
    });
  } catch (err: unknown) {
    console.error('[PUT /api/admin/plans] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Gagal memperbarui pengaturan paket.' },
      { status: 500 }
    );
  }
}
