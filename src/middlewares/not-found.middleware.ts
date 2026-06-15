import type { RequestHandler } from 'express';

import { HttpStatus } from '../common/http-status.js';

export const notFoundHandler: RequestHandler = (request, response) => {
  response.status(HttpStatus.NOT_FOUND).json({
    error: {
      code: 'not_found',
      message: `Route ${request.method} ${request.path} was not found.`,
    },
  });
};
