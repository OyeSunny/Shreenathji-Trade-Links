import { PrismaClient } from '@/generated/prisma/client';
import { env } from '@/lib/env';
import { PrismaPg } from '@prisma/adapter-pg';
import 'server-only';

const globalForDatabase = globalThis as unknown as {
  database?: PrismaClient;
};

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const db = globalForDatabase.database ?? new PrismaClient({ adapter });

if (env.NODE_ENV !== 'production') {
  globalForDatabase.database = db;
}
