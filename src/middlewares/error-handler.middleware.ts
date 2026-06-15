import type { ErrorRequestHandler } from 'express';

import { HttpStatus } from '../common/http-status.js';
import { logger } from '../utils/logger.js';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  logger.error({ error }, 'Unhandled request error');

  response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    error: {
      code: 'internal_server_error',
      message: 'An unexpected error occurred.',
    },
  });
};
