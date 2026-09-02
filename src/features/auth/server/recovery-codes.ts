import { db } from '@/lib/db';
import { createHash, randomBytes } from 'node:crypto';
import 'server-only';

const recoveryCodeCount = 10;

export const normalizeRecoveryCode = (code: string) =>
  code.replace(/[^a-z0-9]/gi, '').toUpperCase();

export const hashRecoveryCode = (code: string) =>
  createHash('sha256').update(normalizeRecoveryCode(code)).digest('hex');

export const createRecoveryCodes = () =>
  Array.from({ length: recoveryCodeCount }, () =>
    randomBytes(18).toString('base64url'),
  );

/**
 * Creates the one-time recovery codes shown immediately after a successful
 * authenticator setup. Only hashes are committed to the database.
 */
export const completeOwnerTwoFactorSetup = async (userId: string) => {
  const recoveryCodes = createRecoveryCodes();

  await db.$transaction(async (transaction) => {
    const [owner, twoFactor, policy] = await Promise.all([
      transaction.user.findUnique({
        where: { id: userId },
        select: { email: true, twoFactorEnabled: true },
      }),
      transaction.twoFactor.findFirst({ where: { userId } }),
      transaction.ownerSecurityPolicy.findUnique({ where: { id: 1 } }),
    ]);

    if (
      !owner ||
      !owner.twoFactorEnabled ||
      twoFactor?.verified !== true ||
      policy?.requiresTwoFactorSetup !== true
    ) {
      throw new Error('TWO_FACTOR_SETUP_NOT_READY');
    }

    await transaction.recoveryCode.deleteMany({ where: { userId } });
    await transaction.recoveryCode.createMany({
      data: recoveryCodes.map((code) => ({
        userId,
        codeHash: hashRecoveryCode(code),
      })),
    });
    await transaction.ownerSecurityPolicy.update({
      where: { id: 1 },
      data: { requiresTwoFactorSetup: false },
    });
    await transaction.securityEvent.create({
      data: {
        type: 'TWO_FACTOR_ENABLED',
        userId,
        metadata: { recoveryCodeCount },
      },
    });
  });

  return recoveryCodes;
};
