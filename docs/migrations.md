# Database Migrations

Database migrations are TypeScript files under `src/database/migrations`. They run through `scripts/database/migrate.ts` using the shared PostgreSQL pool from `src/database/postgres.ts`.

## Commands

Run migrations against the database in `DATABASE_URL`:

```bash
npm run db:migrate
```

Roll back the most recently applied migration:

```bash
npm run db:rollback
```

Show applied and pending migration state:

```bash
npm run db:status
```

The migration runner creates and maintains a `schema_migrations` table in PostgreSQL. Each applied migration is recorded by version, name, and timestamp.

## Docker workflow

For the local Docker database, start PostgreSQL first:

```bash
docker compose up -d postgres
npm run db:migrate
```

To run migrations while the full stack is running:

```bash
docker compose up -d
npm run db:migrate
```

The host process uses the host-based `DATABASE_URL` from `.env`, while the API container uses the Docker-network URL supplied by `docker-compose.yml`.

## Naming convention

Migration files must use this format:

```text
000001_descriptive_name.ts
```

Rules:

- Use a six-digit increasing version prefix.
- Use lowercase snake_case for the descriptive name.
- Export `version`, `name`, `up`, and `down`.
- The filename must match the exported `version` and `name`.
- Keep migrations deterministic: do not depend on wall-clock time, random values, or external services for schema changes.

Example skeleton:

```ts
import type { PoolClient } from 'pg';

export const version = '000002';
export const name = 'create_users_table';

export async function up(client: PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE users (
      id uuid PRIMARY KEY
    )
  `);
}

export async function down(client: PoolClient): Promise<void> {
  await client.query('DROP TABLE users');
}
```

## Review expectations

Schema changes should be reviewed with the feature code that depends on them. Every migration should include a rollback unless the change is intentionally irreversible and the PR explains why.

Migrations run inside a transaction. If a migration fails, the transaction is rolled back, the migration is not recorded in `schema_migrations`, and the command exits with a non-zero status.
