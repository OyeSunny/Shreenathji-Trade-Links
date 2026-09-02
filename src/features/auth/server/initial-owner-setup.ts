import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { timingSafeEqual } from 'node:crypto';
import 'server-only';
import { bootstrapOwner } from './owner-bootstrap';

const tokenMatches = (providedToken: string, expectedToken: string) => {
  const provided = Buffer.from(providedToken);
  const expected = Buffer.from(expectedToken);

  return (
    provided.length === expected.length && timingSafeEqual(provided, expected)
  );
};

export const isInitialOwnerSetupAvailable = async () =>
  (await db.user.count()) === 0;

export const completeInitialOwnerSetup = async ({
  password,
  setupToken,
}: {
  password: string;
  setupToken: string;
}) => {
  const expectedToken = env.OWNER_SETUP_TOKEN;

  if (!expectedToken || !tokenMatches(setupToken, expectedToken)) {
    throw new Error('INITIAL_SETUP_DENIED');
  }

  if (!(await isInitialOwnerSetupAvailable())) {
    throw new Error('INITIAL_SETUP_UNAVAILABLE');
  }

  return bootstrapOwner({ email: env.OWNER_EMAIL, password });
};
