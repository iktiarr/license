import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { PlanTier } from '@/lib/plans';

const adminEmailDefault = 'admin@licenseguard.dev';

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
        const adminEmail = (process.env.ADMIN_EMAIL || adminEmailDefault).trim().toLowerCase();
        const adminPassword = (process.env.ADMIN_PASSWORD || 'Admin@1234').trim();

        // 1. Cek Root Admin via Environment Variables
        const isRootAdminMatch = (identifier === adminEmail || identifier === 'admin') && inputPassword === adminPassword;
        if (isRootAdminMatch) {
          return {
            id: 'root-admin',
            email: adminEmail,
            name: 'Root Administrator',
            role: 'ADMIN',
            plan: 'MAX' as PlanTier,
            phone: '085143975550',
          };
        }

        // 2. Cek User di database
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
              const isAdmin = user.role === 'ADMIN' || user.email.toLowerCase() === adminEmail || user.username.toLowerCase() === 'admin';
              return {
                id: user.id,
                email: user.email,
                name: user.username,
                role: isAdmin ? 'ADMIN' : user.role,
                plan: isAdmin ? ('MAX' as PlanTier) : (user.plan as PlanTier),
                phone: user.phone,
              };
            }
          }
        } catch (dbErr) {
          console.error('[auth/authorize] DB query error:', dbErr);
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
      const adminEmail = (process.env.ADMIN_EMAIL || adminEmailDefault).trim().toLowerCase();
      if (user) {
        token.id = user.id;
        const isAdmin = (user as any).role === 'ADMIN' || (user as any).email?.toLowerCase() === adminEmail || (user as any).name?.toLowerCase() === 'admin';
        token.role = isAdmin ? 'ADMIN' : ((user as any).role || 'DEVELOPER');
        token.plan = isAdmin ? 'MAX' : ((user as any).plan || 'FREE');
        token.name = user.name;
        token.phone = (user as any).phone || '';
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        const isAdmin = token.role === 'ADMIN';
        session.user.id = token.id as string;
        (session.user as any).role = isAdmin ? 'ADMIN' : (token.role as string || 'DEVELOPER');
        (session.user as any).plan = (isAdmin ? 'MAX' : (token.plan as PlanTier)) || (isAdmin ? 'MAX' : 'FREE');
        (session.user as any).phone = token.phone as string;
      }
      return session;
    },
  },
});
