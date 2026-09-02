import { vi } from 'vitest';

const user = vi.hoisted(() => ({ count: vi.fn() }));
const bootstrapOwner = vi.hoisted(() => vi.fn());

vi.mock('@/lib/db', () => ({ db: { user } }));
vi.mock('@/lib/env', () => ({
  env: {
    OWNER_EMAIL: 'owner@example.com',
    OWNER_SETUP_TOKEN: 'a-32-character-local-only-setup-code',
  },
}));
vi.mock('@/features/auth/server/owner-bootstrap', () => ({ bootstrapOwner }));

import {
  completeInitialOwnerSetup,
  isInitialOwnerSetupAvailable,
} from '@/features/auth/server/initial-owner-setup';

describe('initial owner setup', () => {
  beforeEach(() => {
    user.count.mockReset();
    bootstrapOwner.mockReset();
    user.count.mockResolvedValue(0);
  });

  it('is only available before any user exists', async () => {
    await expect(isInitialOwnerSetupAvailable()).resolves.toBe(true);
    user.count.mockResolvedValue(1);
    await expect(isInitialOwnerSetupAvailable()).resolves.toBe(false);
  });

  it('requires the private setup token before creating the configured owner', async () => {
    await expect(
      completeInitialOwnerSetup({
        password: 'Correct-Horse-Battery-Staple-92!',
        setupToken: 'wrong-setup-token',
      }),
    ).rejects.toThrow('INITIAL_SETUP_DENIED');
    expect(bootstrapOwner).not.toHaveBeenCalled();

    bootstrapOwner.mockResolvedValue('created');
    await expect(
      completeInitialOwnerSetup({
        password: 'Correct-Horse-Battery-Staple-92!',
        setupToken: 'a-32-character-local-only-setup-code',
      }),
    ).resolves.toBe('created');
    expect(bootstrapOwner).toHaveBeenCalledWith({
      email: 'owner@example.com',
      password: 'Correct-Horse-Battery-Staple-92!',
    });
  });
});
