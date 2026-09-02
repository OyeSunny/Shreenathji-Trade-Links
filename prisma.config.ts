import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const localGenerationUrl =
  'postgresql://postgres:postgres@127.0.0.1:54329/shreenathji_test';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? localGenerationUrl,
  },
});
