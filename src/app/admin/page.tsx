import { db } from '@/lib/db';
import Link from 'next/link';

const nextAreas = [
  {
    href: '/admin/catalogue',
    icon: 'bi-box-seam',
    key: 'products',
    label: 'Catalogue',
    text: 'Add, publish, and organise material listings.',
  },
  {
    href: '/admin/enquiries',
    icon: 'bi-inbox',
    key: 'enquiries',
    label: 'Enquiries',
    text: 'Review buyer requirements and quote requests.',
  },
  {
    href: '/admin/offers',
    icon: 'bi-tags',
    key: 'offers',
    label: 'Offers',
    text: 'Publish time-bound material opportunities.',
  },
  {
    href: '/admin/content',
    icon: 'bi-sliders',
    key: 'content',
    label: 'Website content',
    text: 'Keep company details and pages current.',
  },
  {
    href: '/admin/reviews',
    icon: 'bi-chat-square-quote',
    key: 'reviews',
    label: 'Buyer feedback',
    text: 'Publish verified buyer feedback.',
  },
  {
    href: '/admin/leads',
    icon: 'bi-person-lines-fill',
    key: 'leads',
    label: 'Contact leads',
    text: 'See buyers who opted in for updates.',
  },
] as const;

export default async function AdminDashboardPage() {
  const [products, enquiries, offers, reviews, leads] = await Promise.all([
    db.product.count(),
    db.enquiry.count({ where: { status: 'NEW' } }),
    db.offer.count({ where: { status: 'PUBLISHED' } }),
    db.customerReview.count({ where: { status: 'PUBLISHED' } }),
    db.contactLead.count(),
  ]);
  const counts = { content: 2, enquiries, leads, offers, products, reviews };

  return (
    <>
      <section className="admin-dashboard__hero">
        <div>
          <p className="admin-kicker">Command centre / 01</p>
          <h1>Keep every buyer touchpoint moving.</h1>
          <p>
            Publish stock, shape your catalogue, and follow incoming demand from
            one owner workspace.
          </p>
        </div>
        <div className="admin-dashboard__signal">
          <span>Live workspace</span>
          <strong>{enquiries}</strong>
          <small>new enquiries</small>
        </div>
      </section>
      <section
        aria-label="Website management areas"
        className="admin-dashboard__grid"
      >
        {nextAreas.map((area, index) => (
          <Link className="admin-area-card" href={area.href} key={area.href}>
            <span className="admin-area-card__number">
              {String(index + 1).padStart(2, '0')}
            </span>
            <i aria-hidden="true" className={`bi ${area.icon}`} />
            <span className="admin-area-card__count">{counts[area.key]}</span>
            <h2>{area.label}</h2>
            <p>{area.text}</p>
            <span className="admin-area-card__link">
              Open area <b aria-hidden="true">↗</b>
            </span>
          </Link>
        ))}
      </section>
    </>
  );
}
