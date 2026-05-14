import NextAuth, { type NextAuthConfig, type DefaultSession } from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { checkOtp, isTwilioConfigured } from '@/lib/twilio';

// In-memory OTP attempt tracker (best-effort; resets on server restart).
// 3 wrong attempts → 15-minute lockout per phone number.
const otpAttempts = new Map<string, { count: number; lockedUntil: number }>();
const OTP_LOCKOUT_MS = 15 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 3;

function recordOtpFailure(phone: string) {
  const rec = otpAttempts.get(phone) ?? { count: 0, lockedUntil: 0 };
  rec.count += 1;
  if (rec.count >= OTP_MAX_ATTEMPTS) {
    rec.lockedUntil = Date.now() + OTP_LOCKOUT_MS;
    rec.count = 0;
  }
  otpAttempts.set(phone, rec);
}

function isOtpLocked(phone: string): boolean {
  const rec = otpAttempts.get(phone);
  if (!rec) return false;
  if (rec.lockedUntil > Date.now()) return true;
  if (rec.lockedUntil > 0 && rec.lockedUntil <= Date.now()) {
    otpAttempts.delete(phone);
  }
  return false;
}

function clearOtpFailures(phone: string) {
  otpAttempts.delete(phone);
}

// Augment NextAuth types so session.user.id and session.user.role are typed.
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'user' | 'admin';
    } & DefaultSession['user'];
  }
}

type UserRole = 'user' | 'admin';

export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/signin',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      id: 'phone-otp',
      name: 'Phone OTP',
      credentials: {
        phone: { type: 'text' },
        code: { type: 'text' },
      },
      async authorize(credentials) {
        const phone = typeof credentials?.phone === 'string' ? credentials.phone : '';
        const code = typeof credentials?.code === 'string' ? credentials.code : '';
        if (!phone || !code) return null;
        if (!isTwilioConfigured()) return null;
        if (isOtpLocked(phone)) return null;

        try {
          const result = await checkOtp(phone, code);
          if (result.status !== 'approved') {
            recordOtpFailure(phone);
            return null;
          }
        } catch {
          recordOtpFailure(phone);
          return null;
        }

        clearOtpFailures(phone);

        let user = await prisma.user.findUnique({ where: { phone } });
        if (!user) {
          user = await prisma.user.create({ data: { phone } });
        }
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
    Credentials({
      id: 'email-password',
      name: 'Email and password',
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === 'string' ? credentials.email : '';
        const password = typeof credentials?.password === 'string' ? credentials.password : '';
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        if (!(await bcrypt.compare(password, user.passwordHash))) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Credentials providers (phone-otp, email-password) already returned an id; pass through.
      if (account?.provider === 'phone-otp' || account?.provider === 'email-password') {
        return true;
      }

      // OAuth path.
      if (!user.email) return false;

      let dbUser = await prisma.user.findUnique({ where: { email: user.email } });

      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            githubUrl:
              account?.provider === 'github' && profile && 'html_url' in profile
                ? (profile.html_url as string)
                : null,
          },
        });
      } else if (
        account?.provider === 'github' &&
        !dbUser.githubUrl &&
        profile &&
        'html_url' in profile
      ) {
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { githubUrl: profile.html_url as string },
        });
      }

      // Stash the internal id on the NextAuth user so the jwt callback can pick it up.
      user.id = dbUser.id;
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        (token as { role?: UserRole }).role = dbUser?.role ?? 'user';
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
        const role = (token as { role?: UserRole }).role;
        session.user.role = role ?? 'user';
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
