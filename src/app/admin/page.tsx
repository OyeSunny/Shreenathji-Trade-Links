import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const nextAreas = [
  ['Catalogue', 'Add and organise industrial products.'],
  ['Enquiries', 'Review quote requests from buyers.'],
  [
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
        {nextAreas.map(([title, description]) => (
          <Col key={title} lg={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title as="h2" className="h5">
                  {title}
                </Card.Title>
                <Card.Text className="text-secondary">{description}</Card.Text>
                <span className="badge text-bg-light">Coming next</span>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}
