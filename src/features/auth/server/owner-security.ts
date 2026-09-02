import { db } from '@/lib/db';
import 'server-only';

export const getOwnerSecurityState = async (userId: string) => {
  const [twoFactor, policy] = await Promise.all([
    db.twoFactor.findFirst({
      where: { userId },
      select: { verified: true },
    }),
    db.ownerSecurityPolicy.findUnique({
      where: { id: 1 },
      select: { requiresTwoFactorSetup: true },
    }),
  ]);

  const isTwoFactorVerified = twoFactor?.verified === true;

  return {
    isTwoFactorVerified,
    requiresSetup:
      policy?.requiresTwoFactorSetup === true || !isTwoFactorVerified,
  };
};
