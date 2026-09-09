type ProductPrice = {
  currency: string | null;
  indicativePrice: { toString(): string } | string | null;
  priceUnit: string | null;
  priceVisibility: 'ASK_FOR_PRICE' | 'INDICATIVE_PRICE';
};

export function formatPublicProductPrice(product: ProductPrice) {
  if (
    product.priceVisibility !== 'INDICATIVE_PRICE' ||
    !product.indicativePrice ||
    !product.currency ||
    !product.priceUnit
  ) {
    return null;
  }

  const numericPrice = Number(product.indicativePrice.toString());

  if (!Number.isFinite(numericPrice)) return null;

  try {
    return `${new Intl.NumberFormat('en-IN', {
      currency: product.currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      style: 'currency',
    }).format(numericPrice)} / ${product.priceUnit}`;
  } catch {
    return `${product.currency} ${numericPrice.toFixed(2)} / ${product.priceUnit}`;
  }
}
