# Application Configuration

The backend loads environment variables through `src/config/env.ts`. Application code should import `config` from that module instead of reading `process.env` directly.

## Local setup

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

Then review every value before starting the API. The example file uses safe local service URLs and placeholder secrets. Keep real `.env` files out of commits.

## Required values

These values must be present when the application starts:

- `DATABASE_URL`: PostgreSQL connection string.
- `REDIS_URL`: Redis connection string.
- `JWT_ACCESS_SECRET`: access token signing secret, at least 32 characters.
- `JWT_REFRESH_SECRET`: refresh token signing secret, at least 32 characters.
- `CORS_ORIGIN`: browser origin allowed to call the API.

Production startup rejects authentication secrets that still use the `replace-with-*` placeholder format.

## Safe defaults

The config module provides local defaults for operational values where the fallback is safe:

- `NODE_ENV=development`
- `PORT=3000`
- `APP_NAME=safari-social-api`
- `API_PREFIX=/api/v1`
- `LOG_LEVEL=info`
- `RATE_LIMIT_WINDOW_MS=60000`
- `RATE_LIMIT_MAX_REQUESTS=100`
- `UPLOAD_MAX_FILE_SIZE_MB=10`

Invalid numbers, unsupported log levels, malformed URLs, and missing required values fail startup with a clear error.

## Config sections

The exported `config` object is grouped by responsibility:

- `config.app`
- `config.database`
- `config.auth`
- `config.cache`
- `config.security`
- `config.logging`
- `config.storage`
