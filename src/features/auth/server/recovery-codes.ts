import { createHash, randomBytes } from 'node:crypto';
import 'server-only';

const recoveryCodeCount = 10;

export const normalizeRecoveryCode = (code: string) =>
  code.replace(/[^a-z0-9]/gi, '').toUpperCase();

export const hashRecoveryCode = (code: string) =>
  createHash('sha256').update(normalizeRecoveryCode(code)).digest('hex');

export const createRecoveryCodes = () =>
  Array.from({ length: recoveryCodeCount }, () =>
    randomBytes(18).toString('base64url'),
  );
