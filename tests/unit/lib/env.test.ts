import { parseEnv } from '@/lib/env';

const validEnvironment = {
  NODE_ENV: 'test',
  DATABASE_URL:
    'postgresql://postgres:postgres@localhost:5432/shreenathji_test',
  BETTER_AUTH_SECRET: 'x'.repeat(48),
  BETTER_AUTH_URL: 'http://localhost:3000',
  OWNER_EMAIL: 'owner@example.com',
  MAIL_FROM: 'website@example.com',
};

describe('parseEnv', () => {
  it('returns normalized validated settings for a complete server environment', () => {
    expect(parseEnv(validEnvironment)).toMatchObject({
      DATABASE_URL: validEnvironment.DATABASE_URL,
      OWNER_EMAIL: 'owner@example.com',
      MAIL_FROM: 'website@example.com',
    });
  });

  it('rejects a malformed database URL instead of starting with invalid configuration', () => {
    expect(() =>
      parseEnv({ ...validEnvironment, DATABASE_URL: 'invalid' }),
    ).toThrow();
  });

  it('rejects a non-PostgreSQL URL for the database connection', () => {
    expect(() =>
      parseEnv({
        ...validEnvironment,
        DATABASE_URL: 'https://database.example.com',
      }),
    ).toThrow();
  });

  it('rejects an authentication secret shorter than 32 characters', () => {
    expect(() =>
      parseEnv({ ...validEnvironment, BETTER_AUTH_SECRET: 'too-short' }),
    ).toThrow();
  });

  it('rejects the documented placeholder secret', () => {
    expect(() =>
      parseEnv({
        ...validEnvironment,
        BETTER_AUTH_SECRET:
          'replace-with-a-random-secret-of-at-least-32-characters',
      }),
    ).toThrow();
  });

  it('requires complete private SMTP settings when email delivery is configured', () => {
    expect(() =>
      parseEnv({
        ...validEnvironment,
        SMTP_HOST: 'smtp.gmail.com',
        SMTP_PORT: '465',
        SMTP_USER: 'sunnybunny966@gmail.com',
      }),
    ).toThrow();

    expect(
      parseEnv({
        ...validEnvironment,
        SMTP_HOST: 'smtp.gmail.com',
        SMTP_PORT: '465',
        SMTP_USER: 'sunnybunny966@gmail.com',
        SMTP_PASSWORD: 'a-private-app-password',
      }),
    ).toMatchObject({
      SMTP_HOST: 'smtp.gmail.com',
      SMTP_PORT: 465,
      SMTP_USER: 'sunnybunny966@gmail.com',
    });
  });

  it('allows the optional contact-notification inbox to be left blank', () => {
    expect(
      parseEnv({ ...validEnvironment, CONTACT_NOTIFICATION_TO: '' }),
    ).toMatchObject({ CONTACT_NOTIFICATION_TO: undefined });
  });
});
