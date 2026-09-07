import { ownerEmailSchema, ownerPasswordSchema } from '@/features/auth/schemas';
import { hashOwnerPassword } from '@/features/auth/server/password';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { mailer } from '@/lib/mailer';
import { createHash, randomBytes } from 'node:crypto';
import 'server-only';

const resetLifetimeMilliseconds = 30 * 60 * 1000;
const hashResetToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

export const createOwnerPasswordReset = async (email: string) => {
  const parsedEmail = ownerEmailSchema.safeParse(email);
  if (!parsedEmail.success || parsedEmail.data !== env.OWNER_EMAIL) {
    return null;
  }

  const token = randomBytes(32).toString('base64url');
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + resetLifetimeMilliseconds);

  const challenge = await db.$transaction(async (transaction) => {
    const owner = await transaction.user.findUnique({
      where: { email: env.OWNER_EMAIL },
      select: { id: true },
    });
    if (!owner) return null;

    await transaction.passwordResetChallenge.deleteMany({
      where: { userId: owner.id, usedAt: null },
    });
    await transaction.passwordResetChallenge.create({
      data: { userId: owner.id, tokenHash, expiresAt },
    });
    await transaction.securityEvent.create({
      data: { type: 'PASSWORD_RESET_REQUESTED', userId: owner.id },
    });

    return { ownerEmail: env.OWNER_EMAIL };
  });

  if (!challenge) return null;

  if (env.NODE_ENV === 'development') {
    return { localResetUrl: `/admin/reset-password?token=${token}` };
  }

  const resetUrl = new URL('/admin/reset-password', env.BETTER_AUTH_URL);
  resetUrl.searchParams.set('token', token);
  await mailer.send({
    to: challenge.ownerEmail,
    subject: 'Reset your Shreenathji Trade Links owner password',
    text: `Use this one-time link within 30 minutes to reset your password: ${resetUrl.toString()}`,
  });

  return null;
};

export const completeOwnerPasswordReset = async ({
  token,
  password,
}: {
  token: string;
  password: string;
}) => {
  if (token.length < 40 || token.length > 200) return false;

  const parsedPassword = ownerPasswordSchema.safeParse(password);
  if (!parsedPassword.success) return false;

  const tokenHash = hashResetToken(token);
  const passwordHash = await hashOwnerPassword(parsedPassword.data);
  const now = new Date();

  return db.$transaction(async (transaction) => {
    const challenge = await transaction.passwordResetChallenge.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    });
    if (!challenge || challenge.usedAt || challenge.expiresAt <= now)
      return false;

    const owner = await transaction.user.findUnique({
      where: { id: challenge.userId },
      select: { id: true, email: true },
    });
    if (!owner || owner.email.toLowerCase() !== env.OWNER_EMAIL) return false;

    const credential = await transaction.account.findFirst({
      where: { userId: owner.id, providerId: 'credential' },
      select: { id: true },
    });
    if (!credential) return false;

    const claim = await transaction.passwordResetChallenge.updateMany({
      where: { id: challenge.id, usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now },
    });
    if (claim.count !== 1) return false;

    await transaction.account.update({
      where: { id: credential.id },
      data: { password: passwordHash },
    });
    await transaction.session.deleteMany({ where: { userId: owner.id } });
    await transaction.securityEvent.create({
      data: { type: 'PASSWORD_RESET_COMPLETED', userId: owner.id },
    });
    return true;
  });
};
