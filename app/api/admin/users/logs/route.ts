import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * GET /api/admin/users/logs
 * Fetch all user activity logs (Admin only)
 */
export async function GET() {
  try {
    const session = await auth();
    const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN';

    if (!isAdmin) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 403 });
    }

    const logs = await db.userLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            plan: true,
          },
        },
      },
    });

    return NextResponse.json({ logs });
  } catch (err: unknown) {
    console.error('[api/admin/users/logs/GET]', err);
    return NextResponse.json({ error: 'Gagal mengambil log aktivitas pengguna.' }, { status: 500 });
  }
}
