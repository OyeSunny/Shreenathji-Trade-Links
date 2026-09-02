import { db } from '@/lib/db';

const databaseTestsEnabled = process.env.RUN_DATABASE_TESTS === '1';

async function clearCatalogueData() {
  await db.enquiryItem.deleteMany();
  await db.enquiry.deleteMany();
  await db.customerReview.deleteMany();
  await db.productMedia.deleteMany();
  await db.productSpecification.deleteMany();
  await db.product.deleteMany();
  await db.mediaAsset.deleteMany();
  await db.productCategory.deleteMany();
  await db.siteSetting.deleteMany();
}

describe.skipIf(!databaseTestsEnabled)('catalogue data model', () => {
  beforeEach(async () => {
    await clearCatalogueData();
  });

  afterEach(async () => {
    await clearCatalogueData();
  });

  it('persists a publishable product, its licensed media, and an export enquiry', async () => {
    const category = await db.productCategory.create({
      data: {
        name: 'Iron Ore',
        slug: 'iron-ore',
        status: 'PUBLISHED',
      },
    });
    const media = await db.mediaAsset.create({
      data: {
        kind: 'IMAGE',
        fileName: 'iron-ore-fines.jpg',
        mimeType: 'image/jpeg',
        altText: 'Iron ore fines ready for bulk dispatch',
        source: 'CLIENT_INDIA_MART',
        sourceName: 'Shreenathji Trade Links IndiaMART profile',
        rightsStatus: 'APPROVED',
        status: 'PUBLISHED',
      },
    });
    const product = await db.product.create({
      data: {
        categoryId: category.id,
        name: 'Iron Ore Fines',
        slug: 'iron-ore-fines',
        summary: 'Industrial-grade iron ore fines for bulk buyers.',
        applications: ['Steel making'],
        minimumOrderQty: '25.000',
        orderUnit: 'MT',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        specifications: {
          create: { label: 'Fe content', value: '60', unit: '%' },
        },
        media: {
          create: {
            mediaId: media.id,
            isPrimary: true,
            altText: 'Iron ore fines ready for bulk dispatch',
          },
        },
      },
      include: { category: true, media: { include: { media: true } } },
    });
    const enquiry = await db.enquiry.create({
      data: {
        type: 'EXPORT',
        contactName: 'Aisha Khan',
        companyName: 'Global Metals FZE',
        email: 'buyer@example.com',
        countryCode: 'AE',
        destinationCountry: 'United Arab Emirates',
        destinationPort: 'Jebel Ali',
        incoterm: 'FOB',
        items: {
          create: {
            productId: product.id,
            quantity: '100.000',
            unit: 'MT',
          },
        },
      },
      include: { items: true },
    });

    await db.customerReview.create({
      data: {
        reviewerName: 'Aisha Khan',
        companyName: 'Global Metals FZE',
        productId: product.id,
        rating: 5,
        comment: 'Clear communication and dependable bulk supply.',
        status: 'PUBLISHED',
      },
    });
    await db.siteSetting.create({
      data: { key: 'business.contact', value: { whatsapp: '+91XXXXXXXXXX' } },
    });

    expect(product.category.slug).toBe('iron-ore');
    expect(product.media[0]?.media.rightsStatus).toBe('APPROVED');
    expect(enquiry.items).toHaveLength(1);
    expect(enquiry.items[0]?.productId).toBe(product.id);
    await expect(
      db.customerReview.count({ where: { productId: product.id, rating: 5 } }),
    ).resolves.toBe(1);
  });
});
