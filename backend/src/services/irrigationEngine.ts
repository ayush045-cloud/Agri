import cron from 'node-cron';
import axios from 'axios';
import { prisma } from '../prisma';
import { getIO } from './socketService';

interface WeatherResult {
  skip: boolean;
  reason: string;
}

async function checkWeather(lat: number, lon: number): Promise<WeatherResult> {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) return { skip: false, reason: 'no API key configured' };

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;
    const { data } = await axios.get<{ list: Array<{ rain?: { '3h'?: number } }> }>(url);
    const rain = data.list
      .slice(0, 2)
      .reduce((sum, item) => sum + (item.rain?.['3h'] ?? 0), 0);

    if (rain > 5) {
      return { skip: true, reason: `Rain forecast: ${rain.toFixed(1)}mm in next 6h` };
    }
    return { skip: false, reason: `No significant rain (${rain.toFixed(1)}mm)` };
  } catch {
    return { skip: false, reason: 'Weather check failed' };
  }
}

export function startIrrigationEngine(): void {
  const schedule = process.env.IRRIGATION_CRON ?? '*/15 * * * *';
  cron.schedule(schedule, async () => {
    console.log('[irrigationEngine] Running irrigation check…');
    try {
      const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

      // Find fields that have at least one sensor with a recent reading
      const fields = await prisma.field.findMany({
        include: {
          sensors: {
            include: {
              readings: {
                where: { recordedAt: { gte: thirtyMinAgo } },
                orderBy: { recordedAt: 'desc' },
                take: 1,
              },
            },
          },
          farm: {
            include: {
              user: {
                include: { settings: true },
              },
            },
          },
          irrigationLogs: {
            where: { status: 'active' },
            take: 1,
          },
        },
      });

      for (const field of fields) {
        // Skip fields with no sensors having recent readings
        const activeSensors = field.sensors.filter(s => s.readings.length > 0);
        if (activeSensors.length === 0) continue;

        // Check autoIrrigation setting
        const settings = field.farm.user.settings;
        if (!settings?.autoIrrigation) {
          console.log(`[irrigationEngine] Field ${field.id}: autoIrrigation disabled, skipping`);
          continue;
        }

        // Skip if already active
        if (field.irrigationLogs.length > 0) {
          console.log(`[irrigationEngine] Field ${field.id}: irrigation already active, skipping`);
          continue;
        }

        // Get the latest soil moisture from any linked sensor
        let latestMoisture: number | null = null;
        for (const sensor of activeSensors) {
          const reading = sensor.readings[0];
          if (reading?.moisture != null) {
            latestMoisture = reading.moisture;
            break;
          }
        }

        if (latestMoisture === null) {
          console.log(`[irrigationEngine] Field ${field.id}: no moisture reading, skipping`);
          continue;
        }

        if (latestMoisture >= 40) {
          console.log(`[irrigationEngine] Field ${field.id}: moisture ${latestMoisture}% >= 40%, no action needed`);
          continue;
        }

        // Check weather forecast if farm has coordinates
        const farm = field.farm;
        let weatherResult: WeatherResult = { skip: false, reason: 'no farm location' };
        if (farm.latitude != null && farm.longitude != null) {
          weatherResult = await checkWeather(farm.latitude, farm.longitude);
        }

        if (weatherResult.skip) {
          console.log(`[irrigationEngine] Field ${field.id}: skipping due to weather — ${weatherResult.reason}`);
          continue;
        }

        // Trigger irrigation
        const log = await prisma.irrigationLog.create({
          data: {
            fieldId: field.id,
            status: 'active',
            scheduledAt: new Date(),
            startedAt: new Date(),
            notes: `Auto-triggered: moisture ${latestMoisture}%. Weather: ${weatherResult.reason}`,
          },
        });

        console.log(`[irrigationEngine] Field ${field.id}: irrigation triggered (log ${log.id})`);

        try {
          getIO().emit('pump:trigger', { fieldId: field.id, logId: log.id });
        } catch {
          // socket not ready
        }
      }
    } catch (err) {
      console.error('[irrigationEngine] Error during check:', err);
    }
  });

  console.log('[irrigationEngine] Scheduled (every 15 min)');
}
