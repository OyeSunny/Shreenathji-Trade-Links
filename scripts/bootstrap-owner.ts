import { bootstrapOwner } from '@/features/auth/server/owner-bootstrap';

const password = process.env.OWNER_BOOTSTRAP_PASSWORD;

if (!password) {
  throw new Error('Set OWNER_BOOTSTRAP_PASSWORD for this command only');
}

const run = async () => {
  try {
    const result = await bootstrapOwner({
      email: process.env.OWNER_EMAIL ?? '',
      password,
    });

    process.stdout.write(`Owner bootstrap ${result}.\n`);
  } finally {
    delete process.env.OWNER_BOOTSTRAP_PASSWORD;
  }
};

void run();
