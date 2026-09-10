import { readFile, readdir } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';

import { storeLocalProductImage } from '@/features/catalogue/server/local-image-upload';
import {
  MediaRightsStatus,
  MediaSource,
  PriceVisibility,
  ProductAvailability,
  PublicationStatus,
} from '@/generated/prisma/client';
import { db } from '@/lib/db';

const materialsDirectory = process.env.STL_MATERIALS_DIRECTORY;

if (!materialsDirectory) {
  throw new Error('Set STL_MATERIALS_DIRECTORY before running this import.');
}

const imports = [
  {
    folder: 'Anode Carbon Block \nPuarity  98',
    name: 'Anode Carbon Block – Purity 98',
    slug: 'anode-carbon-block',
    category: 'Carbon materials',
    categorySlug: 'carbon-materials',
    caption: 'Anode Carbon Block · Purity 98',
    summary:
      'Anode carbon blocks for industrial and metallurgical requirements.',
    grade: 'Purity 98',
    form: 'Block',
  },
  {
    folder: 'Iron ore fine \nBlue dust\nFe 63',
    name: 'Iron Ore Fine – Blue Dust – Fe 63',
    slug: 'iron-ore-fine-blue-dust-fe-63',
    category: 'Iron & mill scale',
    categorySlug: 'iron-mill-scale',
    caption: 'Iron Ore Fine · Blue Dust · Fe 63',
    summary: 'Blue dust iron ore fines for bulk industrial sourcing enquiries.',
    grade: 'Fe 63',
    form: 'Blue dust',
  },
  {
    folder: 'Iron ore fines\nSize o to 10\nFe 53 to 55',
    name: 'Iron Ore Fines – Size 0–10 – Fe 53–55',
    slug: 'iron-ore-fines-size-0-to-10-fe-53-to-55',
    category: 'Iron & mill scale',
    categorySlug: 'iron-mill-scale',
    caption: 'Iron Ore Fines · Size 0–10 · Fe 53–55',
    summary:
      'Iron ore fines sized 0–10 for bulk industrial sourcing enquiries.',
    grade: 'Fe 53–55',
    form: 'Fines, size 0–10',
  },
  {
    folder: 'Iron ore',
    name: 'Iron Ore',
    slug: 'iron-ore',
    category: 'Iron & mill scale',
    categorySlug: 'iron-mill-scale',
    caption: 'Iron Ore',
    summary: 'Iron ore for bulk industrial sourcing enquiries.',
    grade: 'As per buyer requirement',
    form: 'Ore',
  },
  {
    folder: 'Mill scale \nFe 68+++',
    name: 'Mill Scale – Fe 68+++',
    slug: 'mill-scale-fe-68',
    category: 'Iron & mill scale',
    categorySlug: 'iron-mill-scale',
    caption: 'Mill Scale · Fe 68+++',
    summary: 'Mill scale Fe 68+++ for industrial material requirements.',
    grade: 'Fe 68+++',
    form: 'Mill scale',
  },
  {
    folder: 'Mill scale \nFe 69+++',
    name: 'Mill Scale – Fe 69+++',
    slug: 'mill-scale-fe-69',
    category: 'Iron & mill scale',
    categorySlug: 'iron-mill-scale',
    caption: 'Mill Scale · Fe 69+++',
    summary: 'Mill scale Fe 69+++ for industrial material requirements.',
    grade: 'Fe 69+++',
    form: 'Mill scale',
  },
  {
    folder: 'Iron ore Fine \nFe 55 to 57',
    name: 'Iron Ore Fine – Fe 55–57',
    slug: 'iron-ore-fine-fe-55-to-57',
    category: 'Iron & mill scale',
    categorySlug: 'iron-mill-scale',
    caption: 'Iron Ore Fine · Fe 55–57',
    summary: 'Iron ore fines Fe 55–57 for bulk industrial sourcing enquiries.',
    grade: 'Fe 55–57',
    form: 'Fines',
  },
] as const;

const importPrefix = 'desktop-materials-2026-09-11';

async function importMaterials(directory: string) {
  const result = {
    createdProducts: 0,
    importedImages: 0,
    movedImages: 0,
    skippedImages: 0,
  };

  for (const entry of imports) {
    const category = await db.productCategory.upsert({
      where: { slug: entry.categorySlug },
      create: {
        name: entry.category,
        slug: entry.categorySlug,
        status: PublicationStatus.PUBLISHED,
      },
      update: { name: entry.category, status: PublicationStatus.PUBLISHED },
    });
    const existing = await db.product.findUnique({
      where: { slug: entry.slug },
      select: { id: true },
    });
    const product = existing
      ? await db.product.update({
          where: { id: existing.id },
          data: {
            categoryId: category.id,
            name: entry.name,
            summary: entry.summary,
            grade: entry.grade,
            form: entry.form,
            status: PublicationStatus.PUBLISHED,
          },
        })
      : await db.product.create({
          data: {
            categoryId: category.id,
            name: entry.name,
            slug: entry.slug,
            summary: entry.summary,
            description:
              'Share the required grade, quantity, destination, and delivery timeline for a direct supply discussion.',
            grade: entry.grade,
            form: entry.form,
            applications: ['Industrial sourcing'],
            packaging: 'Bulk / as agreed',
            priceVisibility: PriceVisibility.ASK_FOR_PRICE,
            availability: ProductAvailability.AVAILABLE_ON_REQUEST,
            status: PublicationStatus.PUBLISHED,
            publishedAt: new Date(),
            specifications: {
              create: [
                { label: 'Material', value: entry.name, sortOrder: 0 },
                { label: 'Grade', value: entry.grade, sortOrder: 1 },
              ],
            },
          },
        });

    if (!existing) result.createdProducts += 1;

    const files = (
      await readdir(join(directory, entry.folder), {
        withFileTypes: true,
      })
    )
      .filter((file) => file.isFile())
      .sort((left, right) => left.name.localeCompare(right.name));

    for (const [index, file] of files.entries()) {
      const sourceReferenceUrl = `${importPrefix}/${entry.folder}/${file.name}`;
      const alreadyImported = await db.mediaAsset.findFirst({
        where: { sourceReferenceUrl },
        select: { id: true },
      });

      if (alreadyImported) {
        const association = await db.productMedia.findFirst({
          where: { mediaId: alreadyImported.id },
          select: { productId: true },
        });
        if (association?.productId !== product.id) {
          await db.$transaction(async (transaction) => {
            const highestSortOrder = await transaction.productMedia.aggregate({
              where: { productId: product.id },
              _max: { sortOrder: true },
            });
            const hasPrimaryImage = await transaction.productMedia.findFirst({
              where: { productId: product.id, isPrimary: true },
              select: { mediaId: true },
            });
            if (association) {
              await transaction.productMedia.delete({
                where: {
                  productId_mediaId: {
                    productId: association.productId,
                    mediaId: alreadyImported.id,
                  },
                },
              });
            }
            await transaction.productMedia.create({
              data: {
                productId: product.id,
                mediaId: alreadyImported.id,
                sortOrder: (highestSortOrder._max.sortOrder ?? -1) + 1,
                isPrimary: !hasPrimaryImage,
                altText: `${entry.caption} product photograph`,
                caption: entry.caption,
              },
            });
          });
          result.movedImages += 1;
          continue;
        }
        result.skippedImages += 1;
        continue;
      }

      const sourcePath = join(directory, entry.folder, file.name);
      const fileName = basename(file.name);
      const displayName = extname(fileName)
        ? fileName
        : `${entry.caption.replaceAll('·', '-').replaceAll(' ', '-')}-${index + 1}.jpg`;
      const image = new File([await readFile(sourcePath)], displayName, {
        type: 'image/jpeg',
      });
      const upload = await storeLocalProductImage(image);

      await db.$transaction(async (transaction) => {
        const highestSortOrder = await transaction.productMedia.aggregate({
          where: { productId: product.id },
          _max: { sortOrder: true },
        });
        const hasPrimaryImage = await transaction.productMedia.findFirst({
          where: { productId: product.id, isPrimary: true },
          select: { mediaId: true },
        });
        const media = await transaction.mediaAsset.create({
          data: {
            kind: 'IMAGE',
            storageKey: upload.storageKey,
            sourceUrl: upload.publicUrl,
            fileName: upload.fileName,
            mimeType: upload.mimeType,
            altText: `${entry.caption} product photograph`,
            source: MediaSource.PROJECT_CREATED,
            sourceName: 'Client materials folder import',
            sourceReferenceUrl,
            rightsStatus: MediaRightsStatus.APPROVED,
            status: PublicationStatus.PUBLISHED,
          },
        });
        await transaction.productMedia.create({
          data: {
            productId: product.id,
            mediaId: media.id,
            sortOrder: (highestSortOrder._max.sortOrder ?? -1) + 1,
            isPrimary: !hasPrimaryImage,
            altText: `${entry.caption} product photograph`,
            caption: entry.caption,
          },
        });
      });

      result.importedImages += 1;
    }
  }

  console.log(JSON.stringify(result));
}

void importMaterials(materialsDirectory)
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
