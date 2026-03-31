import request from 'supertest';
import app from '../app';

jest.mock('../prisma', () => ({
  prisma: {
    sensor: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    sensorReading: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { prisma } from '../prisma';

const mockSensorFindMany   = prisma.sensor.findMany       as unknown as jest.Mock;
const mockSensorFindUnique = prisma.sensor.findUnique     as unknown as jest.Mock;
const mockSensorUpdate     = prisma.sensor.update         as unknown as jest.Mock;
const mockReadingFindMany  = prisma.sensorReading.findMany as unknown as jest.Mock;
const mockReadingCreate    = prisma.sensorReading.create   as unknown as jest.Mock;

const MOCK_SENSOR = {
  deviceId: 'S-01',
  name: 'Field A Moisture',
  status: 'online',
  field: { name: 'Field A' },
  readings: [],
};

const MOCK_READING = {
  id: 'reading-id-1',
  sensorId: 'sensor-db-id',
  moisture: 65.4,
  temperature: 23,
  ph: 6.7,
  humidity: null,
  windSpeed: null,
  rainfall: null,
  recordedAt: new Date('2024-10-15T10:00:00Z'),
};

describe('GET /api/sensors/live', () => {
  it('returns empty sensors array', async () => {
    mockSensorFindMany.mockResolvedValue([]);
    const res = await request(app).get('/api/sensors/live');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('sensors');
    expect(res.body.sensors).toEqual([]);
  });

  it('maps sensor with reading to expected shape', async () => {
    mockSensorFindMany.mockResolvedValue([
      {
        ...MOCK_SENSOR,
        readings: [MOCK_READING],
      },
    ]);

    const res = await request(app).get('/api/sensors/live');
    expect(res.status).toBe(200);
    const s = res.body.sensors[0];
    expect(s.id).toBe('S-01');
    expect(s.field).toBe('Field A');
    expect(s.info).toContain('Moisture 65%');
    expect(s.info).toContain('Temp 23°C');
    expect(s.info).toContain('pH 6.7');
    expect(s.status).toBe('badge-online');
    expect(s.label).toBe('Online');
  });

  it('uses sensor name as field when field relation is null', async () => {
    mockSensorFindMany.mockResolvedValue([{ ...MOCK_SENSOR, field: null }]);
    const res = await request(app).get('/api/sensors/live');
    expect(res.status).toBe(200);
    expect(res.body.sensors[0].field).toBe('Field A Moisture');
  });

  it('maps low_battery status correctly', async () => {
    mockSensorFindMany.mockResolvedValue([{ ...MOCK_SENSOR, status: 'low_battery' }]);
    const res = await request(app).get('/api/sensors/live');
    expect(res.status).toBe(200);
    expect(res.body.sensors[0].status).toBe('badge-low');
    expect(res.body.sensors[0].label).toBe('Low!');
  });

  it('returns 500 when database throws', async () => {
    mockSensorFindMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/sensors/live');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/sensors/history/:deviceId', () => {
  it('returns 404 for unknown sensor', async () => {
    mockSensorFindUnique.mockResolvedValue(null);
    const res = await request(app).get('/api/sensors/history/UNKNOWN');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns readings for known sensor', async () => {
    mockSensorFindUnique.mockResolvedValue({ id: 'sensor-db-id', deviceId: 'S-01' });
    mockReadingFindMany.mockResolvedValue([MOCK_READING]);

    const res = await request(app).get('/api/sensors/history/S-01');
    expect(res.status).toBe(200);
    expect(res.body.deviceId).toBe('S-01');
    expect(res.body.readings).toHaveLength(1);
  });

  it('clamps limit to 1000', async () => {
    mockSensorFindUnique.mockResolvedValue({ id: 'sensor-db-id', deviceId: 'S-01' });
    mockReadingFindMany.mockResolvedValue([]);

    await request(app).get('/api/sensors/history/S-01?limit=9999');
    expect(mockReadingFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 1000 }),
    );
  });

  it('falls back to limit=100 when limit is not a number', async () => {
    mockSensorFindUnique.mockResolvedValue({ id: 'sensor-db-id', deviceId: 'S-01' });
    mockReadingFindMany.mockResolvedValue([]);

    await request(app).get('/api/sensors/history/S-01?limit=abc');
    expect(mockReadingFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 }),
    );
  });

  it('falls back to limit=100 when limit is zero', async () => {
    mockSensorFindUnique.mockResolvedValue({ id: 'sensor-db-id', deviceId: 'S-01' });
    mockReadingFindMany.mockResolvedValue([]);

    await request(app).get('/api/sensors/history/S-01?limit=0');
    expect(mockReadingFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 }),
    );
  });
});

describe('GET /api/sensors/export', () => {
  it('returns text/csv content type', async () => {
    mockReadingFindMany.mockResolvedValue([]);
    const res = await request(app).get('/api/sensors/export');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.headers['content-disposition']).toContain('sensor-readings.csv');
  });

  it('includes CSV header row', async () => {
    mockReadingFindMany.mockResolvedValue([]);
    const res = await request(app).get('/api/sensors/export');
    expect(res.text).toContain('device_id,sensor_name,recorded_at');
  });

  it('includes a data row for each reading', async () => {
    mockReadingFindMany.mockResolvedValue([
      {
        ...MOCK_READING,
        sensor: { deviceId: 'S-01', name: 'Field A Moisture' },
      },
    ]);
    const res = await request(app).get('/api/sensors/export');
    expect(res.status).toBe(200);
    expect(res.text).toContain('S-01');
    expect(res.text).toContain('"Field A Moisture"');
  });
});

describe('POST /api/sensors/reading', () => {
  it('returns 400 when deviceId is missing', async () => {
    const res = await request(app).post('/api/sensors/reading').send({ moisture: 50 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 404 for unknown sensor deviceId', async () => {
    mockSensorFindUnique.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/sensors/reading')
      .send({ deviceId: 'UNKNOWN', moisture: 50 });
    expect(res.status).toBe(404);
  });

  it('creates a reading and updates sensor lastSeenAt', async () => {
    mockSensorFindUnique.mockResolvedValue({ id: 'sensor-db-id', deviceId: 'S-01' });
    mockReadingCreate.mockResolvedValue({ ...MOCK_READING, id: 'r-new' });
    mockSensorUpdate.mockResolvedValue({});

    const res = await request(app)
      .post('/api/sensors/reading')
      .send({ deviceId: 'S-01', moisture: 65, temperature: 24, ph: 6.7 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(mockReadingCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          sensorId: 'sensor-db-id',
          moisture: 65,
          temperature: 24,
          ph: 6.7,
        }),
      }),
    );
    expect(mockSensorUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sensor-db-id' },
        data: expect.objectContaining({ status: 'online' }),
      }),
    );
  });

  it('accepts string numbers and parses them to floats', async () => {
    mockSensorFindUnique.mockResolvedValue({ id: 'sensor-db-id', deviceId: 'S-01' });
    mockReadingCreate.mockResolvedValue({ id: 'r-new' });
    mockSensorUpdate.mockResolvedValue({});

    const res = await request(app)
      .post('/api/sensors/reading')
      .send({ deviceId: 'S-01', moisture: '72.5', windSpeed: '8.2' });

    expect(res.status).toBe(201);
    expect(mockReadingCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ moisture: 72.5, windSpeed: 8.2 }),
      }),
    );
  });
});
