import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { PlanTier } from '@/lib/plans';

/**
 * POST /api/admin/users
 * Create a new user account (Admin only)
 * Body: { username, email, phone, password, role, plan, planExpiresAt }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Hanya Administrator yang dapat menambahkan pengguna.' }, { status: 403 });
    }

    const body = await req.json();
    const { username, email, phone, password, role, plan, planExpiresAt } = body as {
      username?: string;
      email?: string;
      phone?: string;
      password?: string;
      role?: string;
      plan?: PlanTier;
      planExpiresAt?: string | null;
    };

    if (!username?.trim() || !email?.trim() || !phone?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: 'Username, email, nomor WhatsApp, dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // Check duplicate username or email
    const existing = await db.user.findFirst({
      where: {
        OR: [{ username: cleanUsername }, { email: cleanEmail }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Username atau email sudah digunakan oleh pengguna lain.' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    const assignedPlan = plan || 'FREE';
    const expiresDate = assignedPlan !== 'FREE' && planExpiresAt ? new Date(planExpiresAt) : null;

    const newUser = await db.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail,
        phone: cleanPhone,
        password: hashedPassword,
        role: role === 'ADMIN' ? 'ADMIN' : 'DEVELOPER',
        plan: assignedPlan,
        planStartedAt: assignedPlan !== 'FREE' ? new Date() : null,
        planExpiresAt: expiresDate,
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
    try {
      await db.userLog.create({
        data: {
          userId: newUser.id,
          username: newUser.username,
          action: 'USER_CREATED',
          details: `Akun baru "${newUser.username}" (${newUser.role}) dibuat oleh Admin dengan paket ${newUser.plan}.`,
        },
      });
    } catch { /* ignore log error */ }

    return NextResponse.json({
      success: true,
      message: `Pengguna "${newUser.username}" berhasil ditambahkan!`,
      user: {
        ...newUser,
        planStartedAt: newUser.planStartedAt ? newUser.planStartedAt.toISOString() : null,
        planExpiresAt: newUser.planExpiresAt ? newUser.planExpiresAt.toISOString() : null,
        projectsCount: 0,
      },
    });
  } catch (err: unknown) {
    console.error('[api/admin/users/POST]', err);
    return NextResponse.json({ error: 'Gagal menambahkan pengguna baru.' }, { status: 500 });
  }
}
