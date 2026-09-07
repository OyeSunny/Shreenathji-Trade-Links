import { contactCaptureSchema } from '@/features/leads/contact-capture-input';

describe('contact capture input', () => {
  it('normalizes a consented buyer contact without exposing extra fields', () => {
    expect(
      contactCaptureSchema.parse({
        email: 'BUYER@EXAMPLE.COM ',
        phone: ' +91 98765 43210 ',
        consent: true,
        website: '',
      }),
    ).toEqual({
      email: 'buyer@example.com',
      phone: '+91 98765 43210',
      consent: true,
      website: '',
    });
  });

  it('requires affirmative consent and rejects oversized contact details', () => {
    expect(() =>
      contactCaptureSchema.parse({
        email: 'buyer@example.com',
        consent: false,
      }),
    ).toThrow();

    expect(() =>
      contactCaptureSchema.parse({
        email: 'buyer@example.com',
        phone: '1'.repeat(41),
        consent: true,
      }),
    ).toThrow();
  });
});
