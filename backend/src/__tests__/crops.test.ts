import request from 'supertest';
import app from '../app';

jest.mock('../prisma', () => ({
  prisma: {
    field: { findMany: jest.fn() },
  },
}));

// Mock axios used by the crops route to call the AI service
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

const mockFieldFindMany = prisma.field.findMany as unknown as jest.Mock;
const mockAxiosPost     = (axios as unknown as { post: jest.Mock }).post;

const AI_CROP_RESPONSE = {
  crops: [
    { emoji: '🌾', name: 'Wheat',   score: 95, why: 'Best match' },
    { emoji: '🌻', name: 'Mustard', score: 82, why: 'Good yield'  },
  ],
  summary: 'Wheat is your best option.',
};

describe('POST /api/crops/recommend', () => {
  it('returns crop list from AI service', async () => {
    mockAxiosPost.mockResolvedValue({ data: AI_CROP_RESPONSE });

    const res = await request(app).post('/api/crops/recommend').send({
      soil: 'loamy', ph: 6.5, rainfall: 800, temp: 20,
      region: 'Punjab', season: 'rabi', nitrogen: 50, water: 'medium',
    });

    expect(res.status).toBe(200);
    expect(res.body.crops).toHaveLength(2);
    expect(res.body.crops[0].name).toBe('Wheat');
    expect(res.body.summary).toContain('Wheat');
    // Verify AI service was called with the correct payload
    expect(mockAxiosPost).toHaveBeenCalledWith(
      expect.stringContaining('/crops/recommend'),
      expect.objectContaining({ soil: 'loamy', ph: 6.5 }),
      expect.objectContaining({ timeout: 30_000 }),
    );
  });

  it('forwards request even with minimal body', async () => {
    mockAxiosPost.mockResolvedValue({ data: AI_CROP_RESPONSE });
    const res = await request(app).post('/api/crops/recommend').send({});
    expect(res.status).toBe(200);
  });

  it('returns 502 when AI service throws', async () => {
    mockAxiosPost.mockRejectedValue(new Error('ECONNREFUSED'));
    const res = await request(app).post('/api/crops/recommend').send({ soil: 'loamy' });
    expect(res.status).toBe(502);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/crops/fields', () => {
  it('returns an empty list when no fields exist', async () => {
    mockFieldFindMany.mockResolvedValue([]);
    const res = await request(app).get('/api/crops/fields');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('fields');
    expect(res.body.fields).toEqual([]);
  });

  it('returns fields with crop info', async () => {
    mockFieldFindMany.mockResolvedValue([
      {
        id: 'field-a',
        name: 'Field A',
        cropType: 'Wheat',
        cropSeason: 'rabi',
        soilType: 'loamy',
        soilPh: 6.7,
        areaHa: 3.0,
      },
    ]);
    const res = await request(app).get('/api/crops/fields');
    expect(res.status).toBe(200);
    expect(res.body.fields).toHaveLength(1);
    const f = res.body.fields[0];
    expect(f.id).toBe('field-a');
    expect(f.name).toBe('Field A');
    expect(f.cropType).toBe('Wheat');
    expect(f.soilPh).toBe(6.7);
  });

  it('returns 500 when database throws', async () => {
    mockFieldFindMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/crops/fields');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});
