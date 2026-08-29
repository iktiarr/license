import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { PlanTier } from '@/lib/plans';

/**
 * PATCH /api/admin/users/plan
 * Admin-only endpoint to upgrade/downgrade a user's plan tier and set active period (Jatuh Tempo)
 * Body: { userId: string, plan: PlanTier, planStartedAt?: string | null, planExpiresAt?: string | null }
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'UNAUTHORIZED: Hanya Administrator yang berhak mengubah paket pengguna.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, plan, planStartedAt, planExpiresAt } = body as {
      userId?: string;
      plan?: PlanTier;
      planStartedAt?: string | null;
      planExpiresAt?: string | null;
    };

    if (!userId || !plan) {
      return NextResponse.json(
        { error: 'userId dan plan wajib disertakan.' },
        { status: 400 }
      );
    }

    const validPlans: PlanTier[] = ['FREE', 'PLUS', 'PRO', 'MAX'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: 'Pilihan paket tidak valid.' },
        { status: 400 }
      );
    }

    let startedAtDate: Date | null = null;
    let expiresAtDate: Date | null = null;

    if (plan !== 'FREE') {
      startedAtDate = planStartedAt ? new Date(planStartedAt) : new Date();
      if (planExpiresAt) {
        expiresAtDate = new Date(planExpiresAt);
      } else {
        // Default 30 days if not specified
        expiresAtDate = new Date(startedAtDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      }
    } else {
      startedAtDate = null;
      expiresAtDate = null;
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        plan,
        planExpiresAt: expiresAtDate,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        plan: true,
        role: true,
        planExpiresAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Paket pengguna ${updatedUser.username} berhasil diubah ke ${plan}${
        expiresAtDate ? ` (Aktif s/d ${new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(expiresAtDate)})` : ''
      }.`,
      user: updatedUser,
    });
  } catch (err: unknown) {
    console.error('[admin/users/plan]', err);
    return NextResponse.json(
      { error: 'Gagal memperbarui paket dan masa aktif pengguna.' },
      { status: 500 }
    );
  }
}
