import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./config/database', () => ({
  connectDatabase: vi.fn(),
  disconnectDatabase: vi.fn(),
  getDatabaseState: vi.fn(() => 'connected'),
  pingDatabase: vi.fn(),
}));

import { createApp } from './app';
import { pingDatabase } from './config/database';

const app = createApp();

describe('health endpoints', () => {
  beforeEach(() => {
    vi.mocked(pingDatabase).mockReset();
  });

  it('GET /api/v1/health reports liveness without touching the database', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ success: true, data: { status: 'ok' } });
    expect(typeof response.body.data.uptimeSeconds).toBe('number');
    expect(pingDatabase).not.toHaveBeenCalled();
  });

  it('GET /api/v1/health/ready returns 200 when the database answers', async () => {
    vi.mocked(pingDatabase).mockResolvedValue(true);

    const response = await request(app).get('/api/v1/health/ready');

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ status: 'ready', checks: { database: { status: 'up' } } });
  });

  it('GET /api/v1/health/ready returns 503 with the standard error envelope when the database is down', async () => {
    vi.mocked(pingDatabase).mockResolvedValue(false);

    const response = await request(app).get('/api/v1/health/ready');

    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: 'SERVICE_UNAVAILABLE', details: [{ path: 'database' }] },
    });
    expect(typeof response.body.error.requestId).toBe('string');
  });
});

describe('app-level behaviour', () => {
  it('returns a 404 error envelope for unknown routes', async () => {
    const response = await request(app).get('/api/v1/nope');

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ success: false, error: { code: 'NOT_FOUND' } });
  });

  it('returns 400 for malformed JSON instead of leaking a stack trace', async () => {
    const response = await request(app)
      .post('/api/v1/health')
      .set('Content-Type', 'application/json')
      .send('{"broken":');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('BAD_REQUEST');
    expect(JSON.stringify(response.body)).not.toContain('SyntaxError');
  });

  it('rejects browser requests from origins that are not allow-listed', async () => {
    const response = await request(app).get('/api/v1/health').set('Origin', 'https://evil.example');

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('allows the configured client origin', async () => {
    const response = await request(app).get('/api/v1/health').set('Origin', 'http://localhost:5173');

    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  it('sets security headers, a request id, and hides the framework', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.headers['x-powered-by']).toBeUndefined();
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
  });
});
