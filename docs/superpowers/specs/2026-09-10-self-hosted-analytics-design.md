# Self-hosted visitor analytics design

## Goal

Give the Shreenathji Trade Links owner a private analytics workspace that
shows anonymous visitor volume, countries, referral sources, pages, devices,
and selected conversion events for the public website.

## Owner experience

- The existing admin sidebar gains an **Analytics** link that opens the private
  analytics workspace in a new tab.
- The analytics workspace is hosted at `analytics.shreenathjitradelinks.com`
  and has its own owner credential. It is not publicly linked from the buyer
  website.
- The owner can filter visits by date and inspect top pages, referrers,
  countries, browsers, devices, and UTM campaign values.
- Conversion events show aggregated actions only: quote submitted, contact
  lead submitted, WhatsApp clicked, phone clicked, and offer enquiry clicked.

## Privacy boundary

- Analytics must remain anonymous. It must not collect buyer names, email
  addresses, phone numbers, form text, or raw IP addresses in the product
  application database.
- An identified buyer is visible only after they voluntarily send an enquiry or
  opt in through the existing contact form.
- The public privacy notice will state that the site records anonymous usage
  data: page URL, referring source, approximate country, browser, device, and
  campaign information.
- Use Umami self-hosted tracking. It is cookie-free and does not follow people
  across websites.

## Architecture

- Install Docker Engine and Docker Compose plugin on the existing Ubuntu 24.04
  VPS. Run Umami and its dedicated PostgreSQL container with a compose file in
  `/opt/shreenathji-analytics`.
- Bind Umami only to `127.0.0.1:3001`; it must not have a public application
  port.
- Add an Nginx HTTPS virtual host for
  `analytics.shreenathjitradelinks.com`, proxying only to
  `127.0.0.1:3001`. Let’s Encrypt manages its certificate.
- Track the public Next.js application through one deferred Umami script in
  the public root layout. The website identifier is a non-secret environment
  value (`NEXT_PUBLIC_UMAMI_WEBSITE_ID`).
- Keep Umami login/password, database password, and application secret on the
  VPS only. They must never enter Git, source files, browser URLs, or chat.
- Create the Umami website entry after its first run and place its generated
  website ID in `/var/www/shreenathji-trade-links/.env`; deploy the public app
  afterwards.

## DNS and TLS prerequisite

- The GoDaddy DNS zone needs an A record: host `analytics`, value
  `200.234.46.65`, TTL `1 hour`.
- Once the record resolves publicly, obtain a Let’s Encrypt certificate for
  `analytics.shreenathjitradelinks.com` and force HTTP to HTTPS.

## Analytics events

Only non-identifying event names and a product or offer slug may be sent.

| Event | Trigger | Properties allowed |
| --- | --- | --- |
| `quote_submitted` | Public enquiry API reports successful save | `product`, `offer` |
| `contact_lead_submitted` | Contact-capture API reports successful save | none |
| `whatsapp_clicked` | Buyer selects a WhatsApp CTA | `placement`, `product` |
| `phone_clicked` | Buyer selects a call CTA | `placement` |
| `offer_enquiry_clicked` | Buyer chooses an offer CTA | `offer` |

No form field values, email addresses, phone numbers, IP addresses, or free
text may be included in event properties.

## Operations

- Back up the analytics Docker volume with the existing VPS backup schedule.
- Keep the service and database on the same private Docker network.
- Monitor Umami through a localhost health check and Nginx response check.
- Update Umami by reviewing release notes, taking a database backup, pulling
  the pinned image version, and restarting the compose service.
- The primary public site remains available if analytics is unavailable; the
  deferred tracking script is non-critical.

## Success criteria

1. The analytics subdomain is HTTPS-only, login-protected, and cannot be
   reached through a public application port.
2. A public page visit appears in Umami with the page path and anonymous
   location/source/device breakdown.
3. Each specified conversion appears as an aggregate event with only its
   allowlisted properties.
4. The admin sidebar opens analytics in a new tab.
5. Enquiry and contact records remain solely in the website database and are
   never copied to analytics.
