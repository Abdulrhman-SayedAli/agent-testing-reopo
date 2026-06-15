import 'dotenv/config';

type NodeEnv = 'development' | 'test' | 'production';
type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';

type AppConfig = Readonly<{
  app: {
    nodeEnv: NodeEnv;
    port: number;
    appName: string;
    apiPrefix: string;
  };
  database: {
    url: string;
  };
  auth: {
    accessTokenSecret: string;
    refreshTokenSecret: string;
  };
  cache: {
    redisUrl: string;
  };
  security: {
    corsOrigin: string;
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
  };
  logging: {
    level: LogLevel;
  };
  storage: {
    uploadMaxFileSizeMb: number;
    uploadMaxFileSizeBytes: number;
  };
}>;

const LOG_LEVELS: readonly LogLevel[] = [
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
  'silent',
];

function readRequiredString(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readString(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

function readPositiveInteger(name: string, fallback: number): number {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return fallback;
  }

  const parsed = Number(rawValue);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

  return parsed;
}

function readNodeEnv(): NodeEnv {
  const value = readString('NODE_ENV', 'development');

  if (value === 'development' || value === 'test' || value === 'production') {
    return value;
  }

  throw new Error('NODE_ENV must be one of development, test, or production');
}

function readLogLevel(): LogLevel {
  const value = readString('LOG_LEVEL', 'info');

  if (LOG_LEVELS.includes(value as LogLevel)) {
    return value as LogLevel;
  }

  throw new Error(`LOG_LEVEL must be one of ${LOG_LEVELS.join(', ')}`);
}

function readUrl(name: string): string {
  const value = readRequiredString(name);

  try {
    new URL(value);
  } catch {
    throw new Error(`${name} must be a valid URL`);
  }

  return value;
}

function readApiPrefix(): string {
  const value = readString('API_PREFIX', '/api/v1');

  if (!value.startsWith('/')) {
    throw new Error('API_PREFIX must start with /');
  }

  return value;
}

function rejectPlaceholderSecret(name: string, value: string, nodeEnv: NodeEnv): string {
  if (nodeEnv === 'production' && value.startsWith('replace-with-')) {
    throw new Error(`${name} must be replaced before running in production`);
  }

  if (value.length < 32) {
    throw new Error(`${name} must be at least 32 characters long`);
  }

  return value;
}

const nodeEnv = readNodeEnv();
const uploadMaxFileSizeMb = readPositiveInteger('UPLOAD_MAX_FILE_SIZE_MB', 10);

export const config: AppConfig = Object.freeze({
  app: {
    nodeEnv,
    port: readPositiveInteger('PORT', 3000),
    appName: readString('APP_NAME', 'safari-social-api'),
    apiPrefix: readApiPrefix(),
  },
  database: {
    url: readUrl('DATABASE_URL'),
  },
  auth: {
    accessTokenSecret: rejectPlaceholderSecret(
      'JWT_ACCESS_SECRET',
      readRequiredString('JWT_ACCESS_SECRET'),
      nodeEnv,
    ),
    refreshTokenSecret: rejectPlaceholderSecret(
      'JWT_REFRESH_SECRET',
      readRequiredString('JWT_REFRESH_SECRET'),
      nodeEnv,
    ),
  },
  cache: {
    redisUrl: readUrl('REDIS_URL'),
  },
  security: {
    corsOrigin: readUrl('CORS_ORIGIN'),
    rateLimitWindowMs: readPositiveInteger('RATE_LIMIT_WINDOW_MS', 60_000),
    rateLimitMaxRequests: readPositiveInteger('RATE_LIMIT_MAX_REQUESTS', 100),
  },
  logging: {
    level: readLogLevel(),
  },
  storage: {
    uploadMaxFileSizeMb,
    uploadMaxFileSizeBytes: uploadMaxFileSizeMb * 1024 * 1024,
  },
});
