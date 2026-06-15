import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

import { config } from './config/env.js';
import { errorHandler } from './middlewares/error-handler.middleware.js';
import { notFoundHandler } from './middlewares/not-found.middleware.js';
import { registerRoutes } from './routes/index.js';
import { logger } from './utils/logger.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.security.corsOrigin }));
  app.use(express.json({ limit: `${config.storage.uploadMaxFileSizeMb}mb` }));
  app.use(pinoHttp({ logger }));

  registerRoutes(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
