import request from 'supertest';
import app from '../app';

jest.mock('../prisma', () => ({
  prisma: {
    irrigationLog: {
      findMany: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

import { prisma } from '../prisma';

const mockFindMany   = prisma.irrigationLog.findMany   as unknown as jest.Mock;
const mockCreate     = prisma.irrigationLog.create     as unknown as jest.Mock;
const mockUpdateMany = prisma.irrigationLog.updateMany as unknown as jest.Mock;

describe('GET /api/irrigation/schedule', () => {
  it('returns empty schedule', async () => {
    mockFindMany.mockResolvedValue([]);
    const res = await request(app).get('/api/irrigation/schedule');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('schedule');
    expect(res.body.schedule).toEqual([]);
  });

  it('maps an irrigation log row to the expected shape', async () => {
    const scheduledAt = new Date();
    scheduledAt.setHours(6, 0, 0, 0);

    mockFindMany.mockResolvedValue([
      {
        id: 'irr-1',
        status: 'done',
        scheduledAt,
        waterUsedL: 380,
        durationMin: 25,
        field: { name: 'Field A', cropType: 'Wheat' },
      },
    ]);

    const res = await request(app).get('/api/irrigation/schedule');
    expect(res.status).toBe(200);
    const row = res.body.schedule[0];
    expect(row.id).toBe('irr-1');
    expect(row.name).toContain('Field A');
    expect(row.name).toContain('Wheat');
    expect(row.badge).toBe('badge-done');
    expect(row.label).toBe('Done');
    expect(row.meta).toContain('380 L');
    expect(row.meta).toContain('25 min');
    expect(row.status).toBe('done');
  });

  it('maps all status values to correct badges', async () => {
    const statuses = [
      { status: 'done',      badge: 'badge-done',   label: 'Done'      },
      { status: 'active',    badge: 'badge-active',  label: 'Active'    },
      { status: 'scheduled', badge: 'badge-soon',    label: 'Scheduled' },
      { status: 'urgent',    badge: 'badge-urgent',  label: 'Urgent'    },
      { status: 'cancelled', badge: 'badge-done',    label: 'Cancelled' },
    ];

    for (const { status, badge, label } of statuses) {
      mockFindMany.mockResolvedValue([
        {
          id: 'irr-x',
          status,
          scheduledAt: new Date(),
          waterUsedL: 100,
          durationMin: 10,
          field: { name: 'F', cropType: null },
        },
      ]);
      const res = await request(app).get('/api/irrigation/schedule');
      expect(res.body.schedule[0].badge).toBe(badge);
      expect(res.body.schedule[0].label).toBe(label);
    }
  });

  it('returns 500 when database throws', async () => {
    mockFindMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/irrigation/schedule');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /api/irrigation/run', () => {
  it('returns 400 when fieldId is missing', async () => {
    const res = await request(app).post('/api/irrigation/run').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('creates an irrigation log with status active', async () => {
    const log = { id: 'irr-new', fieldId: 'field-a', status: 'active' };
    mockCreate.mockResolvedValue(log);

    const res = await request(app).post('/api/irrigation/run').send({
      fieldId: 'field-a',
      durationMin: 30,
      waterUsedL: 400,
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.log).toEqual(log);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          fieldId: 'field-a',
          status: 'active',
          durationMin: 30,
          waterUsedL: 400,
        }),
      }),
    );
  });

  it('creates a log without optional fields', async () => {
    mockCreate.mockResolvedValue({ id: 'irr-min', fieldId: 'field-a', status: 'active' });

    const res = await request(app).post('/api/irrigation/run').send({ fieldId: 'field-a' });
    expect(res.status).toBe(201);
  });
});

describe('POST /api/irrigation/accept', () => {
  it('returns success', async () => {
    mockUpdateMany.mockResolvedValue({ count: 2 });
    const res = await request(app).post('/api/irrigation/accept');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('accepted');
  });

  it('scopes update to today (includes scheduledAt date range)', async () => {
    mockUpdateMany.mockResolvedValue({ count: 0 });
    await request(app).post('/api/irrigation/accept');

    expect(mockUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { in: ['scheduled', 'urgent'] },
          scheduledAt: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
        data: expect.objectContaining({ status: 'active' }),
      }),
    );
  });

  it('returns 500 when database throws', async () => {
    mockUpdateMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).post('/api/irrigation/accept');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/irrigation/calculate', () => {
  it('calculates water need for deficient soil', async () => {
    const res = await request(app).post('/api/irrigation/calculate').send({
      fieldId: 'field-a',
      cropType: 'Wheat',
      soilMoisture: '40',
      areaHa: '2',
    });
    expect(res.status).toBe(200);
    expect(res.body.targetMoisture).toBe(70);
    expect(res.body.currentMoisture).toBe(40);
    expect(res.body.deficitPct).toBe(30);
    // waterLitres = 30 × 2 × 10000 × 0.3 × 10 × 0.001 = 1800
    expect(res.body.waterLitres).toBe(1800);
    expect(res.body.durationMin).toBe(Math.round(1800 / 16));
    expect(res.body.recommendation).toContain('Apply 1800 L');
  });

  it('says no irrigation needed when moisture is near target', async () => {
    const res = await request(app).post('/api/irrigation/calculate').send({
      soilMoisture: '68',
      areaHa: '1',
    });
    expect(res.status).toBe(200);
    expect(res.body.recommendation).toContain('adequate');
  });

  it('returns zero water when soil moisture is at target', async () => {
    const res = await request(app).post('/api/irrigation/calculate').send({
      soilMoisture: '70',
      areaHa: '1',
    });
    expect(res.status).toBe(200);
    expect(res.body.deficitPct).toBe(0);
    expect(res.body.waterLitres).toBe(0);
  });

  it('uses defaults when body is empty', async () => {
    const res = await request(app).post('/api/irrigation/calculate').send({});
    expect(res.status).toBe(200);
    // Default soilMoisture=50, targetMoisture=70 → deficitPct=20, area=1
    expect(res.body.currentMoisture).toBe(50);
    expect(res.body.deficitPct).toBe(20);
  });
});
