import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import type { PoolClient } from 'pg';

import {
  closeDatabaseConnection,
  withDatabaseClient,
} from '../../src/database/postgres.js';
import { logger } from '../../src/utils/logger.js';

type Migration = Readonly<{
  version: string;
  name: string;
  up: (client: PoolClient) => Promise<void>;
  down: (client: PoolClient) => Promise<void>;
}>;

type AppliedMigration = Readonly<{
  version: string;
  name: string;
  applied_at: Date;
}>;

type MigrationStatus = Readonly<{
  version: string;
  name: string;
  appliedAt: Date | null;
}>;

const MIGRATIONS_TABLE = 'schema_migrations';
const MIGRATIONS_DIRECTORY = path.resolve('src/database/migrations');

async function ensureMigrationsTable(client: PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      version text PRIMARY KEY,
      name text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

async function loadMigrations(): Promise<Migration[]> {
  const filenames = (await readdir(MIGRATIONS_DIRECTORY))
    .filter((filename) => /^\d{6}_[a-z0-9_]+\.ts$/.test(filename))
    .sort();

  const migrations = await Promise.all(
    filenames.map(async (filename) => {
      const moduleUrl = pathToFileURL(path.join(MIGRATIONS_DIRECTORY, filename)).href;
      const migration = (await import(moduleUrl)) as Partial<Migration>;

      if (
        typeof migration.version !== 'string' ||
        typeof migration.name !== 'string' ||
        typeof migration.up !== 'function' ||
        typeof migration.down !== 'function'
      ) {
        throw new Error(`${filename} must export version, name, up, and down`);
      }

      const expectedPrefix = `${migration.version}_${migration.name}`;
      const actualPrefix = filename.replace(/\.ts$/, '');

      if (actualPrefix !== expectedPrefix) {
        throw new Error(
          `${filename} must match exported migration id ${expectedPrefix}`,
        );
      }

      return migration as Migration;
    }),
  );

  const versions = new Set<string>();

  for (const migration of migrations) {
    if (versions.has(migration.version)) {
      throw new Error(`Duplicate migration version: ${migration.version}`);
    }

    versions.add(migration.version);
  }

  return migrations;
}

async function getAppliedMigrations(
  client: PoolClient,
): Promise<Map<string, AppliedMigration>> {
  const result = await client.query<AppliedMigration>(`
    SELECT version, name, applied_at
    FROM ${MIGRATIONS_TABLE}
    ORDER BY version ASC
  `);

  return new Map(result.rows.map((migration) => [migration.version, migration]));
}

async function migrateUp(): Promise<void> {
  await withDatabaseClient(async (client) => {
    await ensureMigrationsTable(client);

    const migrations = await loadMigrations();
    const appliedMigrations = await getAppliedMigrations(client);
    const pendingMigrations = migrations.filter(
      (migration) => !appliedMigrations.has(migration.version),
    );

    if (pendingMigrations.length === 0) {
      logger.info('No pending database migrations');
      return;
    }

    for (const migration of pendingMigrations) {
      logger.info(
        { version: migration.version, name: migration.name },
        'Applying database migration',
      );

      await client.query('BEGIN');

      try {
        await migration.up(client);
        await client.query(
          `INSERT INTO ${MIGRATIONS_TABLE} (version, name) VALUES ($1, $2)`,
          [migration.version, migration.name],
        );
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        logger.error(
          { err: error, version: migration.version, name: migration.name },
          'Database migration failed',
        );
        throw error;
      }
    }
  });
}

async function rollbackLatest(): Promise<void> {
  await withDatabaseClient(async (client) => {
    await ensureMigrationsTable(client);

    const migrations = await loadMigrations();
    const appliedMigrations = await getAppliedMigrations(client);
    const latestAppliedMigration = [...appliedMigrations.values()].at(-1);

    if (!latestAppliedMigration) {
      logger.info('No applied database migrations to roll back');
      return;
    }

    const migration = migrations.find(
      (candidate) => candidate.version === latestAppliedMigration.version,
    );

    if (!migration) {
      throw new Error(
        `Applied migration ${latestAppliedMigration.version} is missing locally`,
      );
    }

    logger.info(
      { version: migration.version, name: migration.name },
      'Rolling back database migration',
    );

    await client.query('BEGIN');

    try {
      await migration.down(client);
      await client.query(`DELETE FROM ${MIGRATIONS_TABLE} WHERE version = $1`, [
        migration.version,
      ]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(
        { err: error, version: migration.version, name: migration.name },
        'Database migration rollback failed',
      );
      throw error;
    }
  });
}

async function getMigrationStatus(): Promise<MigrationStatus[]> {
  return withDatabaseClient(async (client) => {
    await ensureMigrationsTable(client);

    const migrations = await loadMigrations();
    const appliedMigrations = await getAppliedMigrations(client);

    return migrations.map((migration) => ({
      version: migration.version,
      name: migration.name,
      appliedAt: appliedMigrations.get(migration.version)?.applied_at ?? null,
    }));
  });
}

async function printMigrationStatus(): Promise<void> {
  const statuses = await getMigrationStatus();

  if (statuses.length === 0) {
    console.log('No database migrations found.');
    return;
  }

  for (const status of statuses) {
    const state = status.appliedAt
      ? `applied at ${status.appliedAt.toISOString()}`
      : 'pending';

    console.log(`${status.version}_${status.name}: ${state}`);
  }
}

async function main(): Promise<void> {
  const command = process.argv[2];

  if (command === 'up') {
    await migrateUp();
    return;
  }

  if (command === 'rollback') {
    await rollbackLatest();
    return;
  }

  if (command === 'status') {
    await printMigrationStatus();
    return;
  }

  throw new Error('Usage: tsx scripts/database/migrate.ts <up|rollback|status>');
}

void (async () => {
  try {
    await main();
  } catch (error) {
    logger.error({ err: error }, 'Database migration command failed');
    process.exitCode = 1;
  } finally {
    await closeDatabaseConnection();
  }
})();
