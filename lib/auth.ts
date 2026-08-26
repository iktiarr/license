import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// If NEXTAUTH_URL was accidentally set to localhost in production on Vercel,
// sanitize it so NextAuth dynamically determines the live domain via trustHost.
if (process.env.NODE_ENV === 'production') {
  if (process.env.NEXTAUTH_URL?.includes('localhost')) {
    delete process.env.NEXTAUTH_URL;
  }
  if (process.env.AUTH_URL?.includes('localhost')) {
    delete process.env.AUTH_URL;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'K7hPqR9mXvL2nJdW5tBcYuA3eGsFzN8k',
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email / Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const identifier = String(credentials.email).trim().toLowerCase();
        const inputPassword = String(credentials.password).trim();

        // 1. Cek User di database (bisa login via Email atau Username)
        try {
          const user = await db.user.findFirst({
            where: {
              OR: [
                { email: identifier },
                { username: identifier },
              ],
            },
          });

          if (user && user.password) {
            const isPasswordValid = await bcrypt.compare(inputPassword, user.password);
            if (isPasswordValid) {
              return {
                id: user.id,
                email: user.email,
                name: user.username,
                role: user.role,
              };
            }
          }
        } catch (dbErr) {
          console.error('[auth/authorize] DB query error:', dbErr);
        }

        // 2. Admin Environment Fallback (Root System Admin)
        const adminEmail = (process.env.ADMIN_EMAIL || 'admin@licenseguard.dev').trim().toLowerCase();
        const adminPassword = (process.env.ADMIN_PASSWORD || 'Admin@1234').trim();

        const emailMatch = identifier === adminEmail || identifier === 'admin';
        const passwordMatch = inputPassword === adminPassword;

        if (emailMatch && passwordMatch) {
          return {
            id: 'root-admin',
            email: adminEmail,
            name: 'Root Admin',
            role: 'ADMIN',
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 14 * 24 * 60 * 60, // 14 days
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'DEVELOPER';
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
});
