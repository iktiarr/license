import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { PlanTier } from '@/lib/plans';

/**
 * GET /api/admin/users/[id]
 * Fetch detailed user data with projects and activity logs
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN';

    if (!isAdmin) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 403 });
    }

    const user = await db.user.findUnique({
      where: { id },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            domain: true,
            status: true,
            frameworkType: true,
            createdAt: true,
            lastHeartbeat: true,
          },
          orderBy: { updatedAt: 'desc' },
        },
        userLogs: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        plan: user.plan,
        planStartedAt: user.planStartedAt ? user.planStartedAt.toISOString() : null,
        planExpiresAt: user.planExpiresAt ? user.planExpiresAt.toISOString() : null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        projects: user.projects,
        logs: user.userLogs,
      },
    });
  } catch (err: unknown) {
    console.error('[api/admin/users/[id]/GET]', err);
    return NextResponse.json({ error: 'Gagal mengambil detail pengguna.' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/users/[id]
 * Update user details, change password, plan, or role
 * Body: { username, email, phone, role, password, plan, planExpiresAt }
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Hanya Administrator yang dapat mengedit data pengguna.' }, { status: 403 });
    }

    const existingUser = await db.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    const body = await req.json();
    const { username, email, phone, role, password, plan, planExpiresAt } = body as {
      username?: string;
      email?: string;
      phone?: string;
      role?: string;
      password?: string;
      plan?: PlanTier;
      planExpiresAt?: string | null;
    };

    const updateData: {
      username?: string;
      email?: string;
      phone?: string;
      role?: string;
      password?: string;
      plan?: PlanTier;
      planStartedAt?: Date | null;
      planExpiresAt?: Date | null;
    } = {};

    const changes: string[] = [];

    if (username && username.trim().toLowerCase() !== existingUser.username) {
      const cleanUsername = username.trim().toLowerCase();
      const duplicate = await db.user.findUnique({ where: { username: cleanUsername } });
      if (duplicate && duplicate.id !== id) {
        return NextResponse.json({ error: 'Username sudah digunakan oleh akun lain.' }, { status: 409 });
      }
      updateData.username = cleanUsername;
      changes.push(`Username diubah menjadi "${cleanUsername}"`);
    }

    if (email && email.trim().toLowerCase() !== existingUser.email) {
      const cleanEmail = email.trim().toLowerCase();
      const duplicate = await db.user.findUnique({ where: { email: cleanEmail } });
      if (duplicate && duplicate.id !== id) {
        return NextResponse.json({ error: 'Email sudah digunakan oleh akun lain.' }, { status: 409 });
      }
      updateData.email = cleanEmail;
      changes.push(`Email diubah menjadi "${cleanEmail}"`);
    }

    if (phone && phone.trim() !== existingUser.phone) {
      updateData.phone = phone.trim();
      changes.push(`Nomor telepon diubah`);
    }

    if (role && role !== existingUser.role) {
      updateData.role = role === 'ADMIN' ? 'ADMIN' : 'DEVELOPER';
      changes.push(`Role diubah menjadi "${updateData.role}"`);
    }

    if (password && password.trim().length > 0) {
      updateData.password = await bcrypt.hash(password.trim(), 10);
      changes.push(`Password di-reset oleh Admin`);
    }

    if (plan && plan !== existingUser.plan) {
      updateData.plan = plan;
      updateData.planStartedAt = plan !== 'FREE' ? new Date() : null;
      updateData.planExpiresAt = plan !== 'FREE' && planExpiresAt ? new Date(planExpiresAt) : null;
      changes.push(`Paket diubah dari ${existingUser.plan} ke ${plan}`);
    } else if (planExpiresAt !== undefined) {
      updateData.planExpiresAt = planExpiresAt ? new Date(planExpiresAt) : null;
      changes.push(`Masa aktif diperbarui`);
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        plan: true,
        planStartedAt: true,
        planExpiresAt: true,
        createdAt: true,
      },
    });

    // Record User Log
    if (changes.length > 0) {
      try {
        await db.userLog.create({
          data: {
            userId: updatedUser.id,
            username: updatedUser.username,
            action: 'USER_UPDATED',
            details: `Perubahan data oleh Admin: ${changes.join(', ')}.`,
          },
        });
      } catch { /* ignore log error */ }
    }

    return NextResponse.json({
      success: true,
      message: `Data pengguna "${updatedUser.username}" berhasil diperbarui!`,
      user: {
        ...updatedUser,
        planStartedAt: updatedUser.planStartedAt ? updatedUser.planStartedAt.toISOString() : null,
        planExpiresAt: updatedUser.planExpiresAt ? updatedUser.planExpiresAt.toISOString() : null,
      },
    });
  } catch (err: unknown) {
    console.error('[api/admin/users/[id]/PUT]', err);
    return NextResponse.json({ error: 'Gagal memperbarui data pengguna.' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete a user
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Hanya Administrator yang dapat menghapus akun pengguna.' }, { status: 403 });
    }

    const existingUser = await db.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    await db.user.delete({ where: { id } });

    try {
      await db.userLog.create({
        data: {
          username: existingUser.username,
          action: 'USER_DELETED',
          details: `Akun "${existingUser.username}" (${existingUser.email}) telah dihapus oleh Admin.`,
        },
      });
    } catch { /* ignore log error */ }

    return NextResponse.json({
      success: true,
      message: `Akun pengguna "${existingUser.username}" berhasil dihapus.`,
    });
  } catch (err: unknown) {
    console.error('[api/admin/users/[id]/DELETE]', err);
    return NextResponse.json({ error: 'Gagal menghapus pengguna.' }, { status: 500 });
  }
}
