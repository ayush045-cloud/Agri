import request from 'supertest';
import app from '../app';

jest.mock('../prisma', () => ({
  prisma: {
    userSettings: {
      findFirst: jest.fn(),
      upsert: jest.fn(),
    },
    user: {
      upsert: jest.fn(),
    },
    farm: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { prisma } from '../prisma';

const mockSettingsFindFirst = prisma.userSettings.findFirst as unknown as jest.Mock;
const mockSettingsUpsert    = prisma.userSettings.upsert    as unknown as jest.Mock;
const mockUserUpsert        = prisma.user.upsert            as unknown as jest.Mock;
const mockFarmFindFirst     = prisma.farm.findFirst         as unknown as jest.Mock;
const mockFarmUpdate        = prisma.farm.update            as unknown as jest.Mock;
const mockFarmCreate        = prisma.farm.create            as unknown as jest.Mock;

const MOCK_USER = { id: 'user-1', email: 'admin@agromind.local', name: 'Farm Owner' };
const MOCK_FARM = { id: 'farm-1', name: 'Singh Farm', totalAreaHa: 12.5, waterSource: 'borewell' };
const MOCK_SETTINGS = {
  alertLanguage: 'English',
  autoIrrigation: false,
  weatherAlerts: true,
  diseaseAlerts: true,
  smsAlerts: false,
  mandiPrices: false,
  apiUrl: null,
  user: { farms: [MOCK_FARM] },
};

describe('GET /api/settings', () => {
  it('returns { settings: null } when no settings exist', async () => {
    mockSettingsFindFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/settings');
    expect(res.status).toBe(200);
    expect(res.body.settings).toBeNull();
  });

  it('returns settings mapped from DB row', async () => {
    mockSettingsFindFirst.mockResolvedValue(MOCK_SETTINGS);
    const res = await request(app).get('/api/settings');
    expect(res.status).toBe(200);
    const s = res.body.settings;
    expect(s.farmName).toBe('Singh Farm');
    expect(s.area).toBe(12.5);
    expect(s.waterSource).toBe('borewell');
    expect(s.alertLanguage).toBe('English');
    expect(s.autoIrr).toBe(false);
    expect(s.weather).toBe(true);
  });

  it('falls back to empty values when user has no farms', async () => {
    mockSettingsFindFirst.mockResolvedValue({
      ...MOCK_SETTINGS,
      user: { farms: [] },
    });
    const res = await request(app).get('/api/settings');
    expect(res.status).toBe(200);
    expect(res.body.settings.farmName).toBe('');
    expect(res.body.settings.area).toBe(0);
    expect(res.body.settings.waterSource).toBe('borewell');
  });

  it('returns 500 when database throws', async () => {
    mockSettingsFindFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/settings');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /api/settings', () => {
  it('creates a new farm when none exists', async () => {
    mockUserUpsert.mockResolvedValue(MOCK_USER);
    mockFarmFindFirst.mockResolvedValue(null);
    mockFarmCreate.mockResolvedValue({ id: 'farm-new' });
    mockSettingsUpsert.mockResolvedValue({});

    const res = await request(app).post('/api/settings').send({
      farmName: 'My Farm',
      area: '5',
      waterSource: 'canal',
      alertLanguage: 'Hindi',
      autoIrr: false,
      weather: true,
      disease: true,
      sms: false,
      mandi: false,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockFarmCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'My Farm',
          totalAreaHa: 5,
          waterSource: 'canal',
          userId: 'user-1',
        }),
      }),
    );
    expect(mockFarmUpdate).not.toHaveBeenCalled();
  });

  it('updates existing farm', async () => {
    mockUserUpsert.mockResolvedValue(MOCK_USER);
    mockFarmFindFirst.mockResolvedValue(MOCK_FARM);
    mockFarmUpdate.mockResolvedValue({ ...MOCK_FARM, name: 'New Farm Name' });
    mockSettingsUpsert.mockResolvedValue({});

    const res = await request(app).post('/api/settings').send({ farmName: 'New Farm Name' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockFarmUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'farm-1' },
        data: expect.objectContaining({ name: 'New Farm Name' }),
      }),
    );
    expect(mockFarmCreate).not.toHaveBeenCalled();
  });

  it('upserts user settings with correct boolean values', async () => {
    mockUserUpsert.mockResolvedValue(MOCK_USER);
    mockFarmFindFirst.mockResolvedValue(MOCK_FARM);
    mockFarmUpdate.mockResolvedValue({});
    mockSettingsUpsert.mockResolvedValue({});

    await request(app).post('/api/settings').send({
      autoIrr: true,
      weather: false,
      disease: 'false',
      sms: 'true',
      mandi: false,
    });

    const upsertCall = mockSettingsUpsert.mock.calls[0][0];
    expect(upsertCall.create.autoIrrigation).toBe(true);
    expect(upsertCall.create.weatherAlerts).toBe(false);
    expect(upsertCall.create.diseaseAlerts).toBe(false);
    expect(upsertCall.create.smsAlerts).toBe(true);
    expect(upsertCall.create.mandiPrices).toBe(false);
  });

  it('returns 500 when database throws', async () => {
    mockUserUpsert.mockRejectedValue(new Error('DB error'));
    const res = await request(app).post('/api/settings').send({ farmName: 'x' });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});
