import { GET } from '@/app/api/health/route';

const databaseTestsEnabled = process.env.RUN_DATABASE_TESTS === '1';

describe.skipIf(!databaseTestsEnabled)('health route with PostgreSQL', () => {
  it('returns ok when the configured database is reachable', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: 'ok' });
  });
});
