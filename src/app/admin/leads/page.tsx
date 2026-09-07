import { db } from '@/lib/db';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';
import CardHeader from 'react-bootstrap/CardHeader';
import Table from 'react-bootstrap/Table';

export default async function AdminContactLeadsPage() {
  const contacts = await db.contactLead.findMany({
    orderBy: { consentedAt: 'desc' },
    take: 200,
  });

  return (
    <>
      <section className="mb-4">
        <p className="mb-2 small text-secondary text-uppercase">
          Buyer contacts
        </p>
        <h1 className="display-6 fw-semibold mb-2">Contact permissions</h1>
        <p className="mb-0 text-secondary">
          These buyers explicitly asked to hear about relevant materials,
          offers, and supply updates. Use their details only for that purpose.
        </p>
      </section>

      <Card className="shadow-sm">
        <CardHeader className="bg-white border-bottom-0 d-flex justify-content-between py-3">
          <span className="fw-semibold">Consented contacts</span>
          <span className="small text-secondary">{contacts.length} shown</span>
        </CardHeader>
        <CardBody className="p-0">
          {contacts.length === 0 ? (
            <Alert className="m-4 mb-0" variant="light">
              No buyer contacts yet. Contacts captured through the public supply
              updates form will appear here.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table className="align-middle mb-0" hover>
                <thead>
                  <tr>
                    <th scope="col">Contact</th>
                    <th scope="col">Permission received</th>
                    <th scope="col">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact.id}>
                      <td>
                        <a
                          className="d-block fw-semibold"
                          href={`mailto:${contact.email}`}
                        >
                          {contact.email}
                        </a>
                        {contact.phone ? (
                          <a
                            className="small text-secondary"
                            href={`tel:${contact.phone}`}
                          >
                            {contact.phone}
                          </a>
                        ) : (
                          <span className="small text-secondary">
                            Email only
                          </span>
                        )}
                      </td>
                      <td className="small text-secondary text-nowrap">
                        {new Intl.DateTimeFormat('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }).format(contact.consentedAt)}
                      </td>
                      <td className="small text-secondary">{contact.source}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
}
