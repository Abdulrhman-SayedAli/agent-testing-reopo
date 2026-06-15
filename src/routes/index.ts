import type { Express } from 'express';

import { env } from '../config/env.js';
import { healthRouter } from './health.routes.js';

export function registerRoutes(app: Express) {
  app.use(healthRouter);

  app.get(env.apiPrefix, (_request, response) => {
    response.json({
      service: env.appName,
      version: 'v1',
    });
  });
}
