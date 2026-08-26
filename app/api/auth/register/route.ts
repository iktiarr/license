import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, phone, password } = body as {
      username?: string;
      email?: string;
      phone?: string;
      password?: string;
    };

    if (!username || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Semua kolom (username, email, nomor telepon, password) wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanPassword = password.trim();

    // Validation checks
    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { error: 'Username minimal terdiri dari 3 karakter.' },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
      return NextResponse.json(
        { error: 'Username hanya boleh memuat huruf, angka, garis bawah (_), atau strip (-).' },
        { status: 400 }
      );
    }

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'Format alamat email tidak valid.' },
        { status: 400 }
      );
    }

    if (cleanPhone.length < 8) {
      return NextResponse.json(
        { error: 'Nomor telepon tidak valid (minimal 8 digit).' },
        { status: 400 }
      );
    }

    if (cleanPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal terdiri dari 6 karakter.' },
        { status: 400 }
      );
    }

    // Check existing user by email or username
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { username: cleanUsername },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === cleanEmail) {
        return NextResponse.json(
          { error: 'Alamat email ini sudah terdaftar. Silakan login.' },
          { status: 409 }
        );
      }
      if (existingUser.username === cleanUsername) {
        return NextResponse.json(
          { error: 'Username ini sudah digunakan. Silakan pilih username lain.' },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    // Create user
    const newUser = await db.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail,
        phone: cleanPhone,
        password: hashedPassword,
        role: 'DEVELOPER',
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Registrasi developer berhasil. Silakan login ke akun Anda.',
        user: newUser,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error('[auth/register]', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat proses registrasi.' },
      { status: 500 }
    );
  }
}
