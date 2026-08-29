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
        const isAdmin = (user as { role?: string }).role === 'ADMIN' || (user as { email?: string }).email?.toLowerCase() === adminEmail || user.name?.toLowerCase() === 'admin';
        token.role = isAdmin ? 'ADMIN' : ((user as { role?: string }).role || 'DEVELOPER');
        token.plan = isAdmin ? 'MAX' : ((user as { plan?: PlanTier }).plan || 'FREE');
        token.name = user.name;
        token.phone = (user as { phone?: string }).phone || '';
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        const isAdmin = token.role === 'ADMIN';
        const userId = token.id as string;
        session.user.id = userId;

        if (isAdmin || userId === 'root-admin') {
          (session.user as { role?: string }).role = 'ADMIN';
          (session.user as { plan?: PlanTier }).plan = 'MAX' as PlanTier;
          (session.user as { phone?: string }).phone = token.phone as string;
        } else {
          // Always query live user state from database so admin plan upgrades apply immediately without re-login!
          try {
            const liveUser = await db.user.findUnique({
              where: { id: userId },
              select: {
                role: true,
                plan: true,
                phone: true,
                username: true,
                planExpiresAt: true,
                updatedAt: true,
                createdAt: true,
              },
            });
            if (liveUser) {
              const liveIsAdmin = liveUser.role === 'ADMIN';
              let currentPlan = liveUser.plan as PlanTier;
              let isExpired = false;
              let daysLeft: number | null = null;

              // Check if paid subscription has expired (Auto-Downgrade to FREE)
              if (!liveIsAdmin && currentPlan !== 'FREE' && liveUser.planExpiresAt) {
                const now = new Date();
                const expiryDate = new Date(liveUser.planExpiresAt);

                if (expiryDate < now) {
                  // Plan has expired -> Auto downgrade in DB
                  try {
                    await db.user.update({
                      where: { id: userId },
                      data: { plan: 'FREE' },
                    });
                  } catch { /* ignore */ }
                  currentPlan = 'FREE';
                  isExpired = true;
                } else {
                  daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                }
              }

              (session.user as { role?: string }).role = liveIsAdmin ? 'ADMIN' : liveUser.role;
              (session.user as { plan?: PlanTier }).plan = liveIsAdmin ? ('MAX' as PlanTier) : currentPlan;
              (session.user as { phone?: string }).phone = liveUser.phone;
              (session.user as { planExpiresAt?: string | null }).planExpiresAt = liveUser.planExpiresAt ? liveUser.planExpiresAt.toISOString() : null;
              (session.user as { planStartedAt?: string | null }).planStartedAt = liveUser.updatedAt ? liveUser.updatedAt.toISOString() : liveUser.createdAt.toISOString();
              (session.user as { planDaysLeft?: number | null }).planDaysLeft = daysLeft;
              (session.user as { isPlanExpired?: boolean }).isPlanExpired = isExpired;

              if (liveUser.username) {
                session.user.name = liveUser.username;
              }
            } else {
              (session.user as { role?: string }).role = (token.role as string) || 'DEVELOPER';
              (session.user as { plan?: PlanTier }).plan = (token.plan as PlanTier) || 'FREE';
              (session.user as { phone?: string }).phone = token.phone as string;
            }
          } catch {
            (session.user as { role?: string }).role = (token.role as string) || 'DEVELOPER';
            (session.user as { plan?: PlanTier }).plan = (token.plan as PlanTier) || 'FREE';
            (session.user as { phone?: string }).phone = token.phone as string;
          }
        }
      }
      return session;
    },
  },
});
