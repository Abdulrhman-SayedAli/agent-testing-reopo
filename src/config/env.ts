import 'dotenv/config';

type NodeEnv = 'development' | 'test' | 'production';

function numberFromEnv(name: string, fallback: number): number {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  const parsed = Number(rawValue);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

  return parsed;
}

function nodeEnvFromEnv(): NodeEnv {
  const value = process.env.NODE_ENV ?? 'development';

  if (value === 'development' || value === 'test' || value === 'production') {
    return value;
  }

  throw new Error('NODE_ENV must be one of development, test, or production');
}

export const env = {
  nodeEnv: nodeEnvFromEnv(),
  port: numberFromEnv('PORT', 3000),
  appName: process.env.APP_NAME ?? 'safari-social-api',
  apiPrefix: process.env.API_PREFIX ?? '/api/v1',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
};
