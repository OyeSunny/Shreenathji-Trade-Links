import { ownerEmailSchema, ownerPasswordSchema } from '@/features/auth/schemas';
import { hashOwnerPassword } from '@/features/auth/server/password';
import { Prisma } from '@/generated/prisma/client';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { randomUUID } from 'node:crypto';
import 'server-only';

export type OwnerBootstrapInput = {
  email: string;
  password: string;
};

export const bootstrapOwner = async ({
  email,
  password,
}: OwnerBootstrapInput) => {
  const ownerEmail = ownerEmailSchema.parse(email);

  if (ownerEmail !== env.OWNER_EMAIL) {
    throw new Error('OWNER_EMAIL_MISMATCH');
  }

  const validPassword = ownerPasswordSchema.parse(password);
  const passwordHash = await hashOwnerPassword(validPassword);

  try {
    return await db.$transaction(async (transaction) => {
      const existingOwner = await transaction.user.findUnique({
        where: { email: ownerEmail },
      });

      if (existingOwner) {
        return 'exists' as const;
      }

      const existingUserCount = await transaction.user.count();

      if (existingUserCount > 0) {
        throw new Error('OWNER_ALREADY_CONFIGURED');
      }

      const userId = randomUUID();
      const user = await transaction.user.create({
        data: {
          id: userId,
          name: 'Shreenathji Trade Links Owner',
          email: ownerEmail,
          emailVerified: true,
          twoFactorEnabled: false,
        },
      });

      await transaction.account.create({
        data: {
          id: randomUUID(),
          issuer: 'local:credential',
          accountId: userId,
          providerId: 'credential',
          userId,
          password: passwordHash,
        },
      });

      await transaction.ownerSecurityPolicy.upsert({
        where: { id: 1 },
        create: { id: 1, requiresTwoFactorSetup: true },
        update: { requiresTwoFactorSetup: true },
      });

      await transaction.securityEvent.create({
        data: {
          type: 'OWNER_BOOTSTRAPPED',
          userId: user.id,
        },
      });

      return 'created' as const;
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return 'exists' as const;
    }

    throw error;
  }
};
