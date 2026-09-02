import { vi } from 'vitest';

const authApi = vi.hoisted(() => ({
  getSession: vi.fn(),
}));

vi.mock('@/features/auth/server/auth', () => ({
  auth: { api: authApi },
}));

vi.mock('@/lib/env', () => ({
  env: { OWNER_EMAIL: 'owner@example.com' },
}));

import { getOwnerSession, requireOwnerApiSession } from '@/features/auth/server/session';

const requestHeaders = new Headers();
const now = new Date();

describe('getOwnerSession', () => {
  beforeEach(() => {
    authApi.getSession.mockReset();
  });

  it('returns the current owner session', async () => {
    authApi.getSession.mockResolvedValue({
      user: { email: 'OWNER@example.com' },
      session: { createdAt: now, updatedAt: now },
    });

    await expect(getOwnerSession(requestHeaders)).resolves.toMatchObject({
      user: { email: 'OWNER@example.com' },
    });
    expect(authApi.getSession).toHaveBeenCalledWith({
      headers: requestHeaders,
      query: { disableCookieCache: true },
    });
  });

  it('rejects missing, non-owner, idle, and absolutely expired sessions', async () => {
    authApi.getSession.mockResolvedValue(null);
    await expect(getOwnerSession(requestHeaders)).resolves.toBeNull();

    authApi.getSession.mockResolvedValue({
      user: { email: 'visitor@example.com' },
      session: { createdAt: now, updatedAt: now },
    });
    await expect(getOwnerSession(requestHeaders)).resolves.toBeNull();

    authApi.getSession.mockResolvedValue({
      user: { email: 'owner@example.com' },
      session: {
        createdAt: now,
        updatedAt: new Date(now.getTime() - 30 * 60 * 1000 - 1),
      },
    });
    await expect(getOwnerSession(requestHeaders)).resolves.toBeNull();

    authApi.getSession.mockResolvedValue({
      user: { email: 'owner@example.com' },
      session: {
        createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000 - 1),
        updatedAt: now,
      },
    });
    await expect(getOwnerSession(requestHeaders)).resolves.toBeNull();
  });

  it('provides a typed unauthorized result for API callers', async () => {
    authApi.getSession.mockResolvedValue(null);

    await expect(requireOwnerApiSession(requestHeaders)).resolves.toEqual({
      ok: false,
      status: 401,
    });
  });
});
