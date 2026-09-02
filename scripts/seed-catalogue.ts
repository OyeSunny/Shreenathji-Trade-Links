import {
  MediaKind,
  MediaRightsStatus,
  MediaSource,
  PriceVisibility,
  ProductAvailability,
  PublicationStatus,
} from '@/generated/prisma/client';
import { db } from '@/lib/db';

type StarterProduct = {
  name: string;
  slug: string;
  summary: string;
  description: string;
  grade: string;
  form: string;
  applications: string[];
  packaging: string;
  image: {
    fileName: string;
    sourceUrl: string;
    altText: string;
  };
  specifications: Array<{ label: string; value: string }>;
};

const publishDate = new Date();

const starterCategories: Array<{
  name: string;
  slug: string;
  introduction: string;
  products: StarterProduct[];
}> = [
  {
    name: 'Iron & mill scale',
    slug: 'iron-mill-scale',
    introduction: 'Bulk ferrous materials for industrial enquiries.',
    products: [
      {
        name: 'Mill Scale',
        slug: 'mill-scale',
        summary: 'Ferrous oxide scale for industrial material requirements.',
        description:
          'Share the required chemistry, particle size, quantity, and destination so the material conversation can be assessed directly.',
        grade: 'As per buyer requirement',
        form: 'Fines / scale',
        applications: ['Steelmaking', 'Sintering', 'Industrial processing'],
        packaging: 'Bulk / as agreed',
        image: {
          fileName: 'product-mill-scale.png',
          sourceUrl: '/media/product-mill-scale.png',
          altText:
            'Mill scale shown as a dark ferrous material sample for industrial supply',
        },
        specifications: [
          { label: 'Material', value: 'Mill scale' },
          { label: 'Supply basis', value: 'Buyer specification' },
        ],
      },
      {
        name: 'Iron Ore Fines',
        slug: 'iron-ore-fines',
        summary: 'Iron ore fines for bulk industrial sourcing enquiries.',
        description:
          'Provide the requested grade, physical form, volume, and delivery point for a practical sourcing conversation.',
        grade: 'As per buyer requirement',
        form: 'Fines',
        applications: ['Steelmaking', 'Sintering', 'Industrial processing'],
        packaging: 'Bulk / as agreed',
        image: {
          fileName: 'product-iron-ore-fines.png',
          sourceUrl: '/media/product-iron-ore-fines.png',
          altText: 'Iron ore fines prepared for bulk industrial supply',
        },
        specifications: [
          { label: 'Material', value: 'Iron ore fines' },
          { label: 'Supply basis', value: 'Buyer specification' },
        ],
      },
    ],
  },
  {
    name: 'Carbon materials',
    slug: 'carbon-materials',
    introduction: 'Carbon materials for industrial processes and bulk supply.',
    products: [
      {
        name: 'Carbon Blocks',
        slug: 'carbon-blocks',
        summary: 'Carbon blocks for industrial material requirements.',
        description:
          'Send the required dimensions, grade, quantity, and destination for a direct buyer enquiry.',
        grade: 'As per buyer requirement',
        form: 'Blocks',
        applications: ['Industrial heating', 'Metallurgical processes'],
        packaging: 'As agreed',
        image: {
          fileName: 'product-carbon-blocks.png',
          sourceUrl: '/media/product-carbon-blocks.png',
          altText: 'Industrial carbon blocks arranged for material supply',
        },
        specifications: [
          { label: 'Material', value: 'Carbon blocks' },
          { label: 'Supply basis', value: 'Buyer specification' },
        ],
      },
      {
        name: 'Anthracite',
        slug: 'anthracite',
        summary:
          'Anthracite material for industrial and metallurgical enquiries.',
        description:
          'Specify the required grade, sizing, quantity, and delivery requirements to start the conversation.',
        grade: 'As per buyer requirement',
        form: 'Lumps / fines',
        applications: ['Metallurgical processes', 'Industrial heating'],
        packaging: 'Bulk / as agreed',
        image: {
          fileName: 'product-anthracite.png',
          sourceUrl: '/media/product-anthracite.png',
          altText: 'Anthracite lumps for industrial and metallurgical use',
        },
        specifications: [
          { label: 'Material', value: 'Anthracite' },
          { label: 'Supply basis', value: 'Buyer specification' },
        ],
      },
    ],
  },
  {
    name: 'Industrial minerals',
    slug: 'industrial-minerals',
    introduction: 'Minerals and specialist materials for buyer-led enquiries.',
    products: [
      {
        name: 'Dolomite Lumps',
        slug: 'dolomite-lumps',
        summary: 'Dolomite aggregate for industrial mineral requirements.',
        description:
          'Share the desired chemistry, sizing, volume, and destination to discuss available options.',
        grade: 'As per buyer requirement',
        form: 'Lumps / aggregate',
        applications: [
          'Steelmaking',
          'Refractory applications',
          'Industrial processing',
        ],
        packaging: 'Bulk / as agreed',
        image: {
          fileName: 'product-dolomite-lumps.png',
          sourceUrl: '/media/product-dolomite-lumps.png',
          altText: 'Dolomite lumps for refractory and industrial processing',
        },
        specifications: [
          { label: 'Material', value: 'Dolomite' },
          { label: 'Supply basis', value: 'Buyer specification' },
        ],
      },
      {
        name: 'Melamine Granules',
        slug: 'melamine-granules',
        summary: 'Melamine material for specialist industrial requirements.',
        description:
          'Send the required grade, packaging, volume, and destination for a direct supply discussion.',
        grade: 'As per buyer requirement',
        form: 'Granules',
        applications: ['Resins', 'Industrial manufacturing'],
        packaging: 'Bulk bags / as agreed',
        image: {
          fileName: 'product-melamine-granules.png',
          sourceUrl: '/media/product-melamine-granules.png',
          altText:
            'Melamine granules packaged for specialist industrial requirements',
        },
        specifications: [
          { label: 'Material', value: 'Melamine' },
          { label: 'Supply basis', value: 'Buyer specification' },
        ],
      },
    ],
  },
];

async function upsertStarterImage(product: StarterProduct) {
  return db.mediaAsset.upsert({
    where: { storageKey: `starter-catalogue/${product.image.fileName}` },
    create: {
      kind: MediaKind.IMAGE,
      storageKey: `starter-catalogue/${product.image.fileName}`,
      sourceUrl: product.image.sourceUrl,
      fileName: product.image.fileName,
      mimeType: 'image/png',
      altText: product.image.altText,
      source: MediaSource.PROJECT_CREATED,
      sourceName: 'Shreenathji Trade Links website starter imagery',
      rightsStatus: MediaRightsStatus.APPROVED,
      status: PublicationStatus.PUBLISHED,
    },
    update: {
      sourceUrl: product.image.sourceUrl,
      altText: product.image.altText,
      rightsStatus: MediaRightsStatus.APPROVED,
      status: PublicationStatus.PUBLISHED,
    },
  });
}

async function seedStarterCatalogue() {
  for (const [categoryIndex, category] of starterCategories.entries()) {
    const savedCategory = await db.productCategory.upsert({
      where: { slug: category.slug },
      create: {
        name: category.name,
        slug: category.slug,
        introduction: category.introduction,
        featured: true,
        sortOrder: categoryIndex,
        status: PublicationStatus.PUBLISHED,
      },
      update: {
        name: category.name,
        introduction: category.introduction,
        featured: true,
        sortOrder: categoryIndex,
        status: PublicationStatus.PUBLISHED,
      },
    });

    for (const product of category.products) {
      const image = await upsertStarterImage(product);
      const savedProduct = await db.product.upsert({
        where: { slug: product.slug },
        create: {
          categoryId: savedCategory.id,
          name: product.name,
          slug: product.slug,
          summary: product.summary,
          description: product.description,
          grade: product.grade,
          form: product.form,
          applications: product.applications,
          packaging: product.packaging,
          priceVisibility: PriceVisibility.ASK_FOR_PRICE,
          availability: ProductAvailability.AVAILABLE_ON_REQUEST,
          featured: true,
          status: PublicationStatus.PUBLISHED,
          publishedAt: publishDate,
        },
        update: {
          categoryId: savedCategory.id,
          name: product.name,
          summary: product.summary,
          description: product.description,
          grade: product.grade,
          form: product.form,
          applications: product.applications,
          packaging: product.packaging,
          availability: ProductAvailability.AVAILABLE_ON_REQUEST,
          featured: true,
          status: PublicationStatus.PUBLISHED,
          publishedAt: publishDate,
        },
      });

      // This starter script owns only the initial placeholder image. Re-running
      // it replaces old starter artwork instead of leaving a hero image behind
      // in the product gallery. Owner-uploaded galleries are managed in admin.
      await db.productMedia.deleteMany({
        where: { productId: savedProduct.id, mediaId: { not: image.id } },
      });

      await db.productMedia.upsert({
        where: {
          productId_mediaId: { productId: savedProduct.id, mediaId: image.id },
        },
        create: {
          productId: savedProduct.id,
          mediaId: image.id,
          isPrimary: true,
          altText: product.image.altText,
        },
        update: { isPrimary: true, altText: product.image.altText },
      });

      await db.productSpecification.deleteMany({
        where: { productId: savedProduct.id },
      });
      await db.productSpecification.createMany({
        data: product.specifications.map(
          (specification, specificationIndex) => ({
            productId: savedProduct.id,
            ...specification,
            sortOrder: specificationIndex,
          }),
        ),
      });
    }
  }

  process.stdout.write('Starter catalogue seeded.\n');
}

void seedStarterCatalogue().finally(async () => {
  await db.$disconnect();
});
