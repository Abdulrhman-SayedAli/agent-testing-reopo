const testEnvironment = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/safari_social_test',
  REDIS_URL: 'redis://localhost:6379',
  JWT_ACCESS_SECRET: 'test-access-secret-with-at-least-32-chars',
  JWT_REFRESH_SECRET: 'test-refresh-secret-with-at-least-32-chars',
  CORS_ORIGIN: 'http://localhost:3000',
} as const;

for (const [key, value] of Object.entries(testEnvironment)) {
  process.env[key] ??= value;
}
