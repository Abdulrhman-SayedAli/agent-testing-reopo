import { Router } from 'express';

import { config } from '../config/env.js';

export const healthRouter = Router();

healthRouter.get('/health', (_request, response) => {
  response.status(200).json({
    status: 'ok',
    service: config.app.appName,
    environment: config.app.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});
