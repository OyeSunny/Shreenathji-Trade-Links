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

3. Edit `.env` before continuing. Set a unique `POSTGRES_PASSWORD`, use the same value in `DATABASE_URL`, and set `BETTER_AUTH_SECRET` to a cryptographically random value of at least 32 characters. Do not commit this file.

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
