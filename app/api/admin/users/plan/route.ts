import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { PlanTier } from '@/lib/plans';

/**
 * PATCH /api/admin/users/plan
 * Admin-only endpoint to upgrade/downgrade a user's plan tier
 * Body: { userId: string, plan: PlanTier }
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
    const { userId, plan } = body as { userId?: string; plan?: PlanTier };

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

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        plan,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        plan: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Paket pengguna ${updatedUser.username} berhasil diubah ke ${plan}.`,
      user: updatedUser,
    });
  } catch (err: unknown) {
    console.error('[admin/users/plan]', err);
    return NextResponse.json(
      { error: 'Gagal memperbarui paket pengguna.' },
      { status: 500 }
    );
  }
}
