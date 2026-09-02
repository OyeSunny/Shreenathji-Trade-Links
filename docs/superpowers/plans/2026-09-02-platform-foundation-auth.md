# Platform Foundation and Secure Owner Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the production-ready Next.js application, PostgreSQL persistence, secure single-owner authentication, two-factor recovery, protected admin shell, and automated quality gates required by every remaining Shreenathji Trade Links feature.

**Architecture:** Build a modular monolith in one Next.js application. Public routes, authentication routes, and protected admin routes use separate route groups; domain logic lives under focused feature modules and never inside page components. PostgreSQL is the source of truth, Better Auth provides audited session and credential primitives, and project-owned policy wrappers enforce the approved owner-only, Argon2id, two-factor, session-expiry, and recovery rules.

**Tech Stack:** Node.js 24 LTS, pnpm 10, Next.js 16+, React, TypeScript strict mode, Bootstrap 5, React-Bootstrap 2.x, Bootstrap Icons, Sass, PostgreSQL, Prisma ORM 7.10.x with `@prisma/adapter-pg` and `pg`, Better Auth 1.7.x, Argon2id, Zod, React Hook Form, Vitest, Testing Library, Playwright, axe-core, ESLint, and Prettier.

**Spec:** `docs/superpowers/specs/2026-09-02-shreenathji-trade-links-design.md`

## Global Constraints

- The product is a multi-page B2B catalogue and enquiry platform, not a landing page or online store.
- The first release has exactly one owner account and no public registration.
- Public business content will be dynamic; structural templates and security rules remain code-controlled.
- Passwords use Argon2id and are never stored or logged in plain text.
- Owner authentication requires email, password, and TOTP two-factor authentication.
- Password-reset links are random, single-use, stored only as hashes, and expire after 15 minutes.
- Password change and recovery revoke existing sessions and create security events.
- Admin sessions expire after 30 minutes of inactivity and after a 12-hour absolute lifetime.
- Private files never receive public object URLs.
- Prefer free, commercially usable, actively maintained open-source components over custom primitives; lock versions and retain required licence notices.
- Bootstrap components are customised through project Sass and focused wrappers; do not ship an unmodified generic Bootstrap theme.
- TypeScript uses strict mode and production code may not use `any`.
- Every task follows red-green-refactor testing and ends in a focused commit.

## Scope Decomposition

This plan is Phase 1 of the approved platform. It produces a working public shell and secure admin foundation. Separate implementation plans will cover:

1. Dynamic content, media library, catalogue, offers, clients, projects, and testimonials.
2. Complete public website, catalogue discovery, product detail, search, structured SEO, and accessibility.
3. Domestic/export enquiries, private attachments, email outbox, WhatsApp follow-up, and lead management.
4. Production deployment, monitoring, backup/restore verification, performance, and final security hardening.

## Planned File Structure

```text
src/
  app/
    (public)/
      layout.tsx                 Public navigation/footer boundary
      page.tsx                   Temporary Phase 1 home shell
    (auth)/
      admin/login/page.tsx       Password login screen
      admin/verify-2fa/page.tsx  TOTP challenge screen
      admin/setup-2fa/page.tsx   First-login enrollment and recovery codes
      admin/forgot-password/page.tsx
      admin/reset-password/page.tsx
    admin/
      layout.tsx                 Authoritative server-side admin guard
      page.tsx                   Admin dashboard shell
      security/page.tsx          Password, 2FA, sessions, events
    api/
      auth/[...all]/route.ts     Better Auth route handler
      health/route.ts            Non-sensitive health response
    layout.tsx                   Root metadata, fonts, providers
    globals.css                  Small global rules not supplied by Bootstrap
  components/
    auth/                        Focused auth forms and status components
    admin/                       Admin shell navigation and header
    ui/                          Focused wrappers around React-Bootstrap components
  features/
    auth/
      server/auth.ts             Better Auth configuration
      server/session.ts          Owner session queries and guards
      server/password.ts         Argon2id hash/verify policy
      server/recovery.ts         Reset and recovery policy orchestration
      server/owner-bootstrap.ts  Idempotent initial owner creation
      schemas.ts                 Login/reset/change validation contracts
      types.ts                   Feature-owned public types
    security/
      server/audit.ts            Security-event persistence
      server/rate-limit.ts       Login and recovery throttling
      server/re-auth.ts          Recent-authentication checks
  lib/
    db.ts                        Singleton Prisma database client
    env.ts                       Validated server/client environment
    mailer.ts                    Transactional email interface
    result.ts                    Typed success/failure result
  styles/
    bootstrap.scss              Brand variables and selected Bootstrap Sass
  generated/prisma/              Prisma-generated client output
  proxy.ts                       Optimistic admin redirect only
prisma/
  schema.prisma                 Application and authentication schema
  migrations/                   Versioned PostgreSQL migrations
scripts/
  bootstrap-owner.ts            Explicit owner bootstrap command
tests/
  e2e/                          Playwright journeys
  integration/                  Database/authentication integration tests
  unit/                         Pure policy/component tests
```

---

### Task 1: Bootstrap the Application and Test Harness

**Files:**
- Create: `package.json`
- Create: `pnpm-lock.yaml`
- Create: `.npmrc`
- Create: `.nvmrc`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `eslint.config.mjs`
- Create: `prettier.config.mjs`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `playwright.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/(public)/layout.tsx`
- Create: `src/app/(public)/page.tsx`
- Create: `src/app/globals.css`
- Create: `src/styles/bootstrap.scss`
- Create: `tests/unit/app/home-page.test.tsx`

**Interfaces:**
- Consumes: The approved design specification only.
- Produces: `pnpm dev`, `pnpm test`, `pnpm test:e2e`, `pnpm lint`, `pnpm typecheck`, and `pnpm build`; the `@/*` import alias maps to `src/*`.

- [ ] **Step 1: Scaffold the pinned Next.js workspace**

Run:

```bash
corepack enable
corepack prepare pnpm@10 --activate
scaffold_dir=$(mktemp -d)
pnpm create next-app@latest "$scaffold_dir/app" --ts --eslint --app --src-dir --import-alias '@/*' --use-pnpm --no-tailwind
test -f "$scaffold_dir/app/package.json"
rm -rf "$scaffold_dir/app/.git"
cp -a "$scaffold_dir/app/." .
rm -rf "$scaffold_dir"
pnpm pkg set packageManager=pnpm@10
pnpm add bootstrap@5 react-bootstrap@2 bootstrap-icons@1 sass zod react-hook-form @hookform/resolvers
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test @axe-core/playwright prettier prettier-plugin-organize-imports
```

Use `apply_patch` to create `.nvmrc` with the single line `24`. Expected: Next.js is installed without replacing the existing `docs/` or `.git/` directories, `pnpm-lock.yaml` exists, and package versions are locked by the lockfile.

- [ ] **Step 2: Write the failing public-shell test**

Create `tests/unit/app/home-page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/(public)/page';

describe('HomePage', () => {
  it('identifies the business and primary enquiry action', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { name: /shreenathji trade links/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /request a quote/i })).toHaveAttribute(
      'href',
      '/request-a-quote',
    );
  });
});
```

- [ ] **Step 3: Run the test to confirm the contract fails**

Run: `pnpm vitest run tests/unit/app/home-page.test.tsx`

Expected: FAIL because the scaffolded page does not expose the required business heading and quote link.

- [ ] **Step 4: Implement the minimal public shell and global tokens**

Create `src/app/(public)/page.tsx`:

```tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <section aria-labelledby="home-title">
        <p>Industrial raw materials · Domestic supply · Export enquiries</p>
        <h1 id="home-title">Shreenathji Trade Links</h1>
        <p>Bulk mill scale, iron ore, carbon products, and industrial minerals.</p>
        <Link href="/request-a-quote">Request a Quote</Link>
      </section>
    </main>
  );
}
```

Create `src/styles/bootstrap.scss`, override Bootstrap's colour, typography, radius, focus, spacing, and component variables with neutral mineral/steel colours and a single warm industrial accent, then import only the Bootstrap Sass modules required by the current interface. Import Bootstrap Icons locally through the package. Keep `src/app/globals.css` for small project rules Bootstrap does not provide. Do not add final marketing sections in this phase.

Use React-Bootstrap components for buttons, navigation, forms, alerts, cards, modal/off-canvas behaviour, and layout where they exist. Import components individually, for example `import Button from 'react-bootstrap/Button'`, to avoid unnecessary client code.

- [ ] **Step 5: Add repeatable quality scripts**

Set the following scripts in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 6: Verify and commit**

Run:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
git add .
git commit -m "chore: bootstrap web platform and test harness"
```

Expected: all commands exit successfully and the public-shell test passes.

---

### Task 2: Add Validated Configuration, PostgreSQL, and Health Checks

**Files:**
- Create: `.env.example`
- Create: `compose.yaml`
- Create: `prisma/schema.prisma`
- Create: `src/lib/env.ts`
- Create: `src/lib/db.ts`
- Create: `src/app/api/health/route.ts`
- Create: `tests/unit/lib/env.test.ts`
- Create: `tests/integration/health.test.ts`
- Modify: `package.json`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: Node.js runtime and `@/*` alias from Task 1.
- Produces: `env: AppEnv`, `db: PrismaClient`, `GET /api/health -> { status: 'ok' }`, and local PostgreSQL on port 5432.

- [ ] **Step 1: Install database dependencies**

Run:

```bash
pnpm add @prisma/client@7.10.0
pnpm add -D prisma@7.10.0
```

- [ ] **Step 2: Write failing environment validation tests**

Create `tests/unit/lib/env.test.ts`:

```ts
import { parseEnv } from '@/lib/env';

describe('parseEnv', () => {
  it('rejects missing secrets and malformed URLs', () => {
    expect(() => parseEnv({ NODE_ENV: 'production', DATABASE_URL: 'invalid' })).toThrow();
  });

  it('accepts a complete server configuration', () => {
    const env = parseEnv({
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/shreenathji_test',
      BETTER_AUTH_SECRET: 'x'.repeat(48),
      BETTER_AUTH_URL: 'http://localhost:3000',
      OWNER_EMAIL: 'owner@example.com',
      MAIL_FROM: 'website@example.com',
    });
    expect(env.OWNER_EMAIL).toBe('owner@example.com');
  });
});
```

- [ ] **Step 3: Run the environment test to verify failure**

Run: `pnpm vitest run tests/unit/lib/env.test.ts`

Expected: FAIL because `parseEnv` does not exist.

- [ ] **Step 4: Implement a server-only validated environment**

Create `src/lib/env.ts`:

```ts
import 'server-only';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  DATABASE_URL: z.string().url().or(z.string().startsWith('postgresql://')),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  OWNER_EMAIL: z.string().email(),
  MAIL_FROM: z.string().email(),
});

export type AppEnv = z.infer<typeof schema>;
export const parseEnv = (input: Record<string, string | undefined>): AppEnv => schema.parse(input);
export const env = parseEnv(process.env);
```

Create `.env.example` with local, non-secret example values for every field. Add `.env`, `.env.local`, database dumps, and generated secrets to `.gitignore`.

- [ ] **Step 5: Define the database and health route**

Create `compose.yaml` with PostgreSQL, a named volume, and a health check. Create the initial Prisma datasource/generator and the following application-owned models: `SecurityEvent`, `PasswordResetChallenge`, and `OwnerSecurityPolicy`. Authentication-owned models are generated in Task 3.

Create `src/app/api/health/route.ts`:

```ts
import { db } from '@/lib/db';

export async function GET() {
  await db.$queryRaw`SELECT 1`;
  return Response.json({ status: 'ok' });
}
```

The response must not include versions, connection strings, hostnames, or stack traces.

- [ ] **Step 6: Run migrations and integration checks**

Run:

```bash
docker compose up -d postgres
pnpm prisma validate
pnpm prisma migrate dev --name platform-foundation
pnpm vitest run tests/unit/lib/env.test.ts tests/integration/health.test.ts
```

Expected: schema validation passes, the migration applies once, and the health route returns `200` with `{ "status": "ok" }` when PostgreSQL is reachable.

- [ ] **Step 7: Commit**

```bash
git add .env.example .gitignore compose.yaml package.json pnpm-lock.yaml prisma src/lib src/app/api tests
git commit -m "feat: add validated configuration and database foundation"
```

---

### Task 3: Implement Owner-Only Authentication Policy

**Files:**
- Create: `src/features/auth/server/password.ts`
- Create: `src/features/auth/server/auth.ts`
- Create: `src/features/auth/server/session.ts`
- Create: `src/features/auth/schemas.ts`
- Create: `src/app/api/auth/[...all]/route.ts`
- Create: `src/lib/mailer.ts`
- Create: `tests/unit/auth/password.test.ts`
- Create: `tests/unit/auth/schemas.test.ts`
- Create: `tests/integration/auth/session.test.ts`
- Modify: `prisma/schema.prisma`
- Modify: `.env.example`

**Interfaces:**
- Consumes: `db`, `env`, and PostgreSQL from Task 2.
- Produces: `auth`, `hashOwnerPassword(password)`, `verifyOwnerPassword(hash, password)`, `getOwnerSession(headers)`, `requireOwnerSession()`, and `/api/auth/*`.

- [ ] **Step 1: Install pinned authentication and cryptography dependencies**

Run:

```bash
pnpm add better-auth@1.7.2 argon2 otpauth
```

- [ ] **Step 2: Write the failing Argon2id policy tests**

Create `tests/unit/auth/password.test.ts`:

```ts
import { hashOwnerPassword, verifyOwnerPassword } from '@/features/auth/server/password';

describe('owner password policy', () => {
  it('creates an Argon2id hash and verifies only the correct password', async () => {
    const hash = await hashOwnerPassword('Correct-Horse-Battery-Staple-92!');
    expect(hash).toMatch(/^\$argon2id\$/);
    await expect(verifyOwnerPassword(hash, 'Correct-Horse-Battery-Staple-92!')).resolves.toBe(true);
    await expect(verifyOwnerPassword(hash, 'wrong-password')).resolves.toBe(false);
  });
});
```

- [ ] **Step 3: Run the password test to confirm failure**

Run: `pnpm vitest run tests/unit/auth/password.test.ts`

Expected: FAIL because the password policy module does not exist.

- [ ] **Step 4: Implement the password policy**

Create `src/features/auth/server/password.ts`:

```ts
import 'server-only';
import argon2 from 'argon2';

const options = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

export const hashOwnerPassword = (password: string) => argon2.hash(password, options);

export const verifyOwnerPassword = async (hash: string, password: string) => {
  try {
    return await argon2.verify(hash, password, options);
  } catch {
    return false;
  }
};
```

- [ ] **Step 5: Define owner-only validation contracts**

Create Zod schemas with the following exact exports:

```ts
export const ownerEmailSchema = z.string().trim().toLowerCase().email();
export const ownerPasswordSchema = z
  .string()
  .min(14)
  .max(128)
  .refine((value) => !COMMON_PASSWORDS.has(value.toLowerCase()), 'Choose a less common password');
export const loginSchema = z.object({ email: ownerEmailSchema, password: z.string().min(1) });
export const totpSchema = z.object({ code: z.string().regex(/^\d{6}$/) });
```

Tests must prove normalization, minimum length, maximum length, common-password rejection, and six-digit TOTP validation.

- [ ] **Step 6: Configure Better Auth without public sign-up**

Configure `src/features/auth/server/auth.ts` with:

- Prisma adapter using PostgreSQL.
- `emailAndPassword.enabled: true` and `disableSignUp: true`.
- Custom `password.hash` and `password.verify` functions from `password.ts`.
- Two-factor plugin using TOTP and single-use backup codes.
- Session expiry of 12 hours and cookie cache no longer than 5 minutes.
- A trusted-origin list containing only `BETTER_AUTH_URL`.

Do not enable Better Auth's built-in reset-password email flow. Task 6 owns the only password-recovery flow so it can require both the approved 15-minute hashed reset challenge and TOTP or a recovery code.

Mount it in `src/app/api/auth/[...all]/route.ts`:

```ts
import { auth } from '@/features/auth/server/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth);
```

- [ ] **Step 7: Generate and migrate the authentication schema**

Run:

```bash
pnpm dlx @better-auth/cli@1.7.2 generate --config src/features/auth/server/auth.ts
pnpm prisma format
pnpm prisma migrate dev --name owner-authentication
```

Review the generated migration and confirm it creates the user, credential account, session, verification, and two-factor storage required by the configured plugins without removing the application-owned security tables.

- [ ] **Step 8: Add authoritative session guards and integration tests**

Create `requireOwnerSession()` so it obtains the Better Auth session from request headers, verifies the normalized email equals `env.OWNER_EMAIL`, checks the 30-minute inactivity policy recorded in `OwnerSecurityPolicy`, and redirects unauthenticated page requests to `/admin/login`. API callers receive a typed `401` response rather than a redirect.

Run:

```bash
pnpm test -- tests/unit/auth tests/integration/auth/session.test.ts
pnpm typecheck
```

Expected: password, schema, owner restriction, expired-session, and unauthorized-session tests pass.

- [ ] **Step 9: Commit**

```bash
git add package.json pnpm-lock.yaml prisma src/features/auth src/app/api/auth src/lib/mailer.ts tests
git commit -m "feat: add owner-only authentication policy"
```

---

### Task 4: Add Idempotent Owner Bootstrap and Two-Factor Enrollment

**Files:**
- Create: `src/features/auth/server/owner-bootstrap.ts`
- Create: `scripts/bootstrap-owner.ts`
- Create: `src/app/(auth)/admin/setup-2fa/page.tsx`
- Create: `src/components/auth/two-factor-setup-form.tsx`
- Create: `src/components/auth/recovery-codes.tsx`
- Create: `tests/integration/auth/owner-bootstrap.test.ts`
- Create: `tests/e2e/admin-two-factor-setup.spec.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `auth`, `db`, `env`, and password policy from Task 3.
- Produces: `bootstrapOwner({ email, password }): Promise<'created' | 'exists'>`, `pnpm owner:bootstrap`, and mandatory first-login TOTP enrollment.

- [ ] **Step 1: Write the failing idempotency test**

Create `tests/integration/auth/owner-bootstrap.test.ts`:

```ts
import { bootstrapOwner } from '@/features/auth/server/owner-bootstrap';

describe('bootstrapOwner', () => {
  it('creates exactly one owner and is idempotent', async () => {
    await expect(bootstrapOwner({ email: 'owner@example.com', password: strongPassword })).resolves.toBe(
      'created',
    );
    await expect(bootstrapOwner({ email: 'owner@example.com', password: strongPassword })).resolves.toBe(
      'exists',
    );
    await expect(db.user.count()).resolves.toBe(1);
  });
});
```

Use a test-only constant that satisfies `ownerPasswordSchema`; do not print it.

- [ ] **Step 2: Run the test to verify failure**

Run: `pnpm vitest run tests/integration/auth/owner-bootstrap.test.ts`

Expected: FAIL because `bootstrapOwner` is not defined.

- [ ] **Step 3: Implement atomic owner bootstrap**

`bootstrapOwner` must:

1. Normalize and verify the email equals `OWNER_EMAIL`.
2. Validate the password.
3. Return `exists` when the owner already exists.
4. Create the Better Auth user and credential account in one database transaction.
5. Set `OwnerSecurityPolicy.requiresTwoFactorSetup` to `true`.
6. Add an `OWNER_BOOTSTRAPPED` security event without password or hash data.

The CLI reads the password from a hidden prompt or `OWNER_BOOTSTRAP_PASSWORD` only for that process. It clears the variable reference immediately after use and never prints the value.

- [ ] **Step 4: Implement mandatory TOTP enrollment**

After password authentication, an owner without configured TOTP is allowed only on `/admin/setup-2fa` and sign-out routes. The setup flow:

1. Requires the current authenticated pending owner session.
2. Displays the authenticator QR code and manual key once.
3. Requires a valid TOTP before enabling 2FA.
4. Displays recovery codes once and requires acknowledgement that they were saved.
5. Records `TWO_FACTOR_ENABLED` and clears `requiresTwoFactorSetup`.
6. Rotates the session before redirecting to `/admin`.

- [ ] **Step 5: Verify the complete enrollment journey**

Run:

```bash
pnpm test -- tests/integration/auth/owner-bootstrap.test.ts
pnpm playwright test tests/e2e/admin-two-factor-setup.spec.ts
pnpm typecheck
```

Expected: a first login cannot access `/admin` before TOTP enrollment; valid enrollment succeeds; setup secrets and recovery codes do not appear in logs or subsequent responses.

- [ ] **Step 6: Commit**

```bash
git add package.json scripts src/features/auth src/app/'(auth)' src/components/auth tests
git commit -m "feat: add secure owner bootstrap and two-factor enrollment"
```

---

### Task 5: Build Login, TOTP Challenge, and Protected Admin Shell

**Files:**
- Create: `src/app/(auth)/admin/login/page.tsx`
- Create: `src/app/(auth)/admin/verify-2fa/page.tsx`
- Create: `src/components/auth/login-form.tsx`
- Create: `src/components/auth/totp-form.tsx`
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/components/admin/admin-shell.tsx`
- Create: `src/components/admin/admin-navigation.tsx`
- Create: `src/proxy.ts`
- Create: `tests/unit/auth/login-form.test.tsx`
- Create: `tests/e2e/admin-login.spec.ts`

**Interfaces:**
- Consumes: Better Auth client/server APIs and owner session guards from Tasks 3-4.
- Produces: `/admin/login`, `/admin/verify-2fa`, protected `/admin`, and a reusable `AdminShell`.

- [ ] **Step 1: Write failing accessible-form tests**

Test that the login form has labelled email/password controls, an enabled submit button only when valid, a forgot-password link, a generic invalid-credentials message, and no message revealing whether an email exists.

```tsx
expect(screen.getByLabelText(/email/i)).toHaveAttribute('autocomplete', 'email');
expect(screen.getByLabelText(/password/i)).toHaveAttribute('autocomplete', 'current-password');
expect(screen.getByRole('link', { name: /forgot password/i })).toHaveAttribute(
  'href',
  '/admin/forgot-password',
);
```

- [ ] **Step 2: Run tests to verify failure**

Run: `pnpm vitest run tests/unit/auth/login-form.test.tsx`

Expected: FAIL because the login form does not exist.

- [ ] **Step 3: Implement the password and TOTP screens**

The password screen submits through Better Auth. A valid password response with `twoFactorRedirect` navigates to `/admin/verify-2fa`; it must not create an authenticated admin experience before the TOTP succeeds. The TOTP screen accepts exactly six digits, supports a recovery-code mode, prevents duplicate submission, and rotates into a complete session on success.

All invalid credential, invalid TOTP, expired challenge, and locked-account messages must remain generic to unauthorized users.

- [ ] **Step 4: Implement two layers of route protection**

`src/proxy.ts` provides an optimistic cookie-based redirect for obvious unauthenticated requests. `src/app/admin/layout.tsx` calls `requireOwnerSession()` and is the authoritative server guard. Never rely on proxy checks for authorization.

The initial admin shell uses React-Bootstrap Navbar, Nav, Offcanvas, Container, and accessible dropdown components. It contains navigation entries for Dashboard, Products, Content, Media, Enquiries, Offers, Clients & Projects, Reviews, Settings, and Security. Entries may display a disabled "coming in a subsequent phase" state, but there must be no fake data or non-functional action buttons.

- [ ] **Step 5: Verify login and authorization journeys**

Run:

```bash
pnpm test -- tests/unit/auth/login-form.test.tsx
pnpm playwright test tests/e2e/admin-login.spec.ts
pnpm lint
pnpm typecheck
```

Expected: anonymous requests redirect to login; password-only login cannot access admin; valid TOTP reaches the dashboard; invalid recovery codes fail; signed-in non-owner records are denied.

- [ ] **Step 6: Commit**

```bash
git add src/app src/components src/proxy.ts tests
git commit -m "feat: add two-factor login and protected admin shell"
```

---

### Task 6: Implement Password Change, Recovery, and Session Management

**Files:**
- Create: `src/app/(auth)/admin/forgot-password/page.tsx`
- Create: `src/app/(auth)/admin/reset-password/page.tsx`
- Create: `src/app/admin/security/page.tsx`
- Create: `src/components/auth/forgot-password-form.tsx`
- Create: `src/components/auth/reset-password-form.tsx`
- Create: `src/components/auth/change-password-form.tsx`
- Create: `src/components/auth/session-list.tsx`
- Create: `src/features/auth/server/recovery.ts`
- Create: `src/features/auth/server/security-actions.ts`
- Create: `tests/unit/auth/recovery.test.ts`
- Create: `tests/integration/auth/password-reset.test.ts`
- Create: `tests/e2e/admin-account-security.spec.ts`

**Interfaces:**
- Consumes: owner authentication, two-factor data, mailer, and security tables.
- Produces: `requestOwnerPasswordReset(email)`, `completeOwnerPasswordReset(input)`, `changeOwnerPassword(input)`, `listOwnerSessions()`, and `revokeOwnerSession(id)`.

- [ ] **Step 1: Write failing reset-token policy tests**

```ts
it('accepts a reset token once and rejects it after 15 minutes', async () => {
  const issued = await issueResetChallenge(owner.id, now);
  await expect(verifyResetChallenge(issued.rawToken, now.plus({ minutes: 14 }))).resolves.toMatchObject({
    userId: owner.id,
  });
  await consumeResetChallenge(issued.rawToken, now.plus({ minutes: 14 }));
  await expect(verifyResetChallenge(issued.rawToken, now.plus({ minutes: 14 }))).rejects.toThrow(
    'RESET_CHALLENGE_INVALID',
  );
});
```

Add separate tests for token hashes at rest, expiry at 15 minutes, neutral unknown-email response, required TOTP/recovery factor, session revocation, and audit-event creation.

- [ ] **Step 2: Run tests to verify failure**

Run: `pnpm vitest run tests/unit/auth/recovery.test.ts`

Expected: FAIL because recovery orchestration does not exist.

- [ ] **Step 3: Implement the project-owned reset challenge**

`requestOwnerPasswordReset` must always return `{ accepted: true }`. For the configured owner only, generate 32 random bytes, store `SHA-256(rawToken)` in `PasswordResetChallenge`, set `expiresAt` to 15 minutes, invalidate earlier unused challenges, enqueue the reset email through `Mailer`, and omit both raw token and URL from logs.

`completeOwnerPasswordReset` must atomically:

1. Match the hashed token using constant-time comparison semantics at the application boundary.
2. Reject used or expired challenges.
3. Verify a current TOTP or consume one valid unused recovery code.
4. Validate and Argon2id-hash the new password.
5. Replace the credential hash.
6. Mark the challenge used.
7. Revoke every owner session.
8. Invalidate remaining challenges.
9. Record `PASSWORD_RESET_COMPLETED`.

- [ ] **Step 4: Implement authenticated password change and session control**

`changeOwnerPassword` requires a current owner session, current password, valid TOTP, and new password. On success it revokes all other sessions and records `PASSWORD_CHANGED`.

The Security page lists session device label, approximate network identifier, created time, last activity, and expiry without exposing raw session tokens. The owner can revoke any other session and can sign out all sessions.

- [ ] **Step 5: Verify recovery and security UI**

Run:

```bash
pnpm test -- tests/unit/auth/recovery.test.ts tests/integration/auth/password-reset.test.ts
pnpm playwright test tests/e2e/admin-account-security.spec.ts
pnpm typecheck
```

Expected: all reset, expiry, reuse, second-factor, password-change, and session-revocation cases pass.

- [ ] **Step 6: Commit**

```bash
git add prisma src/app src/components/auth src/features/auth tests
git commit -m "feat: add secure password recovery and session controls"
```

---

### Task 7: Add Rate Limiting, Security Events, Headers, and Safe Errors

**Files:**
- Create: `src/features/security/server/audit.ts`
- Create: `src/features/security/server/rate-limit.ts`
- Create: `src/features/security/server/re-auth.ts`
- Create: `src/lib/result.ts`
- Create: `src/app/error.tsx`
- Create: `src/app/admin/error.tsx`
- Create: `tests/unit/security/rate-limit.test.ts`
- Create: `tests/integration/security/audit.test.ts`
- Create: `tests/e2e/security-boundaries.spec.ts`
- Modify: `next.config.ts`
- Modify: `src/features/auth/server/auth.ts`
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Consumes: database, authentication callbacks, and admin actions.
- Produces: `recordSecurityEvent(event)`, `enforceRateLimit(key, policy)`, `requireRecentAuthentication(maxAgeSeconds)`, typed `Result<T, E>`, and production security headers.

- [ ] **Step 1: Write failing rate-limit and redaction tests**

```ts
it('locks a login key after five failures in fifteen minutes', async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await limiter.recordFailure('login:owner:network-a', now);
  }
  await expect(limiter.check('login:owner:network-a', now)).rejects.toThrow('RATE_LIMITED');
});

it('never persists credential or token fields in event metadata', async () => {
  await recordSecurityEvent({ type: 'LOGIN_FAILED', metadata: { password: 'secret', token: 'raw' } });
  expect(await lastEvent()).toMatchObject({ metadata: {} });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `pnpm vitest run tests/unit/security tests/integration/security/audit.test.ts`

Expected: FAIL because the limiter and audit recorder do not exist.

- [ ] **Step 3: Implement database-backed security policies**

Use fixed-window records for login and recovery keys so enforcement works across multiple application instances. Policies:

- Password login: 5 failures per account/network key per 15 minutes, then 15-minute lockout.
- TOTP/recovery verification: 5 failures per pending challenge per 10 minutes.
- Password-reset request: 3 submissions per email/network key per hour while preserving neutral responses.
- Sensitive owner actions: recent authentication within 10 minutes.

Hash network identifiers with a rotating server-side pepper before storage. Audit metadata uses an allowlist per event type; never accept arbitrary request objects.

Add a `RateLimitWindow` Prisma model and migration before creating the limiter. It stores a hashed rate-limit key, policy name, window start, failure count, and lock expiry; a unique constraint on `(keyHash, policy, windowStart)` makes concurrent updates deterministic.

- [ ] **Step 4: Add headers and safe error boundaries**

Configure:

- Content-Security-Policy with `default-src 'self'` and explicit directives required by the app.
- `frame-ancestors 'none'`.
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy` disabling camera, microphone, and geolocation.
- HSTS only in production.
- `X-Robots-Tag: noindex, nofollow` for `/admin` and authentication routes.

Public and admin error components show a correlation ID and safe retry action; they never render stack traces, SQL errors, tokens, email-provider payloads, or environment values.

- [ ] **Step 5: Verify security boundaries**

Run:

```bash
pnpm test -- tests/unit/security tests/integration/security/audit.test.ts
pnpm playwright test tests/e2e/security-boundaries.spec.ts
pnpm build
```

Expected: unauthorized access, rate limits, redaction, headers, no-index behaviour, and safe production errors pass.

- [ ] **Step 6: Commit**

```bash
git add next.config.ts prisma src/features/security src/features/auth src/lib/result.ts src/app tests
git commit -m "feat: harden authentication and admin security boundaries"
```

---

### Task 8: Establish CI, Accessibility Checks, and Phase 1 Operations Guide

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `tests/e2e/public-accessibility.spec.ts`
- Create: `tests/e2e/admin-accessibility.spec.ts`
- Create: `docs/operations/local-development.md`
- Create: `docs/operations/owner-bootstrap.md`
- Create: `docs/operations/account-recovery.md`
- Create: `docs/operations/security-checklist.md`
- Modify: `README.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: all Phase 1 commands and routes.
- Produces: one CI workflow, reproducible local setup, owner-bootstrap procedure, controlled recovery procedure, and a recorded Phase 1 verification result.

- [ ] **Step 1: Write accessibility journeys**

Create Playwright tests that run axe against `/`, `/admin/login`, `/admin/verify-2fa`, and `/admin/security`. Assert no serious or critical violations and verify keyboard focus can reach every interactive control in a logical order.

- [ ] **Step 2: Run accessibility tests to expose current failures**

Run: `pnpm playwright test tests/e2e/public-accessibility.spec.ts tests/e2e/admin-accessibility.spec.ts`

Expected: any missing labels, focus indicators, landmark names, or contrast problems fail with the affected selector.

- [ ] **Step 3: Fix only demonstrated accessibility failures**

Adjust the relevant focused component or global token. Repeat the two accessibility test files until they pass; do not suppress axe rules without documenting a standards-based reason in the test.

- [ ] **Step 4: Add the CI workflow**

The workflow must:

1. Use Node.js 24 and pnpm 10.
2. Install with `pnpm install --frozen-lockfile`.
3. Start an isolated PostgreSQL service.
4. Apply migrations to the CI database.
5. Run format check, lint, typecheck, unit/integration tests, production build, and Playwright tests.
6. Run a production-dependency licence check that allows MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, and PostgreSQL licences and fails on GPL/AGPL, unknown, or commercial-only licences unless the owner explicitly approves a reviewed exception.
7. Upload Playwright reports only on failure and never upload `.env` files or database data.

Install `license-checker-rseidelsohn` as a development dependency and add a `licenses:check` package script that applies the stated allowlist to production dependencies.

- [ ] **Step 5: Write operational documentation with exact commands**

Document:

- Local prerequisites and `docker compose` startup.
- Environment generation and which values are secrets.
- Database migration and test commands.
- The owner bootstrap command and the rule that the password must not enter shell history.
- TOTP enrollment and recovery-code storage.
- Normal password reset and session revocation.
- Controlled deployment-level recovery when email and TOTP/recovery codes are both unavailable; it must require database backup, identity confirmation by the operator, session revocation, credential replacement, forced new TOTP enrollment, and a security-event record.
- Dependency-update, backup, restore-test, and secret-rotation checks.
- The approved reusable-component catalogue: Bootstrap/React-Bootstrap for interface primitives, Bootstrap Icons for icons, React Hook Form and Zod for forms, Better Auth for authentication, Prisma for database access, and separately reviewed free libraries for tables, charts, editing, dates, and uploads when those phases begin.

- [ ] **Step 6: Run the complete Phase 1 verification**

Run:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
git status --short
```

Expected: every command succeeds and `git status --short` shows only the documentation and workflow changes for this task.

- [ ] **Step 7: Commit**

```bash
git add .github README.md docs tests package.json pnpm-lock.yaml
git commit -m "ci: verify platform foundation and security journeys"
```

## Phase 1 Completion Gate

Phase 1 is complete only when:

- A clean clone can start PostgreSQL, apply migrations, and run the app using documented commands.
- The public shell renders and is accessible.
- No public sign-up route exists.
- Exactly one configured owner can authenticate with password and TOTP.
- First login requires TOTP enrollment and recovery-code acknowledgement.
- Password change, password reset, session revocation, inactivity expiry, and absolute expiry pass automated tests.
- Reset-token expiry, reuse prevention, hashed storage, second-factor verification, and neutral responses pass automated tests.
- Admin authorization is enforced on the server, not only in proxy or client code.
- Security events and rate limits work across application instances through PostgreSQL.
- CI runs formatting, linting, type checking, unit/integration tests, build, accessibility checks, and end-to-end tests.
- The working tree is clean and every task has a focused commit.
