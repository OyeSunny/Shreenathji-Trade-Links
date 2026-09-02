# Shreenathji Trade Links

A B2B industrial-materials catalogue and enquiry platform, with a secured owner-managed administration area.

## Local setup

Requirements: Node.js 24, pnpm 10, and Docker with Compose.

1. Install the project packages:

   ```bash
   pnpm install --frozen-lockfile
   ```

2. Create your local, untracked environment file:

   ```bash
   cp .env.example .env
   ```

3. Edit `.env` before continuing:

   - Set a unique, URL-safe `POSTGRES_PASSWORD` and use the same value in `DATABASE_URL`. If the password contains URL-reserved characters such as `@`, `:`, `/`, or `#`, percent-encode it in `DATABASE_URL`.
   - Set `BETTER_AUTH_SECRET` to a cryptographically random value of at least 32 characters.
   - Replace `OWNER_EMAIL` and `MAIL_FROM` with the real owner and sender addresses, and set `BETTER_AUTH_URL` to the local or production site URL as appropriate.
   - Set `OWNER_SETUP_TOKEN` to a separate random value of at least 32 characters. This protects the one-time owner-account creation screen; keep it private and remove it from the hosting secret manager after setup is complete if you do not need to recreate the database.

   Do not commit this file.

4. Start the local PostgreSQL database, bound only to your machine:

   ```bash
   docker compose up -d postgres
   ```

5. Apply the committed database migrations:

   ```bash
   pnpm prisma migrate deploy
   ```

6. Start the site:

   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000). The health endpoint is available at `/api/health` after the database is running.

### Create the first owner account

Only while the database has no users, open `/admin/first-time-setup`. Enter the private `OWNER_SETUP_TOKEN`, choose the owner password, then sign in and complete the required authenticator-app setup. The owner email is the `OWNER_EMAIL` value from `.env`; there is no public registration and a second administrator cannot be created through the website.

## Quality checks

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm format:check
pnpm build
```

`pnpm dev`, `pnpm test`, and `pnpm build` generate the untracked Prisma client automatically. The live database integration test is opt-in with `RUN_DATABASE_TESTS=1` and a test-database `DATABASE_URL`.

## Deployment

Use `pnpm prisma migrate deploy` as part of each deployment before running the production application. Provide all environment variables from `.env.example` through the hosting platform's secret manager, run `pnpm build` followed by `pnpm start`, and never expose the PostgreSQL port directly to the public internet.
