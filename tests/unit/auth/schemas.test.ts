import {
  loginSchema,
  ownerEmailSchema,
  ownerPasswordSchema,
  totpSchema,
} from '@/features/auth/schemas';

describe('owner authentication schemas', () => {
  it('normalizes owner email addresses', () => {
    expect(ownerEmailSchema.parse(' Owner@Example.COM ')).toBe(
      'owner@example.com',
    );
  });

  it('requires a 14 to 128 character, non-common password', () => {
    expect(ownerPasswordSchema.safeParse('short-pass12').success).toBe(false);
    expect(ownerPasswordSchema.safeParse('x'.repeat(129)).success).toBe(false);
    expect(ownerPasswordSchema.safeParse('passwordpassword').success).toBe(
      false,
    );
    expect(
      ownerPasswordSchema.safeParse('Correct-Horse-Battery-Staple-92!').success,
    ).toBe(true);
  });

  it('accepts an email and any non-empty password for login submission', () => {
    expect(
      loginSchema.parse({
        email: 'OWNER@example.com',
        password: 'submitted-password',
      }),
    ).toEqual({ email: 'owner@example.com', password: 'submitted-password' });
  });

  it('accepts exactly six numeric TOTP digits', () => {
    expect(totpSchema.safeParse({ code: '012345' }).success).toBe(true);
    expect(totpSchema.safeParse({ code: '12345' }).success).toBe(false);
    expect(totpSchema.safeParse({ code: 'abcdef' }).success).toBe(false);
  });
});
