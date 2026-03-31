import request from 'supertest';
import app from '../app';

// Prisma is mocked — no real DB needed
jest.mock('../prisma', () => ({
  prisma: {
    sensor: { findMany: jest.fn() },
    diseaseLog: { findMany: jest.fn() },
    irrigationLog: { findMany: jest.fn() },
  },
}));

import { prisma } from '../prisma';

const mockSensorFindMany = prisma.sensor.findMany as unknown as jest.Mock;
const mockDiseaseLogFindMany = prisma.diseaseLog.findMany as unknown as jest.Mock;
const mockIrrLogFindMany = prisma.irrigationLog.findMany as unknown as jest.Mock;

const EMPTY_SENSOR = {
  deviceId: 'S-01',
  name: 'Field A Moisture',
  status: 'online',
  field: { name: 'Field A', cropType: 'Wheat' },
  readings: [],
};

const SENSOR_WITH_READING = {
  ...EMPTY_SENSOR,
  readings: [
    {
      moisture: 72,
      temperature: 23,
      ph: 6.7,
      humidity: null,
      windSpeed: null,
      recordedAt: new Date('2024-10-15T10:00:00Z'),
    },
  ],
};

describe('GET /api/dashboard', () => {
  it('returns all expected shape keys', async () => {
    mockSensorFindMany.mockResolvedValue([]);
    mockDiseaseLogFindMany.mockResolvedValue([]);
    mockIrrLogFindMany.mockResolvedValue([]);

    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('soilMoisture');
    expect(res.body).toHaveProperty('alerts');
    expect(res.body).toHaveProperty('waterChart');
    expect(res.body).toHaveProperty('schedule');
    expect(res.body).toHaveProperty('diseaseHistory');
    expect(res.body).toHaveProperty('sensors');
  });

  it('waterChart always contains exactly 7 entries with Today last', async () => {
    mockSensorFindMany.mockResolvedValue([]);
    mockDiseaseLogFindMany.mockResolvedValue([]);
    mockIrrLogFindMany.mockResolvedValue([]);

    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.waterChart).toHaveLength(7);
    expect(res.body.waterChart[6].day).toBe('Today');
  });

  it('maps sensor moisture reading to soilMoisture', async () => {
    mockSensorFindMany.mockResolvedValue([SENSOR_WITH_READING]);
    mockDiseaseLogFindMany.mockResolvedValue([]);
    mockIrrLogFindMany.mockResolvedValue([]);

    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.soilMoisture).toHaveLength(1);
    expect(res.body.soilMoisture[0].pct).toBe(72);
    expect(res.body.soilMoisture[0].color).toBe('#4caf60'); // >= 70 → green
  });

  it('includes disease danger alerts', async () => {
    mockSensorFindMany.mockResolvedValue([]);
    mockDiseaseLogFindMany
      .mockResolvedValueOnce([
        {
          resultType: 'danger',
          diseaseName: 'Leaf Blight',
          confidence: 94,
          createdAt: new Date(),
          field: { name: 'Field A' },
        },
      ])
      .mockResolvedValueOnce([]); // diseaseHistory second call
    mockIrrLogFindMany.mockResolvedValue([]);

    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.alerts).toHaveLength(1);
    expect(res.body.alerts[0].pip).toBe('pip-red');
    expect(res.body.alerts[0].title).toContain('Leaf Blight');
  });

  it('sensor with low moisture creates amber alert', async () => {
    mockSensorFindMany.mockResolvedValue([
      {
        ...EMPTY_SENSOR,
        readings: [
          {
            moisture: 20,
            temperature: 25,
            ph: null,
            humidity: null,
            windSpeed: null,
            recordedAt: new Date(),
          },
        ],
      },
    ]);
    mockDiseaseLogFindMany.mockResolvedValue([]);
    mockIrrLogFindMany.mockResolvedValue([]);

    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    // Should generate a moisture alert
    expect(res.body.alerts.some((a: { pip: string }) => a.pip === 'pip-amber')).toBe(true);
  });

  it('returns 500 when database throws', async () => {
    mockSensorFindMany.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});
