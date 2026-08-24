import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'K7hPqR9mXvL2nJdW5tBcYuA3eGsFzN8k',
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const adminEmail = (process.env.ADMIN_EMAIL || 'admin@licenseguard.dev').trim();
        const adminPassword = (process.env.ADMIN_PASSWORD || 'Admin@1234').trim();

        if (!credentials?.email || !credentials?.password) return null;

        const inputEmail = String(credentials.email).trim();
        const inputPassword = String(credentials.password).trim();

        const emailMatch = inputEmail === adminEmail;
        const passwordMatch = inputPassword === adminPassword;

        if (emailMatch && passwordMatch) {
          return {
            id: 'admin',
            email: adminEmail,
            name: 'Administrator',
          };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
