import argon2 from 'argon2';
import 'server-only';

const passwordOptions = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

export const hashOwnerPassword = (password: string) =>
  argon2.hash(password, passwordOptions);

export const verifyOwnerPassword = async (hash: string, password: string) => {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
};
