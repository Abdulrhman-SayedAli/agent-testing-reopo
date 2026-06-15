import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';

describe('health route', () => {
  it('returns a healthy response', async () => {
    const response = await request(createApp()).get('/health').expect(200);

    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'safari-social-api',
      environment: 'test',
    });
    expect(response.body.timestamp).toEqual(expect.any(String));
  });
});
