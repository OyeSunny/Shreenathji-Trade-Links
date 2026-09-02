import styles from './demo-review-preview.module.css';

const demoReviews = [
  {
    focus: 'Specification first',
    index: '01',
    quote:
      'The enquiry summary made it easy to compare grade, quantity, and delivery requirements before a call.',
  },
  {
    focus: 'Dispatch detail',
    index: '02',
    quote:
      'The preview shows how packing and dispatch details can be kept clear while the requirement is being confirmed.',
  },
  {
    focus: 'Export context',
    index: '03',
    quote:
      'The example reflects the kind of destination and documentation detail an international enquiry may need.',
  },
] as const;

/**
 * A deliberately labelled placeholder for the future owner-managed reviews
 * area. It must be replaced with approved customer feedback before launch.
 */
export function DemoReviewPreview() {
  return (
    <section
      aria-labelledby="demo-review-preview-heading"
      className={styles.section}
    >
      <div className={styles.heading}>
        <div>
          <p className={styles.kicker}>Buyer feedback layout</p>
          <h2 id="demo-review-preview-heading">Buyer feedback examples</h2>
        </div>
        <p className={styles.notice}>
          Demo content — replace before publishing
        </p>
      </div>

      <div className={styles.grid}>
        {demoReviews.map((review) => (
          <article className={styles.card} key={review.index}>
            <div className={styles.cardTopline}>
              <span aria-hidden="true" className={styles.index}>
                {review.index}
              </span>
              <span className={styles.notice}>
                Demo content — replace before publishing
              </span>
            </div>
            <blockquote className={styles.quote}>
              <p>“{review.quote}”</p>
            </blockquote>
            <p className={styles.focus}>{review.focus}</p>
            <p className={styles.context}>Illustrative procurement feedback</p>
          </article>
        ))}
      </div>
    </section>
  );
}
