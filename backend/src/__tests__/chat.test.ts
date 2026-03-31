import request from 'supertest';
import app from '../app';

// chat route does not use Prisma — no DB mock needed

describe('POST /api/chat/message', () => {
  const originalGemini = process.env.GEMINI_API_KEY;
  const originalOpenAI = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    // Ensure no real API keys are present so we hit the 503 path
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;
  });

  afterAll(() => {
    // Restore original env (may be undefined — that is fine)
    if (originalGemini !== undefined) process.env.GEMINI_API_KEY = originalGemini;
    if (originalOpenAI !== undefined) process.env.OPENAI_API_KEY = originalOpenAI;
  });

  it('returns 400 when message is absent', async () => {
    const res = await request(app).post('/api/chat/message').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when message is an empty string', async () => {
    const res = await request(app).post('/api/chat/message').send({ message: '   ' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when message is not a string', async () => {
    const res = await request(app).post('/api/chat/message').send({ message: 42 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 503 when no API key is configured', async () => {
    const res = await request(app)
      .post('/api/chat/message')
      .send({ message: 'What crops grow in Punjab?', history: [] });
    expect(res.status).toBe(503);
    expect(res.body).toHaveProperty('error');
  });

  it('includes history in 503 response path (no API key)', async () => {
    const history = [{ role: 'user', content: 'Hello' }, { role: 'assistant', content: 'Hi!' }];
    const res = await request(app)
      .post('/api/chat/message')
      .send({ message: 'Follow up question', history });
    expect(res.status).toBe(503);
  });

  it('accepts message with no history field', async () => {
    const res = await request(app)
      .post('/api/chat/message')
      .send({ message: 'Tell me about wheat farming' });
    // Without API keys → 503 is expected; the important thing is it reaches the handler
    expect(res.status).toBe(503);
  });
});
