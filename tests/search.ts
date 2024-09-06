import { describe, it, expect } from 'vitest';
import { searchRoutes } from '../routes/search';
import { mockRequest, mockEnvironment } from 'hono-testing';

describe('Search API', () => {
  it('should return a list of UNSPSC codes for a valid code number', async () => {
    const req = mockRequest({
      method: 'GET',
      url: '/api/search/number/10000000',
    });

    const env = mockEnvironment({
      DB: /* mock D1 database connection */
    });

    const res = await searchRoutes.handle(req, env);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(1);  // Based on seeded data
  });
});
