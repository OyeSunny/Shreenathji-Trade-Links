# Self-hosted Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the owner a private, self-hosted analytics dashboard that shows anonymous website traffic, traffic sources, countries, devices, and page activity.

**Architecture:** Run Umami as a separately deployed containerized service at `analytics.shreenathjitradelinks.com`, with its own PostgreSQL database and owner-managed credentials. The public Next.js site loads the tracker only when a configured website ID is present; the owner reaches the dashboard from an explicit external link in the existing admin navigation.

**Tech Stack:** Next.js 16, React, TypeScript, Vitest, Umami 3.3.1, Docker Engine and Docker Compose, PostgreSQL 15, Nginx, Certbot.

**Spec:** `docs/superpowers/specs/2026-09-10-self-hosted-analytics-design.md`

## Global Constraints

- Use `analytics.shreenathjitradelinks.com`; do not mount analytics under the public site's URL path.
- Pin Umami to `3.3.1`; do not use an unreviewed `latest` application image.
- Bind the Umami application port to `127.0.0.1` only; Nginx is the only public entry point.
- Use a separate PostgreSQL volume and credentials for analytics; never reuse the website database or application owner login.
- Do not send names, email addresses, phone numbers, free text, raw IP addresses, authentication details, or enquiry details as analytics event properties.
- Dashboard access is protected by Umami's separate owner credential; the tracker endpoint remains publicly reachable so visitors can be counted.
- Preserve `prefers-reduced-motion`, keyboard navigation, and the existing mobile admin drawer behaviour.
- Fail closed for tracking: when `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is absent, the public site must render without a tracker script or client errors.

---

## File Structure

- `deploy/analytics/compose.yaml` — production Umami and isolated PostgreSQL service definition.
- `deploy/analytics/.env.example` — non-secret inventory of required server-only values.
- `deploy/nginx/analytics.shreenathjitradelinks.com.http.conf` — temporary HTTP-only virtual host used for the ACME challenge.
- `deploy/nginx/analytics.shreenathjitradelinks.com.conf` — final HTTPS Nginx reverse-proxy configuration.
- `src/components/analytics/umami-tracker.tsx` — optional public tracker script and safe client event helper.
- `src/components/analytics/track-umami-event.ts` — client-only, non-PII event dispatch helper.
- `src/app/(public)/layout.tsx` — mounts the tracker once on public pages and links the privacy notice.
- `src/app/(public)/privacy/page.tsx` — concise public analytics disclosure.
- `src/components/admin/admin-navigation.tsx` — direct owner shortcut to the analytics dashboard.
- `tests/unit/components/analytics/umami-tracker.test.tsx` — confirms tracker omission, script attributes, and allowed event handling.
- `tests/unit/components/admin-navigation.test.tsx` — confirms the visible safe external analytics link.

### Task 1: Versioned analytics deployment assets

**Files:**
- Create: `deploy/analytics/compose.yaml`
- Create: `deploy/analytics/.env.example`
- Create: `deploy/nginx/analytics.shreenathjitradelinks.com.http.conf`
- Create: `deploy/nginx/analytics.shreenathjitradelinks.com.conf`

**Interfaces:**
- Consumes: the public DNS A record `analytics.shreenathjitradelinks.com -> 200.234.46.65`.
- Produces: an Umami service on `127.0.0.1:3001` and a final Nginx virtual host that forwards only HTTPS traffic to it.

- [ ] **Step 1: Create the pinned Compose definition**

```yaml
services:
  umami:
    image: ghcr.io/umami-software/umami:3.3.1
    restart: unless-stopped
    depends_on:
      umami-db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://${UMAMI_DB_USER}:${UMAMI_DB_PASSWORD}@umami-db:5432/${UMAMI_DB_NAME}
      APP_SECRET: ${UMAMI_APP_SECRET}
      CLIENT_IP_HEADER: X-Forwarded-For
    ports:
      - "127.0.0.1:3001:3000"
  umami-db:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${UMAMI_DB_NAME}
      POSTGRES_USER: ${UMAMI_DB_USER}
      POSTGRES_PASSWORD: ${UMAMI_DB_PASSWORD}
    volumes:
      - umami-postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 10
volumes:
  umami-postgres-data:
```

- [ ] **Step 2: Create the server environment template without secrets**

```dotenv
UMAMI_DB_NAME=umami
UMAMI_DB_USER=umami
UMAMI_DB_PASSWORD=replace-with-a-random-password
UMAMI_APP_SECRET=replace-with-a-random-secret
```

- [ ] **Step 3: Create the temporary HTTP Nginx host for certificate issuance**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name analytics.shreenathjitradelinks.com;
    location /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
    }
    location / { return 404; }
}
```

- [ ] **Step 4: Create the final HTTPS Nginx host**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name analytics.shreenathjitradelinks.com;
    location /.well-known/acme-challenge/ { root /var/www/letsencrypt; }
    location / { return 301 https://$host$request_uri; }
}
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name analytics.shreenathjitradelinks.com;
    ssl_certificate /etc/letsencrypt/live/analytics.shreenathjitradelinks.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/analytics.shreenathjitradelinks.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    server_tokens off;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_hide_header X-Powered-By;
    }
}
```

- [ ] **Step 5: Validate the Compose file**

Run: `docker compose --env-file deploy/analytics/.env.example -f deploy/analytics/compose.yaml config`

Expected: Docker prints the normalized `umami` and `umami-db` service configuration without interpolation errors.

- [ ] **Step 6: Commit deployment assets**

```bash
git add deploy/analytics deploy/nginx/analytics.shreenathjitradelinks.com.http.conf deploy/nginx/analytics.shreenathjitradelinks.com.conf
git commit -m "feat: add self-hosted analytics deployment"
```

### Task 2: Optional public tracker and event guard

**Files:**
- Create: `src/components/analytics/track-umami-event.ts`
- Create: `src/components/analytics/umami-tracker.tsx`
- Create: `tests/unit/components/analytics/umami-tracker.test.tsx`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_UMAMI_WEBSITE_ID` and `NEXT_PUBLIC_UMAMI_SCRIPT_URL` from the browser environment.
- Produces: `UmamiTracker` and `trackUmamiEvent(name, data)` for public page tracking without identifiers.

- [ ] **Step 1: Write failing tests for disabled and enabled tracking**

```tsx
it('does not render a tracker script when no website id is configured', () => {
  render(<UmamiTracker websiteId={undefined} />);
  expect(document.querySelector('script[data-website-id]')).toBeNull();
});

it('renders the configured tracker script with no cookie collection', () => {
  render(<UmamiTracker websiteId="site-id" />);
  expect(document.querySelector('script[data-website-id="site-id"]')).toHaveAttribute('data-domains', 'shreenathjitradelinks.com');
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `pnpm vitest run tests/unit/components/analytics/umami-tracker.test.tsx`

Expected: FAIL because `UmamiTracker` does not yet exist.

- [ ] **Step 3: Implement the tracker and strict non-PII event allowlist**

```ts
export type UmamiEventName =
  | 'quote_submitted'
  | 'contact_lead_submitted'
  | 'whatsapp_clicked'
  | 'phone_clicked'
  | 'offer_enquiry_clicked';

export const trackUmamiEvent = (
  name: UmamiEventName,
  data: Record<string, string> = {},
) => {
  window.umami?.track(name, data);
};
```

`UmamiTracker` must render a single async script with `data-website-id`, `data-domains="shreenathjitradelinks.com"`, and a tracker URL defaulting to `https://analytics.shreenathjitradelinks.com/script.js`. It must return `null` when its `websiteId` prop is empty.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `pnpm vitest run tests/unit/components/analytics/umami-tracker.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit the tracker**

```bash
git add src/components/analytics tests/unit/components/analytics
git commit -m "feat: add privacy-safe website analytics tracker"
```

### Task 3: Public disclosure and discoverable owner dashboard

**Files:**
- Modify: `src/app/(public)/layout.tsx`
- Create: `src/app/(public)/privacy/page.tsx`
- Modify: `src/components/admin/admin-navigation.tsx`
- Modify: `tests/unit/components/admin-navigation.test.tsx`

**Interfaces:**
- Consumes: `UmamiTracker` from Task 2 and `NEXT_PUBLIC_UMAMI_WEBSITE_ID` from the browser build environment.
- Produces: one tracker per public page tree, `/privacy`, and a visible `Analytics ↗` owner shortcut.

- [ ] **Step 1: Write the failing navigation assertion**

```tsx
it('links owners to the separate analytics dashboard safely', () => {
  render(<AdminNavigation />);
  expect(screen.getByRole('link', { name: /analytics/i })).toHaveAttribute(
    'href',
    'https://analytics.shreenathjitradelinks.com',
  );
});
```

- [ ] **Step 2: Run the focused navigation test to verify it fails**

Run: `pnpm vitest run tests/unit/components/admin-navigation.test.tsx`

Expected: FAIL because there is no analytics link.

- [ ] **Step 3: Mount the tracker and add a clear privacy link**

```tsx
<UmamiTracker websiteId={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID} />
<Link href="/privacy">Privacy</Link>
```

The privacy page must state in plain language that anonymous analytics measure pages, referrers, country/region, device type, and approximate usage; it must also state that the site does not send enquiry form content, phone numbers, or email addresses to analytics.

- [ ] **Step 4: Add the external sidebar entry**

```tsx
<a
  className="admin-navigation__link"
  href="https://analytics.shreenathjitradelinks.com"
  rel="noopener noreferrer"
  target="_blank"
>
  <span className="admin-navigation__index">08</span>
  <i aria-hidden="true" className="bi bi-bar-chart-line" />
  <span>Analytics ↗</span>
</a>
```

The entry must be rendered after Contact leads, must not use the current-page state, and must close the mobile drawer on click.

- [ ] **Step 5: Run focused UI tests and the project checks**

Run: `pnpm vitest run tests/unit/components/admin-navigation.test.tsx tests/unit/components/analytics/umami-tracker.test.tsx && pnpm typecheck && pnpm lint`

Expected: all commands exit successfully.

- [ ] **Step 6: Commit the public and owner access changes**

```bash
git add 'src/app/(public)/layout.tsx' 'src/app/(public)/privacy/page.tsx' src/components/admin/admin-navigation.tsx tests/unit/components/admin-navigation.test.tsx
git commit -m "feat: link owner analytics dashboard"
```

### Task 4: VPS provisioning and certificate issuance

**Files:**
- Use: `deploy/analytics/compose.yaml`
- Use: `deploy/analytics/.env.example`
- Use: `deploy/nginx/analytics.shreenathjitradelinks.com.http.conf`
- Use: `deploy/nginx/analytics.shreenathjitradelinks.com.conf`

**Interfaces:**
- Consumes: committed Task 1 assets, DNS, and the VPS `shreenathji-deploy@200.234.46.65`.
- Produces: a private loopback-only Umami service and an HTTPS analytics dashboard.

- [ ] **Step 1: Install Docker Engine and the Compose plugin from Docker's Ubuntu repository**

Run the official Docker Engine installation steps for Ubuntu 24.04, then verify:

```bash
docker --version
docker compose version
```

Expected: both commands print installed versions; Docker is enabled at boot.

- [ ] **Step 2: Install versioned assets and create secret server environment**

Create `/opt/shreenathji-analytics`, install `compose.yaml` as mode `0640`, and create `/opt/shreenathji-analytics/.env` owned by root with mode `0600`. Generate `UMAMI_DB_PASSWORD` and `UMAMI_APP_SECRET` on the VPS using `openssl rand -hex 32`; do not place either value in Git, terminal output, source code, or the website `.env` file.

- [ ] **Step 3: Issue the analytics certificate through the temporary HTTP host**

Install the temporary Nginx host, verify `nginx -t`, reload Nginx, then run:

```bash
sudo certbot certonly --webroot -w /var/www/letsencrypt -d analytics.shreenathjitradelinks.com --non-interactive --agree-tos
```

Expected: certificate files are created beneath `/etc/letsencrypt/live/analytics.shreenathjitradelinks.com/`.

- [ ] **Step 4: Install the final HTTPS reverse-proxy host and start analytics**

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo docker compose --env-file /opt/shreenathji-analytics/.env -f /opt/shreenathji-analytics/compose.yaml up -d
```

Expected: `umami` listens only at `127.0.0.1:3001`; no service listens directly on a public Umami port.

- [ ] **Step 5: Verify the public endpoint and service health**

```bash
curl --fail --silent --show-error --resolve analytics.shreenathjitradelinks.com:443:200.234.46.65 https://analytics.shreenathjitradelinks.com
sudo docker compose --env-file /opt/shreenathji-analytics/.env -f /opt/shreenathji-analytics/compose.yaml ps
sudo ss -ltnp | grep 3001
```

Expected: HTTPS responds, both containers are running, and the listener is `127.0.0.1:3001` only.

- [ ] **Step 6: Create a separate strong Umami owner login and website entry**

Sign in to the new Umami dashboard, immediately replace its default bootstrap credentials with a unique strong owner credential, and create the website `https://shreenathjitradelinks.com`. Copy only its generated website ID to the website server environment as `NEXT_PUBLIC_UMAMI_WEBSITE_ID`; do not place dashboard credentials in the Next.js application environment.

- [ ] **Step 7: Commit any repository-backed operational documentation**

```bash
git add deploy/analytics deploy/nginx
git commit -m "docs: document analytics operations"
```

### Task 5: Final deployment verification

**Files:**
- Modify: `.env.example` only if `NEXT_PUBLIC_UMAMI_WEBSITE_ID` needs documenting.
- Modify: `README.md` with owner operational steps and no credentials.

**Interfaces:**
- Consumes: deployed analytics dashboard, public tracker, and owner admin navigation.
- Produces: a reproducible launch checklist and evidence that data arrives without collecting form data.

- [ ] **Step 1: Add only the public tracker ID to the website deployment environment**

```dotenv
NEXT_PUBLIC_UMAMI_WEBSITE_ID=replace-with-the-umami-website-id
```

Restart through the existing `/usr/local/sbin/deploy-shreenathji-trade-links` deploy path so the value is built into the public bundle.

- [ ] **Step 2: Verify tracker delivery and privacy behaviour in a browser**

Open the public site, verify that `https://analytics.shreenathjitradelinks.com/script.js` loads, visit `/products`, and confirm Umami records the visit, referrer classification, country/region, device type, and path. Submit a quote using test data and inspect the received analytics event; it must contain only an allowed event name and non-identifying product/offer slug, never the entered buyer name, email, phone, or request text.

- [ ] **Step 3: Verify owner discovery and mobile interaction**

Open `/admin` at desktop and mobile widths. Confirm the `Analytics ↗` link is visible after Contact leads, opens the dashboard in a new tab, and closes the mobile drawer. Confirm the public footer reaches `/privacy`.

- [ ] **Step 4: Run final quality checks**

Run: `pnpm test && pnpm typecheck && pnpm lint && pnpm format:check && pnpm build`

Expected: all commands exit successfully with a valid production build.

- [ ] **Step 5: Commit, push, deploy, and record the release revision**

```bash
git add .env.example README.md
git commit -m "docs: add analytics configuration guidance"
git push origin HEAD:main
ssh shreenathji-deploy@200.234.46.65 'sudo /usr/local/sbin/deploy-shreenathji-trade-links'
```

Expected: public `/api/health` responds successfully over HTTPS and the server revision matches the pushed commit.

## Self-review

- Privacy, isolation, no sensitive analytics data, owner discoverability, mobile access, TLS, and tracker-disabled fallback are covered by Tasks 1–5.
- The deployment assets and tests use concrete names, commands, scripts, and environment keys; no work is deferred with placeholders.
- The exported names in Task 2 (`UmamiTracker`, `trackUmamiEvent`, `UmamiEventName`) are the same names consumed by Task 3 and its tests.
