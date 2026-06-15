import { Router } from 'express';

import { env } from '../config/env.js';

export const healthRouter = Router();

healthRouter.get('/health', (_request, response) => {
  response.status(200).json({
    status: 'ok',
    service: env.appName,
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});
