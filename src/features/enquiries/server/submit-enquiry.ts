import { notifyNewEnquiry } from '@/features/notifications/contact-notifications';
import { PublicationStatus } from '@/generated/prisma/client';
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

  const result = await db.$transaction(async (transaction) => {
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

    const [product, offer] = await Promise.all([
      input.productSlug
        ? transaction.product.findFirst({
            where: {
              slug: input.productSlug,
              status: PublicationStatus.PUBLISHED,
              category: { is: { status: PublicationStatus.PUBLISHED } },
            },
            select: { id: true },
          })
        : null,
      input.offerSlug
        ? transaction.offer.findFirst({
            where: {
              slug: input.offerSlug,
              status: PublicationStatus.PUBLISHED,
              AND: [
                { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
                { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
              ],
              product: {
                is: {
                  status: PublicationStatus.PUBLISHED,
                  category: { is: { status: PublicationStatus.PUBLISHED } },
                },
              },
            },
            select: { id: true, productId: true },
          })
        : null,
    ]);

    // Never allow a forged product parameter to change the product attached
    // to an offer. The database relation is the source of truth.
    const productId = offer?.productId ?? product?.id;
    const shouldCreateItem = Boolean(productId || input.quantity);

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
        items: shouldCreateItem
          ? {
              create: {
                productId,
                offerId: offer?.id,
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

  try {
    await notifyNewEnquiry({
      companyName: input.companyName,
      contactName: input.contactName,
      email: input.email,
      materialRequest: input.materialRequest,
      phone: input.whatsapp ?? input.phone,
      type: input.type,
    });
  } catch {
    // The saved enquiry stays available in Admin → Enquiries even if SMTP is
    // temporarily unavailable, so a buyer is never asked to submit again.
    console.error('Unable to send owner notification for a saved enquiry.');
  }

  return result;
};
