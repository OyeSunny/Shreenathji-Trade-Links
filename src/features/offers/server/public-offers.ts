import {
  MediaKind,
  MediaRightsStatus,
  Prisma,
  PublicationStatus,
} from '@/generated/prisma/client';
import { db } from '@/lib/db';
import 'server-only';

const publicImageWhere = {
  media: {
    is: {
      kind: MediaKind.IMAGE,
      rightsStatus: MediaRightsStatus.APPROVED,
      status: PublicationStatus.PUBLISHED,
    },
  },
} satisfies Prisma.ProductMediaWhereInput;

const publishedOfferWhere = (now: Date): Prisma.OfferWhereInput => ({
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
});

const offerInclude = {
  product: {
    include: {
      category: { select: { name: true } },
      media: {
        where: publicImageWhere,
        orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        include: {
          media: {
            select: { altText: true, sourceUrl: true, storageKey: true },
          },
        },
      },
    },
  },
} satisfies Prisma.OfferInclude;

export const getPublishedOffers = (now = new Date()) =>
  db.offer.findMany({
    where: publishedOfferWhere(now),
    include: offerInclude,
    orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }, { title: 'asc' }],
  });

export const getPublishedOfferBySlug = (slug: string, now = new Date()) =>
  db.offer.findFirst({
    where: { ...publishedOfferWhere(now), slug },
    include: offerInclude,
  });
