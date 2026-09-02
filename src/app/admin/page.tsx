import Link from 'next/link';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';
import CardText from 'react-bootstrap/CardText';
import CardTitle from 'react-bootstrap/CardTitle';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const nextAreas = [
  [
    '/admin/catalogue',
    'Catalogue',
    'Add, publish, and organise industrial products.',
  ],
  ['/admin/enquiries', 'Enquiries', 'Review quote requests from buyers.'],
  [
    '/admin/content',
    'Website content',
    'Update images, contact details, and company information.',
  ],
];

export default function AdminDashboardPage() {
  return (
    <>
      <section className="mb-5">
        <p className="mb-2 text-success text-uppercase small">
          Secure workspace
        </p>
        <h1 className="display-6 fw-semibold">Manage your B2B website</h1>
        <p className="col-lg-7 mb-0 text-secondary">
          The catalogue, buyer enquiries, product imagery, and company details
          will all be managed here.
        </p>
      </section>
      <Row className="g-3">
        {nextAreas.map(([href, title, description]) => (
          <Col key={title} lg={4}>
            <Card className="h-100 shadow-sm">
              <CardBody>
                <CardTitle as="h2" className="h5">
                  {title}
                </CardTitle>
                <CardText className="text-secondary">{description}</CardText>
                {href === '/admin/catalogue' ? (
                  <Link className="btn btn-outline-primary btn-sm" href={href}>
                    Manage catalogue
                  </Link>
                ) : (
                  <span className="badge text-bg-light">Coming next</span>
                )}
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}
