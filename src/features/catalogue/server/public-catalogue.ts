import {
  MediaKind,
  MediaProcessingStatus,
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

export const publicProductMediaWhere = {
  OR: [
    {
      media: {
        is: {
          kind: MediaKind.IMAGE,
          rightsStatus: MediaRightsStatus.APPROVED,
          status: PublicationStatus.PUBLISHED,
        },
      },
    },
    {
      media: {
        is: {
          kind: MediaKind.VIDEO,
          rightsStatus: MediaRightsStatus.APPROVED,
          status: PublicationStatus.PUBLISHED,
          processingStatus: MediaProcessingStatus.READY,
          sourceUrl: { not: null },
          posterUrl: { not: null },
        },
      },
    },
  ],
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
      media: {
        where: publicProductMediaWhere,
        orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        include: {
          media: {
            select: {
              altText: true,
              kind: true,
              posterUrl: true,
              processingStatus: true,
              rightsStatus: true,
              sourceUrl: true,
              status: true,
              storageKey: true,
            },
          },
        },
      },
      specifications: {
        orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
      },
    },
  });
}

type PublicProductMediaInput = {
  altText: string | null;
  caption: string | null;
  media: {
    kind: MediaKind;
    altText?: string | null;
    processingStatus: MediaProcessingStatus | null;
    rightsStatus: MediaRightsStatus;
    sourceUrl: string | null;
    posterUrl: string | null;
    status: PublicationStatus;
    storageKey: string | null;
  };
};

export type PublicProductMedia =
  | {
      kind: 'IMAGE';
      src: string;
      altText: string | null;
      caption: string | null;
    }
  | {
      kind: 'VIDEO';
      src: string;
      posterUrl: string;
      altText: string | null;
      caption: string | null;
    };

export function toPublicProductMedia(
  productMedia: PublicProductMediaInput,
): PublicProductMedia | null {
  const { media } = productMedia;
  const src = getPublicImageUrl(media);

  if (
    media.kind === MediaKind.IMAGE &&
    media.rightsStatus === MediaRightsStatus.APPROVED &&
    media.status === PublicationStatus.PUBLISHED &&
    src
  ) {
    return {
      kind: 'IMAGE',
      src,
      altText: productMedia.altText ?? media.altText ?? null,
      caption: productMedia.caption,
    };
  }

  const posterUrl = getPublicImageUrl({
    sourceUrl: media.posterUrl,
    storageKey: null,
  });

  if (
    media.kind === MediaKind.VIDEO &&
    media.processingStatus === MediaProcessingStatus.READY &&
    media.rightsStatus === MediaRightsStatus.APPROVED &&
    media.status === PublicationStatus.PUBLISHED &&
    src &&
    posterUrl
  ) {
    return {
      kind: 'VIDEO',
      src,
      posterUrl,
      altText: productMedia.altText ?? media.altText ?? null,
      caption: productMedia.caption,
    };
  }

  return null;
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
