import { vi } from 'vitest';

const passwordResetChallenge = vi.hoisted(() => ({
  deleteMany: vi.fn(),
  create: vi.fn(),
}));
const user = vi.hoisted(() => ({ findUnique: vi.fn() }));
const securityEvent = vi.hoisted(() => ({ create: vi.fn() }));
const transaction = vi.hoisted(() => ({
  passwordResetChallenge,
  user,
  securityEvent,
}));
const db = vi.hoisted(() => ({
  $transaction: vi.fn((callback) => callback(transaction)),
}));

vi.mock('@/lib/db', () => ({ db }));
vi.mock('@/lib/env', () => ({
  env: {
    OWNER_EMAIL: 'owner@example.com',
    BETTER_AUTH_URL: 'http://localhost:3000',
    NODE_ENV: 'development',
  },
}));

import { createOwnerPasswordReset } from '@/features/auth/server/password-reset';

describe('createOwnerPasswordReset', () => {
  beforeEach(() => {
    db.$transaction.mockClear();
    passwordResetChallenge.deleteMany.mockReset();
    passwordResetChallenge.create.mockReset();
    securityEvent.create.mockReset();
    user.findUnique.mockReset();
    user.findUnique.mockResolvedValue({ id: 'owner-user-id' });
  });

  it('creates a short-lived hashed challenge only for the configured owner', async () => {
    const result = await createOwnerPasswordReset('OWNER@example.com');

    expect(result?.localResetUrl).toMatch(/^\/admin\/reset-password\?token=.+/);
    expect(passwordResetChallenge.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'owner-user-id',
        tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        expiresAt: expect.any(Date),
      }),
    });
    expect(securityEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: 'PASSWORD_RESET_REQUESTED',
        userId: 'owner-user-id',
      }),
    });
  });

  it('does not create a challenge for a different address', async () => {
    await expect(
      createOwnerPasswordReset('other@example.com'),
    ).resolves.toBeNull();
    expect(db.$transaction).not.toHaveBeenCalled();
  });
});
