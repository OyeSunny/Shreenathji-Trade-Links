import { describe, expect, it } from 'vitest';

import { getPublicImageUrl } from '@/features/catalogue/server/public-catalogue';

describe('getPublicImageUrl', () => {
  it('returns only browser-safe public image URLs', () => {
    expect(
      getPublicImageUrl({
        sourceUrl: 'https://images.example.com/mill-scale.jpg',
        storageKey: 'private/mill-scale.jpg',
      }),
    ).toBe('https://images.example.com/mill-scale.jpg');
    expect(
      getPublicImageUrl({
        sourceUrl: '/media/mill-scale.jpg',
        storageKey: null,
      }),
    ).toBe('/media/mill-scale.jpg');
  });

  it('does not turn a storage key or unsafe URL into a public image', () => {
    expect(
      getPublicImageUrl({ sourceUrl: null, storageKey: 'private/a.jpg' }),
    ).toBeNull();
    expect(
      getPublicImageUrl({ sourceUrl: 'javascript:alert(1)', storageKey: null }),
    ).toBeNull();
  });
});
