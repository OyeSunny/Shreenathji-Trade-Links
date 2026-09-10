import sharp from 'sharp';

type ImageDimensions = { height: number; width: number };

export const createProductImageWatermark = ({
  height,
  width,
}: ImageDimensions) => {
  const fontSize = Math.max(18, Math.round(Math.min(height, width) * 0.032));
  const padding = Math.max(18, Math.round(fontSize * 0.85));
  const label = 'SHREENATHJI TRADE LINKS';
  const labelWidth = Math.round(label.length * fontSize * 0.62);
  const labelHeight = Math.round(fontSize * 1.9);
  const x = Math.max(0, width - labelWidth - padding * 2);
  const y = Math.max(0, height - labelHeight - padding);

  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect x="${x}" y="${y}" width="${labelWidth + padding * 2}" height="${labelHeight}" fill="#111315" opacity="0.18" />
      <text x="${x + padding}" y="${y + Math.round(labelHeight * 0.64)}" fill="#ffffff" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="700" letter-spacing="${Math.max(1, Math.round(fontSize * 0.07))}" opacity="0.42">${label}</text>
    </svg>
  `);
};

export async function watermarkProductImage(buffer: Buffer) {
  const normalized = await sharp(buffer, {
    failOn: 'error',
    limitInputPixels: 64_000_000,
  })
    .rotate()
    .toBuffer();
  const image = sharp(normalized, {
    failOn: 'error',
    limitInputPixels: 64_000_000,
  });
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('IMAGE_DIMENSIONS_UNAVAILABLE');
  }

  return image
    .composite([
      {
        input: createProductImageWatermark({
          height: metadata.height,
          width: metadata.width,
        }),
      },
    ])
    .webp({ effort: 4, quality: 78 })
    .toBuffer();
}
