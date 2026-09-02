import { vi } from 'vitest';

const database = vi.hoisted(() => ({
  query: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
}));

vi.mock('@/lib/db', () => ({
  db: { $queryRaw: database.query },
}));

import { GET } from '@/app/api/health/route';

describe('health route', () => {
  it('returns only an ok status after the database responds', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: 'ok' });
    expect(database.query).toHaveBeenCalledTimes(1);
  });
});
