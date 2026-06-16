import type { PoolClient } from 'pg';

export const version = '000001';
export const name = 'baseline';

export async function up(_client: PoolClient): Promise<void> {
  // Baseline migration for repositories that start before business tables exist.
}

export async function down(_client: PoolClient): Promise<void> {
  // Nothing to roll back until schema migrations introduce database objects.
}
