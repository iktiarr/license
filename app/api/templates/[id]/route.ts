import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * PUT /api/templates/[id]
 * Update an existing template
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const userId = session.user.id;
    const isAdmin = (session.user as { role?: string })?.role === 'ADMIN';

    const existing = await db.lockTemplate.findUnique({
      where: { id },
    });

    if (!existing || (!isAdmin && existing.userId !== userId)) {
      return NextResponse.json({ error: 'Template tidak ditemukan atau bukan milik Anda.' }, { status: 404 });
    }

    const body = await req.json();
    const { name, htmlContent, isDefault } = body as {
      name?: string;
      htmlContent?: string;
      isDefault?: boolean;
    };

    const updated = await db.lockTemplate.update({
      where: { id },
      data: {
        ...(name?.trim() ? { name: name.trim() } : {}),
        ...(htmlContent?.trim() ? { htmlContent: htmlContent.trim() } : {}),
        ...(typeof isDefault === 'boolean' ? { isDefault } : {}),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Template "${updated.name}" berhasil diperbarui.`,
      template: updated,
    });
  } catch (err: unknown) {
    console.error('[api/templates/[id]/PUT]', err);
    return NextResponse.json({ error: 'Gagal memperbarui template.' }, { status: 500 });
  }
}

/**
 * DELETE /api/templates/[id]
 * Delete a template
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const userId = session.user.id;
    const isAdmin = (session.user as { role?: string })?.role === 'ADMIN';

    const existing = await db.lockTemplate.findUnique({
      where: { id },
    });

    if (!existing || (!isAdmin && existing.userId !== userId)) {
      return NextResponse.json({ error: 'Template tidak ditemukan atau bukan milik Anda.' }, { status: 404 });
    }

    await db.lockTemplate.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Template "${existing.name}" berhasil dihapus.`,
    });
  } catch (err: unknown) {
    console.error('[api/templates/[id]/DELETE]', err);
    return NextResponse.json({ error: 'Gagal menghapus template.' }, { status: 500 });
  }
}
