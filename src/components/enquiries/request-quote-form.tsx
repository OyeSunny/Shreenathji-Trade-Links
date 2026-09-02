'use client';

import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const initialForm = {
  type: 'DOMESTIC',
  contactName: '',
  companyName: '',
  email: '',
  phone: '',
  whatsapp: '',
  countryCode: '',
  city: '',
  destinationCountry: '',
  destinationPort: '',
  incoterm: '',
  materialRequest: '',
  quantity: '',
  unit: 'MT',
  website: '',
};

export const RequestQuoteForm = () => {
  const [values, setValues] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, setState] = useState<'idle' | 'success' | 'error' | 'limited'>(
    'idle',
  );

  const update = (field: keyof typeof initialForm, value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState('idle');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.status === 429) {
        setState('limited');
        return;
      }

      if (!response.ok) {
        setState('error');
        return;
      }

      setValues(initialForm);
      setState('success');
    } catch {
      setState('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form noValidate onSubmit={handleSubmit}>
      {state === 'success' ? (
        <Alert variant="success">
          Your enquiry has been received. We’ll get back to you with the next
          steps.
        </Alert>
      ) : null}
      {state === 'error' ? (
        <Alert variant="danger">
          Please check the required details and try again.
        </Alert>
      ) : null}
      {state === 'limited' ? (
        <Alert variant="warning">
          Please wait before sending another enquiry.
        </Alert>
      ) : null}
      <Form.Control
        aria-hidden="true"
        autoComplete="off"
        className="d-none"
        onChange={(event) => update('website', event.target.value)}
        tabIndex={-1}
        type="text"
        value={values.website}
      />
      <div className="row g-3">
        <Form.Group className="col-md-6" controlId="enquiry-name">
          <Form.Label>Your name *</Form.Label>
          <Form.Control
            onChange={(event) => update('contactName', event.target.value)}
            required
            value={values.contactName}
          />
        </Form.Group>
        <Form.Group className="col-md-6" controlId="enquiry-company">
          <Form.Label>Company</Form.Label>
          <Form.Control
            onChange={(event) => update('companyName', event.target.value)}
            value={values.companyName}
          />
        </Form.Group>
        <Form.Group className="col-md-6" controlId="enquiry-email">
          <Form.Label>Business email *</Form.Label>
          <Form.Control
            autoComplete="email"
            onChange={(event) => update('email', event.target.value)}
            required
            type="email"
            value={values.email}
          />
        </Form.Group>
        <Form.Group className="col-md-6" controlId="enquiry-phone">
          <Form.Label>Phone / WhatsApp</Form.Label>
          <Form.Control
            autoComplete="tel"
            onChange={(event) => update('phone', event.target.value)}
            type="tel"
            value={values.phone}
          />
        </Form.Group>
        <Form.Group className="col-md-6" controlId="enquiry-type">
          <Form.Label>Requirement type *</Form.Label>
          <Form.Select
            onChange={(event) => update('type', event.target.value)}
            value={values.type}
          >
            <option value="DOMESTIC">India / domestic</option>
            <option value="EXPORT">International / export</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="col-md-6" controlId="enquiry-country">
          <Form.Label>Country</Form.Label>
          <Form.Control
            onChange={(event) =>
              update('destinationCountry', event.target.value)
            }
            value={values.destinationCountry}
          />
        </Form.Group>
        <Form.Group className="col-12" controlId="enquiry-material">
          <Form.Label>Material and specifications *</Form.Label>
          <Form.Control
            as="textarea"
            onChange={(event) => update('materialRequest', event.target.value)}
            required
            rows={4}
            value={values.materialRequest}
          />
          <Form.Text>
            Include material, grade, size, packaging, and any required
            certificate.
          </Form.Text>
        </Form.Group>
        <Form.Group className="col-md-6" controlId="enquiry-quantity">
          <Form.Label>Estimated quantity</Form.Label>
          <Form.Control
            inputMode="decimal"
            onChange={(event) => update('quantity', event.target.value)}
            value={values.quantity}
          />
        </Form.Group>
        <Form.Group className="col-md-6" controlId="enquiry-unit">
          <Form.Label>Unit</Form.Label>
          <Form.Select
            onChange={(event) => update('unit', event.target.value)}
            value={values.unit}
          >
            <option>MT</option>
            <option>KG</option>
            <option>Container</option>
            <option>Other</option>
          </Form.Select>
        </Form.Group>
      </div>
      <Button className="mt-4 px-4" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Sending enquiry…' : 'Request a quote'}
      </Button>
    </Form>
  );
};
