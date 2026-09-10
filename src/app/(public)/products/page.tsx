import Link from 'next/link';
import Container from 'react-bootstrap/Container';

import { ManagedImage } from '@/components/media/managed-image';
import { formatPublicProductPrice } from '@/features/catalogue/product-price';
import {
  getPublicImageUrl,
  getPublishedProducts,
} from '@/features/catalogue/server/public-catalogue';

import styles from './products.module.css';

export default async function ProductsPage() {
  const products = await getPublishedProducts();

  return (
    <main>
      <section className={`${styles.catalogueHero} py-5 py-lg-6`}>
        <Container>
          <p className={styles.catalogueKicker}>
            Industrial materials catalogue
          </p>
          <h1 className={styles.catalogueTitle}>Source with clarity.</h1>
          <p className={styles.catalogueLede}>
            Browse the materials currently offered by Shreenathji Trade Links.
            Send us your grade, quantity, and destination requirements for a
            considered quote.
          </p>
        </Container>
      </section>

      <section
        aria-labelledby="product-list-heading"
        className={`${styles.catalogueList} py-5 py-lg-6`}
      >
        <Container>
          <div className="align-items-sm-end d-flex flex-column flex-sm-row gap-2 gap-sm-4 justify-content-between mb-4 mb-lg-5">
            <div>
              <p className="section-label mb-2">Available to enquire</p>
              <h2 id="product-list-heading" className="mb-0">
                Materials for industry.
              </h2>
            </div>
            {products.length > 0 ? (
              <p className="mb-0 text-secondary text-nowrap">
                {products.length}{' '}
                {products.length === 1 ? 'material' : 'materials'}
              </p>
            ) : null}
          </div>

          {products.length === 0 ? (
            <div className={styles.emptyState}>
              <p className="section-label mb-2">Catalogue updating</p>
              <h2>Materials will be listed here shortly.</h2>
              <p className="mb-4 text-secondary">
                If you have a sourcing requirement now, send us the material
                details and we will respond directly.
              </p>
              <Link className="btn btn-primary" href="/request-a-quote">
                Request a quote <span aria-hidden="true">↗</span>
              </Link>
            </div>
          ) : (
            <div className={styles.productGrid}>
              {products.map((product) => {
                const image = product.media[0];
                const imageUrl = getPublicImageUrl(image?.media ?? null);
                const publicPrice = formatPublicProductPrice(product);

                return (
                  <div className={styles.productGridItem} key={product.id}>
                    <Link
                      aria-label={`View ${product.name}`}
                      className={styles.productCard}
                      href={`/products/${product.slug}`}
                    >
                      {imageUrl ? (
                        <span className={styles.productMedia}>
                          <ManagedImage
                            alt={
                              image?.altText ??
                              image.media.altText ??
                              product.name
                            }
                            className={styles.productImage}
                            sizes="(max-width: 575px) 100vw, (max-width: 991px) 50vw, 33vw"
                            src={imageUrl}
                          />
                          <span aria-hidden="true" className={styles.watermark}>
                            Shreenathji Trade Links
                          </span>
                        </span>
                      ) : (
                        <span
                          aria-label={`${product.name} image pending`}
                          className={styles.productImagePlaceholder}
                          role="img"
                        >
                          STL
                        </span>
                      )}
                      <span className={styles.productCardBody}>
                        <span className={styles.categoryLine}>
                          {product.category.name}
                        </span>
                        <span className={styles.productName}>
                          {product.name}
                        </span>
                        <span className={styles.productSummary}>
                          {product.summary}
                        </span>
                        <span className={styles.productPrice}>
                          <span className={styles.productPriceLabel}>
                            {publicPrice ? 'Indicative price' : 'Pricing'}
                          </span>
                          <span className={styles.productPriceValue}>
                            {publicPrice ?? 'Price on request'}
                          </span>
                        </span>
                        <span className={styles.cardArrow}>
                          View material <span aria-hidden="true">→</span>
                        </span>
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
