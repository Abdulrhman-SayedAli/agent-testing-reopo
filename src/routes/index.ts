import type { Express } from 'express';

import { config } from '../config/env.js';
import { healthRouter } from './health.routes.js';

export function registerRoutes(app: Express) {
  app.use(healthRouter);

  app.get(config.app.apiPrefix, (_request, response) => {
    response.json({
      service: config.app.appName,
      version: 'v1',
    });
  });
}
