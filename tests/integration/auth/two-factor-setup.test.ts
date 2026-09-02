import { bootstrapOwner } from '@/features/auth/server/owner-bootstrap';
import {
  completeOwnerTwoFactorSetup,
  hashRecoveryCode,
} from '@/features/auth/server/recovery-codes';
import { db } from '@/lib/db';

const databaseTestsEnabled = process.env.RUN_DATABASE_TESTS === '1';
const strongPassword = 'Correct-Horse-Battery-Staple-92!';

describe.skipIf(!databaseTestsEnabled)('completeOwnerTwoFactorSetup', () => {
  beforeEach(async () => {
    await db.securityEvent.deleteMany();
    await db.recoveryCode.deleteMany();
    await db.twoFactor.deleteMany();
    await db.account.deleteMany();
    await db.session.deleteMany();
    await db.user.deleteMany();
    await db.ownerSecurityPolicy.deleteMany();
  });

  it('stores only recovery-code hashes after verified TOTP setup', async () => {
    await bootstrapOwner({
      email: 'owner@example.com',
      password: strongPassword,
    });
    const owner = await db.user.findUniqueOrThrow({
      where: { email: 'owner@example.com' },
    });

    await db.user.update({
      where: { id: owner.id },
      data: { twoFactorEnabled: true },
    });
    await db.twoFactor.create({
      data: {
        id: 'test-two-factor',
        userId: owner.id,
        secret: 'encrypted-test-secret',
        backupCodes: '',
        verified: true,
      },
    });
    await db.session.createMany({
      data: [
        {
          id: 'pre-setup-session-a',
          userId: owner.id,
          token: 'pre-setup-token-a',
          expiresAt: new Date(Date.now() + 60_000),
        },
        {
          id: 'pre-setup-session-b',
          userId: owner.id,
          token: 'pre-setup-token-b',
          expiresAt: new Date(Date.now() + 60_000),
        },
      ],
    });

    const recoveryCodes = await completeOwnerTwoFactorSetup(owner.id);
    const persistedCodes = await db.recoveryCode.findMany({
      where: { userId: owner.id },
      select: { codeHash: true, usedAt: true },
    });

    expect(recoveryCodes).toHaveLength(10);
    expect(persistedCodes).toHaveLength(10);
    expect(persistedCodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          codeHash: hashRecoveryCode(recoveryCodes[0]),
          usedAt: null,
        }),
      ]),
    );
    await expect(
      db.ownerSecurityPolicy.findUnique({ where: { id: 1 } }),
    ).resolves.toMatchObject({
      requiresTwoFactorSetup: false,
      twoFactorEnforcedAt: expect.any(Date),
    });
    await expect(
      db.session.count({ where: { userId: owner.id } }),
    ).resolves.toBe(0);
    await expect(
      db.securityEvent.findFirst({ where: { type: 'TWO_FACTOR_ENABLED' } }),
    ).resolves.toMatchObject({ userId: owner.id });
    await expect(completeOwnerTwoFactorSetup(owner.id)).rejects.toThrow(
      'TWO_FACTOR_SETUP_NOT_READY',
    );
  });

  it('atomically allows only one completion to issue recovery codes', async () => {
    await bootstrapOwner({
      email: 'owner@example.com',
      password: strongPassword,
    });
    const owner = await db.user.findUniqueOrThrow({
      where: { email: 'owner@example.com' },
    });

    await db.user.update({
      where: { id: owner.id },
      data: { twoFactorEnabled: true },
    });
    await db.twoFactor.create({
      data: {
        id: 'parallel-test-two-factor',
        userId: owner.id,
        secret: 'encrypted-test-secret',
        backupCodes: '',
        verified: true,
      },
    });

    const results = await Promise.allSettled([
      completeOwnerTwoFactorSetup(owner.id),
      completeOwnerTwoFactorSetup(owner.id),
    ]);

    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(
      results.filter((result) => result.status === 'rejected'),
    ).toHaveLength(1);
    await expect(
      db.recoveryCode.count({ where: { userId: owner.id } }),
    ).resolves.toBe(10);
  });
});
