'use client';

import {
  saveBusinessIdentity,
  saveCompanyPageContent,
  saveHomePageContent,
  type WebsiteContentFormState,
} from '@/app/admin/content/actions';
import type {
  BusinessIdentity,
  CompanyPageContent,
  HomePageContent,
} from '@/features/content/site-content';
import { useActionState, useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

const emptyFormState: WebsiteContentFormState = {};

const errorFor = (
  fieldErrors: Record<string, string[] | undefined> | undefined,
  field: string,
) => fieldErrors?.[field]?.[0];

const FormNotice = ({ state }: { state: WebsiteContentFormState }) =>
  state.message ? (
    <Alert
      role="alert"
      variant={state.status === 'success' ? 'success' : 'danger'}
    >
      {state.message}
    </Alert>
  ) : null;

export const BusinessIdentityForm = ({
  content,
}: {
  content: BusinessIdentity;
}) => {
  const [state, formAction, isPending] = useActionState(
    saveBusinessIdentity,
    emptyFormState,
  );

  return (
    <form action={formAction} noValidate>
      <FormNotice state={state} />
      <Row className="g-3">
        <Col md={6}>
          <Form.Group controlId="company-name">
            <Form.Label>Company name</Form.Label>
            <Form.Control
              defaultValue={content.companyName}
              isInvalid={Boolean(errorFor(state.fieldErrors, 'companyName'))}
              maxLength={140}
              name="companyName"
              required
            />
            <Form.Control.Feedback type="invalid">
              {errorFor(state.fieldErrors, 'companyName')}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="company-city">
            <Form.Label>City and state</Form.Label>
            <Form.Control
              defaultValue={content.city}
              isInvalid={Boolean(errorFor(state.fieldErrors, 'city'))}
              maxLength={140}
              name="city"
              placeholder="e.g. Gandhidham, Gujarat, India"
              required
            />
            <Form.Control.Feedback type="invalid">
              {errorFor(state.fieldErrors, 'city')}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group controlId="company-address">
            <Form.Label>
              Business address{' '}
              <span className="text-secondary">(optional)</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              defaultValue={content.address}
              isInvalid={Boolean(errorFor(state.fieldErrors, 'address'))}
              maxLength={500}
              name="address"
              rows={2}
            />
            <Form.Control.Feedback type="invalid">
              {errorFor(state.fieldErrors, 'address')}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="company-email">
            <Form.Label>
              Enquiry email <span className="text-secondary">(optional)</span>
            </Form.Label>
            <Form.Control
              defaultValue={content.email}
              inputMode="email"
              isInvalid={Boolean(errorFor(state.fieldErrors, 'email'))}
              maxLength={254}
              name="email"
              type="email"
            />
            <Form.Control.Feedback type="invalid">
              {errorFor(state.fieldErrors, 'email')}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="company-phone">
            <Form.Label>
              Call number <span className="text-secondary">(optional)</span>
            </Form.Label>
            <Form.Control
              defaultValue={content.phone}
              inputMode="tel"
              isInvalid={Boolean(errorFor(state.fieldErrors, 'phone'))}
              maxLength={40}
              name="phone"
              type="tel"
            />
            <Form.Control.Feedback type="invalid">
              {errorFor(state.fieldErrors, 'phone')}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="company-whatsapp">
            <Form.Label>
              WhatsApp number <span className="text-secondary">(optional)</span>
            </Form.Label>
            <Form.Control
              defaultValue={content.whatsApp}
              inputMode="tel"
              isInvalid={Boolean(errorFor(state.fieldErrors, 'whatsApp'))}
              maxLength={40}
              name="whatsApp"
              type="tel"
            />
            <Form.Control.Feedback type="invalid">
              {errorFor(state.fieldErrors, 'whatsApp')}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="company-export-statement">
            <Form.Label>
              Export availability note{' '}
              <span className="text-secondary">(optional)</span>
            </Form.Label>
            <Form.Control
              defaultValue={content.exportStatement}
              isInvalid={Boolean(
                errorFor(state.fieldErrors, 'exportStatement'),
              )}
              maxLength={280}
              name="exportStatement"
            />
            <Form.Control.Feedback type="invalid">
              {errorFor(state.fieldErrors, 'exportStatement')}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <div className="d-flex justify-content-end mt-4">
        <Button disabled={isPending} type="submit">
          {isPending ? 'Saving details…' : 'Save company details'}
        </Button>
      </div>
    </form>
  );
};

export const CompanyPageContentForm = ({
  content,
}: {
  content: CompanyPageContent;
}) => {
  const [state, formAction, isPending] = useActionState(
    saveCompanyPageContent,
    emptyFormState,
  );

  return (
    <form action={formAction} noValidate>
      <FormNotice state={state} />
      <Form.Group className="mb-3" controlId="company-page-eyebrow">
        <Form.Label>Small heading above the title</Form.Label>
        <Form.Control
          defaultValue={content.eyebrow}
          isInvalid={Boolean(errorFor(state.fieldErrors, 'eyebrow'))}
          maxLength={80}
          name="eyebrow"
          required
        />
        <Form.Control.Feedback type="invalid">
          {errorFor(state.fieldErrors, 'eyebrow')}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3" controlId="company-page-title">
        <Form.Label>Main title</Form.Label>
        <Form.Control
          defaultValue={content.title}
          isInvalid={Boolean(errorFor(state.fieldErrors, 'title'))}
          maxLength={180}
          name="title"
          required
        />
        <Form.Control.Feedback type="invalid">
          {errorFor(state.fieldErrors, 'title')}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3" controlId="company-page-lede">
        <Form.Label>Short introduction</Form.Label>
        <Form.Control
          as="textarea"
          defaultValue={content.lede}
          isInvalid={Boolean(errorFor(state.fieldErrors, 'lede'))}
          maxLength={600}
          name="lede"
          required
          rows={3}
        />
        <Form.Text>
          This is the first paragraph visitors see on the Company page.
        </Form.Text>
        <Form.Control.Feedback type="invalid">
          {errorFor(state.fieldErrors, 'lede')}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group controlId="company-page-body">
        <Form.Label>Company story and working approach</Form.Label>
        <Form.Control
          as="textarea"
          defaultValue={content.body}
          isInvalid={Boolean(errorFor(state.fieldErrors, 'body'))}
          maxLength={4000}
          name="body"
          required
          rows={7}
        />
        <Form.Control.Feedback type="invalid">
          {errorFor(state.fieldErrors, 'body')}
        </Form.Control.Feedback>
      </Form.Group>
      <div className="d-flex justify-content-end mt-4">
        <Button disabled={isPending} type="submit">
          {isPending ? 'Saving page text…' : 'Save company page'}
        </Button>
      </div>
    </form>
  );
};

export const HomePageContentForm = ({
  content,
}: {
  content: HomePageContent;
}) => {
  const [state, formAction, isPending] = useActionState(
    saveHomePageContent,
    emptyFormState,
  );
  const [heroSlides, setHeroSlides] = useState(content.heroSlides);
  const [marqueeItems, setMarqueeItems] = useState(content.marqueeItems);

  const addHeroSlide = () => {
    const template = heroSlides.at(-1) ?? content.heroSlides[0];
    if (!template || heroSlides.length >= 10) return;
    setHeroSlides([
      ...heroSlides,
      {
        ...template,
        indexLabel: 'NEW MATERIAL',
        title: 'A new material story.',
      },
    ]);
  };

  const addMarqueeItem = () => {
    if (marqueeItems.length >= 12) return;
    setMarqueeItems([...marqueeItems, 'New supply highlight']);
  };

  return (
    <form action={formAction} encType="multipart/form-data" noValidate>
      <input name="heroCount" type="hidden" value={heroSlides.length} />
      <input name="marqueeCount" type="hidden" value={marqueeItems.length} />
      <FormNotice state={state} />
      <p className="mb-4 text-secondary">
        Work through one homepage area at a time. Open only the section you want
        to change, then save when you are finished.
      </p>
      <section className="admin-content-editor__section">
        <div className="admin-content-editor__heading">
          <span>01</span>
          <div>
            <h2 className="h4 mb-1">Hero carousel</h2>
            <p className="mb-0 text-secondary">
              The large image-and-message area at the top of the homepage. Open
              one slide at a time to edit it.
            </p>
          </div>
        </div>
        <Accordion>
          {heroSlides.map((slide, index) => (
            <Accordion.Item eventKey={`hero-${index}`} key={`hero-${index}`}>
              <Accordion.Header>
                Hero slide {String(index + 1).padStart(2, '0')} ·{' '}
                {slide.indexLabel}
              </Accordion.Header>
              <Accordion.Body>
                <Row className="g-3">
                  <Col md={8}>
                    <input
                      name={`hero-${index}-imageSrc`}
                      type="hidden"
                      value={slide.imageSrc}
                    />
                    <Form.Group controlId={`hero-${index}-image`}>
                      <Form.Label>Replace image</Form.Label>
                      <Form.Control
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        name={`hero-${index}-image`}
                        type="file"
                      />
                      <Form.Text>
                        Current image: {slide.imageSrc}. JPG, PNG, WebP, or
                        AVIF; up to 10 MB.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId={`hero-${index}-index`}>
                      <Form.Label>Slide category label</Form.Label>
                      <Form.Control
                        defaultValue={slide.indexLabel}
                        name={`hero-${index}-indexLabel`}
                        required
                      />
                    </Form.Group>
                    {heroSlides.length > 1 ? (
                      <Button
                        className="mt-3"
                        onClick={() =>
                          setHeroSlides(
                            heroSlides.filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                          )
                        }
                        size="sm"
                        type="button"
                        variant="outline-danger"
                      >
                        Remove this slide
                      </Button>
                    ) : null}
                  </Col>
                  <Col xs={12}>
                    <Form.Group controlId={`hero-${index}-alt`}>
                      <Form.Label>Image description</Form.Label>
                      <Form.Control
                        defaultValue={slide.imageAlt}
                        name={`hero-${index}-imageAlt`}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={5}>
                    <Form.Group controlId={`hero-${index}-eyebrow`}>
                      <Form.Label>Small heading</Form.Label>
                      <Form.Control
                        defaultValue={slide.eyebrow}
                        name={`hero-${index}-eyebrow`}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={7}>
                    <Form.Group controlId={`hero-${index}-title`}>
                      <Form.Label>Main heading</Form.Label>
                      <Form.Control
                        defaultValue={slide.title}
                        name={`hero-${index}-title`}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Form.Group controlId={`hero-${index}-lede`}>
                      <Form.Label>Introduction</Form.Label>
                      <Form.Control
                        as="textarea"
                        defaultValue={slide.lede}
                        name={`hero-${index}-lede`}
                        required
                        rows={3}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId={`hero-${index}-primary-label`}>
                      <Form.Label>Primary button label</Form.Label>
                      <Form.Control
                        defaultValue={slide.primaryLabel}
                        name={`hero-${index}-primaryLabel`}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId={`hero-${index}-primary-link`}>
                      <Form.Label>Primary button link</Form.Label>
                      <Form.Control
                        defaultValue={slide.primaryHref}
                        name={`hero-${index}-primaryHref`}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId={`hero-${index}-secondary-label`}>
                      <Form.Label>Secondary button label</Form.Label>
                      <Form.Control
                        defaultValue={slide.secondaryLabel}
                        name={`hero-${index}-secondaryLabel`}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId={`hero-${index}-secondary-link`}>
                      <Form.Label>Secondary button link</Form.Label>
                      <Form.Control
                        defaultValue={slide.secondaryHref}
                        name={`hero-${index}-secondaryHref`}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
        <div className="mt-3">
          <Button
            disabled={heroSlides.length >= 10}
            onClick={addHeroSlide}
            type="button"
            variant="outline-primary"
          >
            Add hero slide
          </Button>
          <span className="ms-3 small text-secondary">
            Up to 10 slides. New slides start as a copy of the previous one.
          </span>
        </div>
      </section>

      <details className="admin-content-editor__disclosure">
        <summary>
          <span>02</span>
          <span>
            <strong>Moving marquee</strong>
            <small>The thin moving strip below the hero carousel.</small>
          </span>
        </summary>
        <div className="admin-content-editor__body">
          <Row className="g-3 mt-1">
            {marqueeItems.map((item, index) => (
              <Col md={6} key={`marquee-${index}`}>
                <Form.Group controlId={`marquee-${index}`}>
                  <Form.Label>Marquee item {index + 1}</Form.Label>
                  <Form.Control
                    defaultValue={item}
                    name={`marquee-${index}`}
                    required
                  />
                  {marqueeItems.length > 2 ? (
                    <Button
                      className="mt-2"
                      onClick={() =>
                        setMarqueeItems(
                          marqueeItems.filter(
                            (_, itemIndex) => itemIndex !== index,
                          ),
                        )
                      }
                      size="sm"
                      type="button"
                      variant="link"
                    >
                      Remove item
                    </Button>
                  ) : null}
                </Form.Group>
              </Col>
            ))}
          </Row>
          <Button
            className="mt-3"
            disabled={marqueeItems.length >= 12}
            onClick={addMarqueeItem}
            type="button"
            variant="outline-primary"
          >
            Add marquee item
          </Button>
        </div>
      </details>

      <details className="admin-content-editor__disclosure">
        <summary>
          <span>03</span>
          <span>
            <strong>Business highlights</strong>
            <small>The three short messages below the moving strip.</small>
          </span>
        </summary>
        <div className="admin-content-editor__body">
          <Row className="g-3 mt-1">
            {content.highlights.map((highlight, index) => (
              <Col md={4} key={`highlight-${index}`}>
                <Form.Group
                  className="mb-2"
                  controlId={`highlight-${index}-title`}
                >
                  <Form.Label>Highlight {index + 1} title</Form.Label>
                  <Form.Control
                    defaultValue={highlight.title}
                    name={`highlight-${index}-title`}
                    required
                  />
                </Form.Group>
                <Form.Control
                  defaultValue={highlight.text}
                  name={`highlight-${index}-text`}
                  required
                  aria-label={`Highlight ${index + 1} description`}
                />
              </Col>
            ))}
          </Row>
        </div>
      </details>

      <details className="admin-content-editor__disclosure">
        <summary>
          <span>04</span>
          <span>
            <strong>Catalogue and enquiry process</strong>
            <small>
              The product introduction and three-step buyer process.
            </small>
          </span>
        </summary>
        <div className="admin-content-editor__body">
          <Row className="g-3 mt-1">
            <Col md={4}>
              <Form.Group controlId="catalogue-eyebrow">
                <Form.Label>Catalogue label</Form.Label>
                <Form.Control
                  defaultValue={content.catalogueEyebrow}
                  name="catalogueEyebrow"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={5}>
              <Form.Group controlId="catalogue-title">
                <Form.Label>Catalogue title</Form.Label>
                <Form.Control
                  defaultValue={content.catalogueTitle}
                  name="catalogueTitle"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="catalogue-link">
                <Form.Label>Catalogue link label</Form.Label>
                <Form.Control
                  defaultValue={content.catalogueLinkLabel}
                  name="catalogueLinkLabel"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="process-eyebrow">
                <Form.Label>Process label</Form.Label>
                <Form.Control
                  defaultValue={content.processEyebrow}
                  name="processEyebrow"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={8}>
              <Form.Group controlId="process-title">
                <Form.Label>Process title</Form.Label>
                <Form.Control
                  defaultValue={content.processTitle}
                  name="processTitle"
                  required
                />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group controlId="process-lede">
                <Form.Label>Process introduction</Form.Label>
                <Form.Control
                  as="textarea"
                  defaultValue={content.processLede}
                  name="processLede"
                  required
                  rows={2}
                />
              </Form.Group>
            </Col>
            {content.processSteps.map((step, index) => (
              <Col md={4} key={`process-${index}`}>
                <Form.Group
                  className="mb-2"
                  controlId={`process-${index}-title`}
                >
                  <Form.Label>Step {index + 1} title</Form.Label>
                  <Form.Control
                    defaultValue={step.title}
                    name={`process-${index}-title`}
                    required
                  />
                </Form.Group>
                <Form.Control
                  defaultValue={step.text}
                  name={`process-${index}-text`}
                  required
                  aria-label={`Step ${index + 1} description`}
                />
              </Col>
            ))}
          </Row>
        </div>
      </details>

      <details className="admin-content-editor__disclosure">
        <summary>
          <span>05</span>
          <span>
            <strong>Closing call to action</strong>
            <small>
              The dark closing section that invites buyers to send an enquiry.
            </small>
          </span>
        </summary>
        <div className="admin-content-editor__body">
          <Row className="g-3 mt-1">
            <Col md={3}>
              <Form.Group controlId="closing-eyebrow">
                <Form.Label>Small heading</Form.Label>
                <Form.Control
                  defaultValue={content.closingEyebrow}
                  name="closingEyebrow"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={5}>
              <Form.Group controlId="closing-title">
                <Form.Label>Main heading</Form.Label>
                <Form.Control
                  defaultValue={content.closingTitle}
                  name="closingTitle"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId="closing-button">
                <Form.Label>Button label</Form.Label>
                <Form.Control
                  defaultValue={content.closingButtonLabel}
                  name="closingButtonLabel"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId="closing-link">
                <Form.Label>Button link</Form.Label>
                <Form.Control
                  defaultValue={content.closingButtonHref}
                  name="closingButtonHref"
                  required
                />
              </Form.Group>
            </Col>
          </Row>
        </div>
      </details>
      <div className="d-flex justify-content-end mt-4">
        <Button disabled={isPending} type="submit">
          {isPending ? 'Saving homepage…' : 'Save homepage'}
        </Button>
      </div>
    </form>
  );
};
