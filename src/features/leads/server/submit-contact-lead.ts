import { notifyNewContactLead } from '@/features/notifications/contact-notifications';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { createHmac } from 'node:crypto';
import 'server-only';

import type { ContactCaptureInput } from '../contact-capture-input';

const limitWindowMs = 15 * 60 * 1000;
const maximumAttemptsPerWindow = 3;

export class ContactLeadRateLimitError extends Error {
  constructor() {
    super('CONTACT_LEAD_RATE_LIMITED');
  }
}

const getWindowStart = (now: Date) =>
  new Date(Math.floor(now.getTime() / limitWindowMs) * limitWindowMs);

const getRequesterAddress = (headers: Headers) => {
  const forwardedFor = headers.get('x-forwarded-for');

  if (forwardedFor) {
    return forwardedFor.split(',', 1)[0]?.trim().slice(0, 128) || 'unknown';
  }

  return headers.get('x-real-ip')?.trim().slice(0, 128) || 'unknown';
};

const hashRateLimitIdentifier = (email: string, headers: Headers) =>
  createHmac('sha256', env.BETTER_AUTH_SECRET)
    .update(`${email}|${getRequesterAddress(headers)}`)
    .digest('hex');

export const submitContactLead = async ({
  input,
  headers,
  now = new Date(),
}: {
  input: ContactCaptureInput;
  headers: Headers;
  now?: Date;
}) => {
  if (input.website) {
    return { accepted: true, isSpam: true } as const;
  }

  const bucketStart = getWindowStart(now);
  const identifierHash = hashRateLimitIdentifier(input.email, headers);

  const result = await db.$transaction(async (transaction) => {
    const rateLimit = await transaction.contactLeadRateLimit.upsert({
      where: {
        identifierHash_bucketStart: { identifierHash, bucketStart },
      },
      create: { identifierHash, bucketStart, attempts: 1 },
      update: { attempts: { increment: 1 } },
    });

    if (rateLimit.attempts > maximumAttemptsPerWindow) {
      throw new ContactLeadRateLimitError();
    }

    await transaction.contactLead.upsert({
      where: { email: input.email },
      create: {
        email: input.email,
        phone: input.phone ?? null,
        consentedAt: now,
      },
      update: {
        phone: input.phone ?? undefined,
        consentedAt: now,
      },
    });

    // Deliberately identical for new and existing contacts to prevent enumeration.
    return { accepted: true, isSpam: false } as const;
  });

  try {
    await notifyNewContactLead({ email: input.email, phone: input.phone });
  } catch {
    // The buyer's consent is already securely recorded, so delivery failures
    // must not lead the buyer to re-submit their personal contact details.
    console.error(
      'Unable to send owner notification for a saved contact lead.',
    );
  }

  return result;
};
