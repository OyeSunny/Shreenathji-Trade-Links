import { vi } from 'vitest';

const contactLeadRateLimit = vi.hoisted(() => ({ upsert: vi.fn() }));
const contactLead = vi.hoisted(() => ({ upsert: vi.fn() }));
const transaction = vi.hoisted(() => ({ contactLeadRateLimit, contactLead }));
const db = vi.hoisted(() => ({
  $transaction: vi.fn((callback) => callback(transaction)),
}));

vi.mock('@/lib/db', () => ({ db }));
vi.mock('@/lib/env', () => ({
  env: { BETTER_AUTH_SECRET: 'a-local-test-secret-that-is-long-enough' },
}));

import {
  ContactLeadRateLimitError,
  submitContactLead,
} from '@/features/leads/server/submit-contact-lead';

const input = {
  email: 'buyer@example.com',
  phone: '+91 98765 43210',
  consent: true as const,
  website: '',
};

describe('submitContactLead', () => {
  beforeEach(() => {
    contactLeadRateLimit.upsert.mockReset();
    contactLead.upsert.mockReset();
    db.$transaction.mockClear();
    contactLeadRateLimit.upsert.mockResolvedValue({ attempts: 1 });
    contactLead.upsert.mockResolvedValue({ id: 'lead-id' });
  });

  it('records explicit consent and gives the same result for a prior contact', async () => {
    const now = new Date('2026-09-05T12:00:00.000Z');

    await expect(
      submitContactLead({
        input,
        headers: new Headers({ 'x-real-ip': '203.0.113.5' }),
        now,
      }),
    ).resolves.toEqual({ accepted: true, isSpam: false });

    expect(contactLead.upsert).toHaveBeenCalledWith({
      where: { email: 'buyer@example.com' },
      create: expect.objectContaining({
        email: 'buyer@example.com',
        phone: '+91 98765 43210',
        consentedAt: now,
      }),
      update: expect.objectContaining({ consentedAt: now }),
    });
  });

  it('does not write a lead after the rate limit is exceeded', async () => {
    contactLeadRateLimit.upsert.mockResolvedValue({ attempts: 4 });

    await expect(
      submitContactLead({ input, headers: new Headers() }),
    ).rejects.toBeInstanceOf(ContactLeadRateLimitError);

    expect(contactLead.upsert).not.toHaveBeenCalled();
  });
});
