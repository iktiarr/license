import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * POST /api/templates/assign
 * Assign or unassign a template to a project
 * Body: { projectId: string, templateId: string | null }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const userId = session.user.id;
    const isAdmin = (session.user as { role?: string })?.role === 'ADMIN';

    const body = await req.json();
    const { projectId, templateId } = body as {
      projectId?: string;
      templateId?: string | null;
    };

    if (!projectId) {
      return NextResponse.json({ error: 'projectId wajib disertakan.' }, { status: 400 });
    }

    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!project || (!isAdmin && project.userId && project.userId !== userId)) {
      return NextResponse.json({ error: 'Project tidak ditemukan atau bukan milik Anda.' }, { status: 404 });
    }

    const updated = await db.project.update({
      where: { id: projectId },
      data: {
        templateId: templateId || null,
        updatedAt: new Date(),
      },
      include: {
        template: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: templateId
        ? `Template "${updated.template?.name}" berhasil dipasang ke project ${updated.name}.`
        : `Project ${updated.name} kini menggunakan layar kunci standar bawaan sistem.`,
      project: updated,
    });
  } catch (err: unknown) {
    console.error('[api/templates/assign]', err);
    return NextResponse.json({ error: 'Gagal memasang template ke project.' }, { status: 500 });
  }
}
