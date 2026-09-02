# Shreenathji Trade Links Website and Admin Platform Design

Date: 2026-09-02
Status: Approved for implementation

## 1. Product Summary

Build a full B2B catalogue and enquiry platform for Shreenathji Trade Links, a Gandhidham-based trader, wholesaler, and distributor of mill scale, iron ore, carbon products, dolomite, and related industrial materials.

The platform consists of:

1. A multi-page, SEO-friendly public website for Indian and international buyers.
2. A secure owner-managed admin panel.
3. A PostgreSQL-backed content, catalogue, and enquiry system.
4. Cloud media and document storage.
5. Email notifications and WhatsApp-assisted follow-up.

The first release does not include online checkout, payments, automated WhatsApp messaging, multiple admin roles, or direct CRM integration. The architecture must allow those capabilities to be added later without rebuilding the catalogue or enquiry system.

## 2. Goals

- Present the company as a credible industrial-material supplier rather than a marketplace listing.
- Give buyers detailed, searchable product information and straightforward quote requests.
- Support domestic and export enquiry requirements.
- Allow the owner to update nearly all business content without developer assistance.
- Store and manage enquiries through a clear sales pipeline.
- Provide strong security, search visibility, accessibility, performance, and mobile usability.
- Preserve clean module boundaries for future commerce, staff roles, multilingual content, and external integrations.

## 3. Primary Users

### Public buyer

A domestic or international buyer can browse categories and products, review specifications, view company credibility, contact the business, and submit a detailed requirement.

### Owner

The owner has one protected admin account and can manage website content, catalogue data, media, offers, testimonials, clients, projects, settings, and enquiries.

## 4. Public Website Information Architecture

### Home

- Editable hero, imagery, headings, body text, and calls-to-action.
- Featured products and categories.
- Industries served.
- Company facts and trust indicators.
- Active offers or available lots.
- Approved testimonials and client logos.
- Domestic and export capability highlights.
- Quote, call, and WhatsApp calls-to-action.

### About

- Company story, leadership, infrastructure, mission, sourcing capability, business facts, registrations, and certificates.

### Products

- Searchable and filterable product catalogue.
- Category pages with editable introductions and SEO content.
- Individual product pages with gallery, description, specifications, applications, grade, form, packaging, MOQ, unit, indicative price or "ask for price", stock status, brochure or certificate downloads, related products, and quote action.

### Industries Served

- Editable industry entries such as steel plants, foundries, furnaces, mineral processors, and construction-material businesses.
- Each entry can link to relevant products and an enquiry action.

### Domestic Supply

- Sourcing, bulk quantities, service regions, packaging, logistics, and domestic enquiry process.

### Exports

- Export capability, countries or regions served, shipment quantities, ports, packaging, documentation, and export-specific enquiry form.

### Clients and Projects

- Approved client logos, summaries of completed supplies, and case studies.
- This page and its sections can remain hidden until verified content is available.

### Offers and Availability

- Active stock lots, special prices, quantities, locations, expiry dates, and enquiry actions.

### Reviews

- Approved customer testimonials with name, company, location, product, rating, comment, and date.

### Gallery

- Categorised product, infrastructure, loading, packaging, office, certificate, and video media.

### Contact

- Editable address, map, business hours, email, telephone, WhatsApp, social links, and general enquiry form.

### Request a Quote

- Buyer and company details.
- Domestic or export enquiry type.
- Product selection or free-text material request.
- Quantity and unit.
- Destination city, country, and port where applicable.
- Desired delivery date and Incoterm where applicable.
- Requirement notes and optional specification-file upload.
- Consent acknowledgement and submission confirmation.

### Legal

- Privacy policy, terms, enquiry disclaimer, cookie disclosure, and content managed from the admin panel.

## 5. Dynamic Content Model

The public website uses structured content blocks rather than an unrestricted page builder. This keeps layouts responsive and visually consistent while making business content dynamic.

The owner can:

- Edit global branding, header, navigation, announcement bar, footer, and contact actions.
- Edit every page's SEO, hero, content, imagery, buttons, and structured sections.
- Enable, disable, and reorder permitted page sections.
- Use reusable blocks including hero, rich text, text-and-image, statistics, product grid, category grid, logo strip, industry grid, gallery, video, testimonials, FAQ, downloads, offer grid, and enquiry call-to-action.
- Manage all catalogue, client, project, testimonial, offer, media, and business-setting records.
- Preview drafts before publishing.

Templates, security rules, responsive behaviour, and the visual design system remain code-controlled.

## 5.1 Free and Open-Source Component Policy

Implementation will prefer proven, free, actively maintained open-source components over rebuilding common interface and infrastructure primitives. Bootstrap 5 and React-Bootstrap provide the responsive grid, forms, navigation, tables, alerts, modals, off-canvas panels, accordions, pagination, and other standard interface elements. Bootstrap will be customised through project-owned Sass variables and styles so the result reflects the Shreenathji Trade Links brand rather than looking like an unmodified template.

Additional established libraries may provide form state and validation, data grids, charts, rich-text editing, uploads, dates, authentication, and database access. A dependency is accepted only when its licence permits commercial use, its required functionality is exercised by automated tests, and it reduces project code or risk. Paid templates, paid component licences, abandoned packages, copied marketplace themes, and overlapping libraries for the same job are excluded. Dependency versions are locked, licences are recorded, and security updates are applied deliberately.

## 6. Admin Panel

### Dashboard

- New and recent enquiries.
- Leads by status and enquiry type.
- Popular or most-enquired products.
- Active and expiring offers.
- Draft, published, and archived catalogue counts.

### Catalogue

- Create, edit, duplicate, preview, publish, unpublish, archive, feature, and reorder products.
- Manage categories, specifications, tags, related products, media, documents, price visibility, MOQ, units, availability, applications, and SEO.

### Enquiries

- Filter, search, view, assign internal notes, and update status.
- Statuses: New, Contacted, Quoted, Won, Lost, and Spam.
- Separate domestic and export fields while retaining a unified lead list.
- Generate a pre-filled WhatsApp follow-up link. The platform does not send WhatsApp messages automatically.
- Export selected enquiry data in CSV format.

### Content and media

- Manage pages, reusable blocks, industries, services or capabilities, offers, clients, projects, reviews, FAQs, gallery items, videos, downloads, certifications, and site navigation.
- Central media library with alt text, captions, type, usage references, and archive controls.

### Settings

- Business identity, company facts, contact methods, map, social links, enquiry notification recipients, units, default SEO, and legal content.

### Account and security

- Change password, manage two-factor authentication, view recovery codes, review active sessions, revoke sessions, and inspect security events.

## 7. Core Data Entities

- AdminUser
- Session
- PasswordResetToken
- TwoFactorCredential
- RecoveryCode
- SecurityEvent
- SiteSetting
- NavigationMenu and NavigationItem
- Page
- PageSection
- MediaAsset
- ProductCategory
- Product
- ProductSpecification
- ProductMedia
- ProductDocument
- Industry
- Offer
- Client
- Project or CaseStudy
- Testimonial
- GalleryItem
- FAQ
- Enquiry
- EnquiryItem
- EnquiryAttachment
- EnquiryNote

Records that appear publicly support draft, published, and archived states where appropriate. Human-readable URL slugs are unique and redirects are recorded when published slugs change.

## 8. Technical Architecture

### Application

- Next.js and TypeScript provide the public website, admin interface, server-rendered pages, and protected backend operations in one maintainable application.
- Bootstrap 5, React-Bootstrap, and Bootstrap Icons provide standard responsive interface primitives; project-owned Sass variables and focused component wrappers provide the industrial visual identity.
- The public and admin areas use separate route groups and authorization boundaries.
- Domain services isolate catalogue, content, enquiry, media, and authentication logic from the user interface.

### Database

- PostgreSQL stores structured content, products, settings, authentication records, and enquiries.
- Schema migrations are version-controlled and applied through deployment automation.
- Database access uses a typed ORM and server-side validation.

### Media storage

- S3-compatible object storage holds images, documents, videos where practical, and buyer attachments.
- Public marketing assets and private enquiry attachments use separate access policies.
- Private files are accessed only through short-lived signed URLs available to an authenticated owner.

### Rendering and caching

- Public pages are server-rendered or statically regenerated where suitable for search visibility and performance.
- Published content changes trigger targeted cache invalidation.
- Admin and enquiry pages are always dynamic and never publicly cached.

## 9. Enquiry Data Flow

1. The buyer completes a general, product, domestic, or export enquiry form.
2. The server validates all fields and checks spam controls and rate limits.
3. Valid attachments are scanned by type, size, and signature, stored privately, and linked to the enquiry.
4. The enquiry and its requested items are saved in one database transaction.
5. The platform sends an owner notification email and a buyer acknowledgement email.
6. The admin dashboard shows the enquiry as New.
7. The owner can update status, add internal notes, and open a pre-filled WhatsApp follow-up link.
8. Email failure does not discard the enquiry. The failure is logged and the dashboard marks notification delivery for retry or owner attention.

## 10. Authentication and Admin Security

### Password storage

- Passwords are never stored or logged in plain text.
- Passwords are hashed with Argon2id using server-side parameters appropriate to the production environment.
- The owner must use a strong password and breached/common passwords are rejected.

### Login

- Authentication requires the owner's email and password followed by time-based one-time password two-factor authentication.
- Two-factor authentication is enrolled during secure initial account setup using an authenticator application.
- Single-use recovery codes are generated once, displayed for secure offline storage, and stored only as hashes.
- Login attempts are rate-limited by account and network source. Repeated failures create security events and introduce temporary lockouts.
- Authentication responses do not reveal whether an email account exists.

### Password change

- An authenticated owner can change the password only after re-entering the current password and passing two-factor verification.
- Successful changes revoke all other sessions and produce an email security notification.

### Forgotten-password recovery

- The owner requests recovery using the preconfigured account email.
- The system always returns a neutral response.
- A cryptographically random, single-use reset token is emailed to the owner.
- Only a hash of the reset token is stored in the database.
- The link expires after 15 minutes and becomes invalid immediately after use.
- The reset requires a valid token and two-factor verification or a valid unused recovery code.
- Successful reset revokes all sessions, invalidates outstanding reset tokens and recovery attempts, and sends a security notification.
- If both email and two-factor recovery are unavailable, account recovery requires a controlled deployment-level procedure; there is no public bypass or master password.

### Sessions and authorization

- Session cookies are Secure, HttpOnly, SameSite-protected, rotated after authentication, and never accessible to client-side scripts.
- Admin sessions expire after 30 minutes of inactivity and have a 12-hour absolute lifetime. Sensitive actions require password and two-factor re-authentication even within an active session.
- The owner can review and revoke active sessions.
- Every admin mutation verifies authentication and authorization on the server.
- Sensitive actions require recent re-authentication.

### Additional controls

- CSRF protection, strict input validation, sanitised rich text, safe database queries, security headers, and a restrictive content security policy.
- Admin routes are excluded from search indexing.
- Secrets exist only in protected environment configuration.
- Security events record successful and failed login, reset, password, two-factor, session, and high-impact content actions without logging secrets.

## 11. File and Media Security

- File types are validated using both extension and file signature.
- Configurable size limits apply by media type.
- Executable content is rejected.
- Filenames are replaced with generated storage keys.
- Images are reprocessed before public delivery and served in optimized formats.
- Buyer attachments remain private and are never exposed through guessable public URLs.
- Deleting a media record checks usage references to prevent broken pages.

## 12. SEO, Performance, and Accessibility

- Editable metadata, canonical URLs, robots controls, XML sitemap, breadcrumbs, Open Graph images, and structured data for organization, products, breadcrumbs, and FAQs.
- Product and category URLs are stable and readable.
- Responsive images, lazy loading, caching, font optimization, and minimized client-side JavaScript.
- Keyboard navigation, visible focus states, labelled forms, semantic headings, descriptive alternative text, sufficient colour contrast, and useful validation messages.
- The target is a fast, usable experience on typical mobile connections, not only high-end desktop devices.

## 13. Error Handling, Observability, and Recovery

- Buyer-facing errors use clear language and do not expose internal details.
- Admin operations display actionable validation and retry guidance.
- Structured server logs capture request correlation, application failures, notification failures, and security events without sensitive field contents.
- Production error monitoring alerts the maintainer to repeated failures.
- Automated database backups and object-storage retention protect business data.
- Restore procedures are documented and tested before launch.
- A health endpoint supports deployment and uptime checks without exposing sensitive system information.

## 14. Testing Strategy

- Unit tests cover validation, pricing and visibility rules, status transitions, authentication helpers, and permission checks.
- Integration tests cover database operations, publishing, enquiries, email failure behaviour, password reset, two-factor authentication, and private attachment access.
- End-to-end tests cover buyer catalogue navigation, quote submission, owner login, content publishing, enquiry management, password change, and recovery.
- Automated accessibility and responsive checks cover key public and admin routes.
- Security-focused tests cover rate limits, unauthorized access, reset-token reuse, expired tokens, unsafe uploads, input sanitisation, and session revocation.

## 15. Deployment and Environments

- Separate local, staging, and production environments.
- Production uses managed PostgreSQL, S3-compatible storage, HTTPS, protected secrets, transactional email, monitoring, and automated backups.
- Deployments run type checks, tests, production builds, and migration checks before release.
- Staging uses non-production credentials and test data and is blocked from search indexing.

## 16. Future Expansion Boundaries

The following can be added as separate modules:

- Multiple staff accounts and role-based permissions.
- Multilingual content.
- Shopping cart, negotiated orders, invoices, and online payments.
- Inventory or ERP synchronization.
- CRM and messaging-provider integrations.
- Customer portal, order status, and document exchange.
- Advanced analytics and marketing automation.

The first release must not include incomplete placeholders for these features.

## 17. Acceptance Criteria

- All agreed public pages exist as separate responsive routes.
- Nearly all business content, imagery, catalogue data, SEO, and contact information is editable from the admin panel.
- The owner can publish content without developer assistance while structural templates remain protected.
- Buyers can submit domestic and export enquiries from general and product-specific contexts.
- Every valid enquiry is stored even if email delivery fails.
- The owner receives notification emails and can manage enquiry status and WhatsApp follow-up.
- Products support structured specifications, multiple media items, documents, MOQ, pricing visibility, offers, and availability.
- Owner login, two-factor authentication, password change, password reset, session revocation, and security logging meet the controls in this document.
- Public pages meet agreed accessibility, SEO, responsive, and performance checks.
- Automated tests cover the principal buyer, admin, enquiry, and authentication journeys.
