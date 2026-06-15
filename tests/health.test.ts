import { describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';

describe('health route', () => {
  it('creates the application with the health route registered', () => {
    const app = createApp();
    const registeredPaths = app._router.stack
      .filter((layer: { route?: { path?: string } }) => layer.route?.path)
      .map((layer: { route: { path: string } }) => layer.route.path);

    expect(registeredPaths).toContain('/health');
  });
});
