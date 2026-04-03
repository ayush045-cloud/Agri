import request from 'supertest';
import app from '../app';

const TEST_ORIGIN = 'https://agrocloud.vercel.app';

describe('CORS preflight (OPTIONS)', () => {
  const originalCorsOrigin = process.env.CORS_ORIGIN;

  beforeAll(() => {
    process.env.CORS_ORIGIN = TEST_ORIGIN;
  });

  afterAll(() => {
    if (originalCorsOrigin === undefined) {
      delete process.env.CORS_ORIGIN;
    } else {
      process.env.CORS_ORIGIN = originalCorsOrigin;
    }
  });

  it('returns Access-Control-Allow-Origin for OPTIONS /api/chat/message', async () => {
    const res = await request(app)
      .options('/api/chat/message')
      .set('Origin', TEST_ORIGIN)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Content-Type');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe(TEST_ORIGIN);
    expect(res.headers['access-control-allow-methods']).toMatch(/POST/i);
  });

  it('includes Authorization in allowed headers', async () => {
    const res = await request(app)
      .options('/api/auth/login')
      .set('Origin', TEST_ORIGIN)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Authorization');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-headers']).toMatch(/authorization/i);
  });
});
