import type { Server } from 'node:http';

import { createApp } from './app.js';
import { config } from './config/env.js';
import {
  closeDatabaseConnection,
  verifyDatabaseConnection,
} from './database/postgres.js';
import { logger } from './utils/logger.js';

const app = createApp();

let server: Server | undefined;
let isShuttingDown = false;

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  logger.info({ signal }, 'Graceful shutdown started');

  await new Promise<void>((resolve, reject) => {
    if (!server) {
      resolve();
      return;
    }

    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  await closeDatabaseConnection();
  logger.info('Graceful shutdown completed');
}

async function bootstrap(): Promise<void> {
  await verifyDatabaseConnection();

  server = app.listen(config.app.port, () => {
    logger.info(
      { port: config.app.port, environment: config.app.nodeEnv },
      'API server started',
    );
  });
}

process.once('SIGINT', (signal) => {
  void shutdown(signal)
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error({ error }, 'Graceful shutdown failed');
      process.exit(1);
    });
});

process.once('SIGTERM', (signal) => {
  void shutdown(signal)
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error({ error }, 'Graceful shutdown failed');
      process.exit(1);
    });
});

void bootstrap().catch((error) => {
  logger.error({ error }, 'API server startup failed');
  process.exit(1);
});
