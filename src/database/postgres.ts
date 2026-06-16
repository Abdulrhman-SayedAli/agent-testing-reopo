import { Pool } from 'pg';
import type { PoolClient, QueryResult, QueryResultRow } from 'pg';

import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

const databasePool = new Pool({
  connectionString: config.database.url,
  max: config.database.poolMax,
  idleTimeoutMillis: config.database.idleTimeoutMs,
  connectionTimeoutMillis: config.database.connectionTimeoutMs,
  ssl: config.database.ssl
    ? { rejectUnauthorized: config.database.sslRejectUnauthorized }
    : undefined,
});

databasePool.on('error', (error) => {
  logger.error({ err: error }, 'Unexpected PostgreSQL pool error');
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values?: unknown[],
): Promise<QueryResult<T>> {
  return databasePool.query<T>(text, values);
}

export async function withDatabaseClient<T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await databasePool.connect();

  try {
    return await callback(client);
  } finally {
    client.release();
  }
}

export async function verifyDatabaseConnection(): Promise<void> {
  const startedAt = Date.now();

  try {
    await query('SELECT 1');

    logger.info(
      {
        durationMs: Date.now() - startedAt,
        poolMax: config.database.poolMax,
      },
      'PostgreSQL connection verified',
    );
  } catch (error) {
    logger.error({ err: error }, 'PostgreSQL connection verification failed');
    throw error;
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  await databasePool.end();
  logger.info('PostgreSQL connection pool closed');
}

export { databasePool };
