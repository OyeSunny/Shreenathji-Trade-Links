import '@testing-library/jest-dom/vitest';

const testEnvironment = process.env as Record<string, string | undefined>;

testEnvironment.NODE_ENV = 'test';
testEnvironment.DATABASE_URL ??=
  'postgresql://postgres:postgres@127.0.0.1:54329/shreenathji_test';
testEnvironment.BETTER_AUTH_SECRET ??= 'x'.repeat(48);
testEnvironment.BETTER_AUTH_URL ??= 'http://localhost:3000';
testEnvironment.OWNER_EMAIL ??= 'owner@example.com';
testEnvironment.MAIL_FROM ??= 'website@example.com';
