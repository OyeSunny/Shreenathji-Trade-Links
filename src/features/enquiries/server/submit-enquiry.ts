import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { createHmac } from 'node:crypto';
import 'server-only';
import type { EnquiryInput } from '../schemas';

const limitWindowMs = 15 * 60 * 1000;
const maximumAttemptsPerWindow = 5;

export class EnquiryRateLimitError extends Error {
  constructor() {
    super('ENQUIRY_RATE_LIMITED');
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

export const submitEnquiry = async ({
  input,
  headers,
  now = new Date(),
}: {
  input: EnquiryInput;
  headers: Headers;
  now?: Date;
}) => {
  if (input.website) {
    return { accepted: true, isSpam: true } as const;
  }

  const bucketStart = getWindowStart(now);
  const identifierHash = hashRateLimitIdentifier(input.email, headers);

  return db.$transaction(async (transaction) => {
    const rateLimit = await transaction.enquiryRateLimit.upsert({
      where: {
        identifierHash_bucketStart: { identifierHash, bucketStart },
      },
      create: { identifierHash, bucketStart, attempts: 1 },
      update: { attempts: { increment: 1 } },
    });

    if (rateLimit.attempts > maximumAttemptsPerWindow) {
      throw new EnquiryRateLimitError();
    }

    const enquiry = await transaction.enquiry.create({
      data: {
        type: input.type,
        contactName: input.contactName,
        companyName: input.companyName,
        email: input.email,
        phone: input.phone,
        whatsapp: input.whatsapp,
        countryCode: input.countryCode,
        city: input.city,
        destinationCountry: input.destinationCountry,
        destinationPort: input.destinationPort,
        incoterm: input.incoterm,
        materialRequest: input.materialRequest,
        items: input.quantity
          ? {
              create: {
                requestedMaterial: input.materialRequest,
                quantity: input.quantity,
                unit: input.unit,
              },
            }
          : undefined,
      },
      select: { id: true },
    });

    return { accepted: true, isSpam: false, enquiryId: enquiry.id } as const;
  });
};
