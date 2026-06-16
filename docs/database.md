# Database Connection

The backend uses the `pg` PostgreSQL client through `src/database/postgres.ts`. Feature modules should use the exported helpers instead of creating their own pools.

## Connection provider

The database module exports:

- `databasePool`: shared PostgreSQL pool for advanced infrastructure use cases.
- `query(text, values)`: convenience helper for one-off SQL queries.
- `withDatabaseClient(callback)`: checks out a pooled client and always releases it.
- `verifyDatabaseConnection()`: startup validation used before the API starts listening.
- `closeDatabaseConnection()`: graceful shutdown hook that closes the pool.

## Startup and shutdown

`src/server.ts` verifies PostgreSQL connectivity with `SELECT 1` before opening the HTTP listener. If the database is unreachable, startup fails and the error is logged through the centralized logger.

The server listens for `SIGINT` and `SIGTERM`, closes the HTTP server, then drains the PostgreSQL pool. This keeps local Docker restarts and future deployment shutdowns predictable.

## Local host connection

When running the API directly on the host with `npm run dev`, use the host-based `DATABASE_URL` from `.env.example`:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/safari_social
```

## Docker connection

When running through Docker Compose, `docker-compose.yml` overrides `DATABASE_URL` for the API container so it connects over the Docker network:

```bash
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
```

The `postgres` hostname is the Compose service name. PostgreSQL data persists in the `postgres_data` Docker volume until you remove it with `docker compose down --volumes`.

## Pool settings

The pool is configured from environment variables:

- `DATABASE_POOL_MAX`: maximum number of clients in the pool. Defaults to `10`.
- `DATABASE_IDLE_TIMEOUT_MS`: how long an idle client stays open. Defaults to `30000`.
- `DATABASE_CONNECTION_TIMEOUT_MS`: how long to wait for a new connection. Defaults to `5000`.
- `DATABASE_SSL`: enables PostgreSQL SSL when set to `true`. Defaults to `false`.
- `DATABASE_SSL_REJECT_UNAUTHORIZED`: controls certificate validation when SSL is enabled. Defaults to `true`.

## Migrations

Schema changes are versioned through the migration framework documented in `docs/migrations.md`. Use `npm run db:migrate`, `npm run db:rollback`, and `npm run db:status` for local migration work.

Keep credentials in `.env` or the deployment secret manager. Do not hardcode database usernames, passwords, or URLs in application code.
