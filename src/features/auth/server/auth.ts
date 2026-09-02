import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { betterAuth } from 'better-auth';
import { twoFactor } from 'better-auth/plugins';
import 'server-only';
import { hashOwnerPassword, verifyOwnerPassword } from './password';

export const auth = betterAuth({
  appName: 'Shreenathji Trade Links',
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, {
    provider: 'postgresql',
    transaction: true,
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 14,
    maxPasswordLength: 128,
    password: {
      hash: hashOwnerPassword,
      verify: ({ hash, password }) => verifyOwnerPassword(hash, password),
    },
  },
  session: {
    expiresIn: 12 * 60 * 60,
    updateAge: 30 * 60,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  trustedOrigins: [env.BETTER_AUTH_URL],
  plugins: [
    twoFactor({
      issuer: 'Shreenathji Trade Links',
      twoFactorCookieMaxAge: 10 * 60,
      trustDeviceMaxAge: 0,
      accountLockout: {
        enabled: true,
        maxFailedAttempts: 10,
        durationSeconds: 15 * 60,
      },
      backupCodeOptions: {
        amount: 10,
        length: 12,
        storeBackupCodes: 'encrypted',
      },
    }),
  ],
});
