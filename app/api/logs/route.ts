import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * DELETE /api/logs
 * Permanently delete activity logs
 * - Admin: Deletes all logs (or specific project logs if projectId given)
 * - Developer: Deletes all logs for their own projects
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const isAdmin = (session.user as { role?: string })?.role === 'ADMIN';
    const userId = session.user.id;

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    let deleteResult;

    if (isAdmin) {
      if (projectId) {
        deleteResult = await db.activityLog.deleteMany({
          where: { projectId },
        });
      } else {
        deleteResult = await db.activityLog.deleteMany({});
      }
    } else {
      // Non-admin can only delete logs of projects they own
      if (projectId) {
        // Verify project ownership
        const project = await db.project.findFirst({
          where: { id: projectId, userId },
        });
        if (!project) {
          return NextResponse.json({ error: 'Project tidak ditemukan atau bukan milik Anda.' }, { status: 403 });
        }
        deleteResult = await db.activityLog.deleteMany({
          where: { projectId },
        });
      } else {
        deleteResult = await db.activityLog.deleteMany({
          where: {
            project: { userId },
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `${deleteResult.count} log aktivitas berhasil dihapus secara permanen.`,
      count: deleteResult.count,
    });
  } catch (err: unknown) {
    console.error('[api/logs/DELETE]', err);
    return NextResponse.json({ error: 'Gagal menghapus log aktivitas.' }, { status: 500 });
  }
}
