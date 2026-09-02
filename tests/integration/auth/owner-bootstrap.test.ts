import { bootstrapOwner } from '@/features/auth/server/owner-bootstrap';
import { db } from '@/lib/db';

const databaseTestsEnabled = process.env.RUN_DATABASE_TESTS === '1';
const strongPassword = 'Correct-Horse-Battery-Staple-92!';

describe.skipIf(!databaseTestsEnabled)('bootstrapOwner', () => {
  beforeEach(async () => {
    await db.securityEvent.deleteMany();
    await db.recoveryCode.deleteMany();
    await db.twoFactor.deleteMany();
    await db.account.deleteMany();
    await db.session.deleteMany();
    await db.user.deleteMany();
    await db.ownerSecurityPolicy.deleteMany();
  });

  it('creates exactly one approved owner and is idempotent', async () => {
    await expect(
      bootstrapOwner({ email: 'owner@example.com', password: strongPassword }),
    ).resolves.toBe('created');
    await expect(
      bootstrapOwner({ email: 'owner@example.com', password: strongPassword }),
    ).resolves.toBe('exists');

    await expect(db.user.count()).resolves.toBe(1);
    await expect(db.account.count()).resolves.toBe(1);
    await expect(
      db.ownerSecurityPolicy.findUnique({ where: { id: 1 } }),
    ).resolves.toMatchObject({
      requiresTwoFactorSetup: true,
    });
    await expect(
      db.securityEvent.findFirst({ where: { type: 'OWNER_BOOTSTRAPPED' } }),
    ).resolves.toMatchObject({ userId: expect.any(String) });
  });

  it('rejects an email other than the configured owner', async () => {
    await expect(
      bootstrapOwner({ email: 'other@example.com', password: strongPassword }),
    ).rejects.toThrow('OWNER_EMAIL_MISMATCH');
  });
});
