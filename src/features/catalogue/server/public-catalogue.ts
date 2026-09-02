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

const productCardInclude = {
  category: {
    select: {
      name: true,
      slug: true,
    },
  },
  media: {
    where: publicImageWhere,
    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
    include: {
      media: {
        select: {
          altText: true,
          sourceUrl: true,
          storageKey: true,
        },
      },
    },
  },
} satisfies Prisma.ProductInclude;

export async function getPublishedProducts() {
  return db.product.findMany({
    where: {
      status: PublicationStatus.PUBLISHED,
      category: { is: { status: PublicationStatus.PUBLISHED } },
    },
    orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }, { name: 'asc' }],
    include: productCardInclude,
  });
}

export async function getPublishedProductBySlug(slug: string) {
  return db.product.findFirst({
    where: {
      slug,
      status: PublicationStatus.PUBLISHED,
      category: { is: { status: PublicationStatus.PUBLISHED } },
    },
    include: {
      ...productCardInclude,
      specifications: {
        orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
      },
    },
  });
}

/**
 * A media record can be public only after the admin has supplied a public
 * URL. Object storage keys are deliberately not guessed into URLs here.
 */
export function getPublicImageUrl(
  image: { sourceUrl: string | null; storageKey: string | null } | null,
) {
  if (!image?.sourceUrl) return null;

  try {
    const url = new URL(image.sourceUrl);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? image.sourceUrl
      : null;
  } catch {
    return image.sourceUrl.startsWith('/') ? image.sourceUrl : null;
  }
}
