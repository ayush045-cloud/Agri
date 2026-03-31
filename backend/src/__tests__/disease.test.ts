import request from 'supertest';
import fs from 'fs';
import app from '../app';

jest.mock('../prisma', () => ({
  prisma: {
    diseaseLog: { create: jest.fn() },
  },
}));

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    isAxiosError: jest.fn().mockReturnValue(false),
  },
  isAxiosError: jest.fn().mockReturnValue(false),
}));

import { prisma } from '../prisma';
import axios from 'axios';

const mockDiseaseCreate = prisma.diseaseLog.create as unknown as jest.Mock;
const mockAxiosPost     = (axios as unknown as { post: jest.Mock }).post;
const mockIsAxiosError  = (axios as unknown as { isAxiosError: jest.Mock }).isAxiosError;

// Minimal valid 1×1 green PNG (40 bytes)
const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQ' +
  'AABjkB6QAAAABJRU5ErkJggg==',
  'base64',
);
const TEST_IMAGE_PATH = '/tmp/agro-test-leaf.png';
const TEST_PDF_PATH   = '/tmp/agro-test-doc.pdf';

const AI_HEALTHY_RESPONSE = {
  type: 'healthy',
  disease: 'Healthy Leaf',
  confidence: 99,
  description: 'No disease detected.',
  treatment: null,
  class_index: 0,
};

const AI_DANGER_RESPONSE = {
  type: 'danger',
  disease: 'Leaf Blight',
  confidence: 94,
  description: 'Blight detected.',
  treatment: 'Apply Mancozeb.',
  class_index: 1,
};

describe('POST /api/disease/analyse', () => {
  beforeAll(() => {
    fs.writeFileSync(TEST_IMAGE_PATH, TINY_PNG);
    fs.writeFileSync(TEST_PDF_PATH, Buffer.from('fake pdf'));
  });

  afterAll(() => {
    [TEST_IMAGE_PATH, TEST_PDF_PATH].forEach(p => {
      try { fs.unlinkSync(p); } catch { /* ignore */ }
    });
  });

  it('returns 400 when no image is attached', async () => {
    const res = await request(app).post('/api/disease/analyse');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when file type is not an image', async () => {
    const res = await request(app)
      .post('/api/disease/analyse')
      .attach('image', TEST_PDF_PATH, { filename: 'document.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('JPEG/PNG/WebP');
  });

  it('returns 200 with disease result for a healthy leaf', async () => {
    mockAxiosPost.mockResolvedValue({ data: AI_HEALTHY_RESPONSE });
    mockDiseaseCreate.mockResolvedValue({ id: 'log-1' });

    const res = await request(app)
      .post('/api/disease/analyse')
      .attach('image', TEST_IMAGE_PATH, { filename: 'leaf.png', contentType: 'image/png' });

    expect(res.status).toBe(200);
    expect(res.body.type).toBe('healthy');
    expect(res.body.conf).toBe(99);
    expect(res.body.col).toBe('#3d8b47');
    expect(res.body.disease).toBe('Healthy Leaf');
    expect(res.body.imageUrl).toMatch(/^\/uploads\//);
    expect(res.body.treatment).toBe('');
    expect(mockDiseaseCreate).toHaveBeenCalled();
  });

  it('returns correct colour and title for danger result', async () => {
    mockAxiosPost.mockResolvedValue({ data: AI_DANGER_RESPONSE });
    mockDiseaseCreate.mockResolvedValue({ id: 'log-2' });

    const res = await request(app)
      .post('/api/disease/analyse')
      .attach('image', TEST_IMAGE_PATH, { filename: 'blight.png', contentType: 'image/png' });

    expect(res.status).toBe(200);
    expect(res.body.type).toBe('danger');
    expect(res.body.col).toBe('#c0392b');
    expect(res.body.title).toContain('Leaf Blight');
    expect(res.body.treatment).toBe('Apply Mancozeb.');
  });

  it('persists result to the database with correct fields', async () => {
    mockAxiosPost.mockResolvedValue({ data: AI_DANGER_RESPONSE });
    mockDiseaseCreate.mockResolvedValue({ id: 'log-3' });

    await request(app)
      .post('/api/disease/analyse')
      .attach('image', TEST_IMAGE_PATH, { filename: 'leaf.png', contentType: 'image/png' });

    expect(mockDiseaseCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          resultType: 'danger',
          diseaseName: 'Leaf Blight',
          confidence: 94,
          colourHex: '#c0392b',
        }),
      }),
    );
  });

  it('stores fieldId when provided in the request body', async () => {
    mockAxiosPost.mockResolvedValue({ data: AI_HEALTHY_RESPONSE });
    mockDiseaseCreate.mockResolvedValue({ id: 'log-4' });

    await request(app)
      .post('/api/disease/analyse')
      .field('fieldId', 'field-a')
      .attach('image', TEST_IMAGE_PATH, { filename: 'leaf.png', contentType: 'image/png' });

    expect(mockDiseaseCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ fieldId: 'field-a' }),
      }),
    );
  });

  it('returns 502 when the AI service is unreachable', async () => {
    mockIsAxiosError.mockReturnValue(true);
    const axiosError = Object.assign(new Error('ECONNREFUSED'), { isAxiosError: true });
    mockAxiosPost.mockRejectedValue(axiosError);

    const res = await request(app)
      .post('/api/disease/analyse')
      .attach('image', TEST_IMAGE_PATH, { filename: 'leaf.png', contentType: 'image/png' });

    expect(res.status).toBe(502);
    expect(res.body.error).toContain('AI service unavailable');
  });

  it('returns 500 for non-Axios errors (e.g. DB write failure)', async () => {
    mockIsAxiosError.mockReturnValue(false);
    mockAxiosPost.mockResolvedValue({ data: AI_HEALTHY_RESPONSE });
    mockDiseaseCreate.mockRejectedValue(new Error('DB write failed'));

    const res = await request(app)
      .post('/api/disease/analyse')
      .attach('image', TEST_IMAGE_PATH, { filename: 'leaf.png', contentType: 'image/png' });

    expect(res.status).toBe(500);
    expect(res.body.error).toContain('Failed to process');
  });
});
