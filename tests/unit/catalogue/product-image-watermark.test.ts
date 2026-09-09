import {
  createProductImageWatermark,
  watermarkProductImage,
} from '@/features/catalogue/server/product-image-watermark';
import sharp from 'sharp';

describe('createProductImageWatermark', () => {
  it('creates a subtle Shreenathji Trade Links mark sized for the uploaded product image', () => {
    const watermark = createProductImageWatermark({
      height: 1200,
      width: 1600,
    });
    const markup = watermark.toString('utf8');

    expect(markup).toContain('SHREENATHJI TRADE LINKS');
    expect(markup).toContain('opacity="0.42"');
    expect(markup).toContain('font-size="38"');
    expect(markup).toContain('width="1600"');
    expect(markup).toContain('height="1200"');
  });

  it('writes the watermark into the exported product image without changing its dimensions', async () => {
    const original = await sharp({
      create: {
        background: '#45515b',
        channels: 3,
        height: 120,
        width: 160,
      },
    })
      .png()
      .toBuffer();

    const watermarked = await watermarkProductImage(original);
    const metadata = await sharp(watermarked).metadata();

    expect(metadata).toMatchObject({ height: 120, width: 160 });
    expect(watermarked.equals(original)).toBe(false);
  });
});
