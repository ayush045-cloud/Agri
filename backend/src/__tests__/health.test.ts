import request from 'supertest';
import app from '../app';

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.timestamp).toBe('string');
  });
});

describe('API 404 catch-all', () => {
  it('returns 404 JSON for unknown /api routes', async () => {
    const res = await request(app).get('/api/nonexistent-endpoint');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 404 for unknown nested /api route', async () => {
    const res = await request(app).post('/api/does/not/exist').send({});
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
