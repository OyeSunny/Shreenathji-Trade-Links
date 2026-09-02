import { auth } from '@/features/auth/server/auth';
import { env } from '@/lib/env';
import 'server-only';

const maximumIdleDurationMs = 30 * 60 * 1000;
const maximumAbsoluteDurationMs = 12 * 60 * 60 * 1000;

const normalizedEmail = (email: string) => email.trim().toLowerCase();

export const getOwnerSession = async (headers: Headers) => {
  const result = await auth.api.getSession({ headers });

  if (!result || normalizedEmail(result.user.email) !== env.OWNER_EMAIL) {
    return null;
  }

  const now = Date.now();
  const createdAt = new Date(result.session.createdAt).getTime();
  const lastActivityAt = new Date(result.session.updatedAt).getTime();

  if (
    !Number.isFinite(createdAt) ||
    !Number.isFinite(lastActivityAt) ||
    now - createdAt > maximumAbsoluteDurationMs ||
    now - lastActivityAt > maximumIdleDurationMs
  ) {
    return null;
  }

  return result;
};
