import {
  createRecoveryCodes,
  hashRecoveryCode,
  normalizeRecoveryCode,
} from '@/features/auth/server/recovery-codes';

describe('recovery code policy', () => {
  it('creates high-entropy unique codes and stores only deterministic hashes', () => {
    const codes = createRecoveryCodes();

    expect(codes).toHaveLength(10);
    expect(new Set(codes).size).toBe(10);
    expect(codes.every((code) => code.length >= 20)).toBe(true);
    expect(hashRecoveryCode(codes[0])).toMatch(/^[a-f0-9]{64}$/);
  });

  it('normalizes code entry without weakening the stored hash', () => {
    expect(normalizeRecoveryCode(' ab-cd ef ')).toBe('ABCDEF');
    expect(hashRecoveryCode('AB-CD EF')).toBe(hashRecoveryCode('abcdef'));
  });
});
