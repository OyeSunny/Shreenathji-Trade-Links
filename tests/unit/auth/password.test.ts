import {
  hashOwnerPassword,
  verifyOwnerPassword,
} from '@/features/auth/server/password';

describe('owner password policy', () => {
  it('creates an Argon2id hash and verifies only the correct password', async () => {
    const password = 'Correct-Horse-Battery-Staple-92!';
    const hash = await hashOwnerPassword(password);

    expect(hash).toMatch(/^\$argon2id\$/);
    await expect(verifyOwnerPassword(hash, password)).resolves.toBe(true);
    await expect(verifyOwnerPassword(hash, 'wrong-password')).resolves.toBe(
      false,
    );
  });

  it('fails closed when given a malformed password hash', async () => {
    await expect(
      verifyOwnerPassword('not-a-password-hash', 'anything'),
    ).resolves.toBe(false);
  });
});
