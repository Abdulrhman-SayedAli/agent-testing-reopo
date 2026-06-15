import { createApp } from './app.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';

const app = createApp();

app.listen(config.app.port, () => {
  logger.info(
    { port: config.app.port, environment: config.app.nodeEnv },
    'API server started',
  );
});
