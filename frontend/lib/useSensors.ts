import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { api } from './api';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface SensorLive {
  id: string; field: string; info: string; status: string; label: string; lastSeen: string | null;
}

export interface PumpStatus { fieldId: string; status: string; logId: string; }

export function useSensors() {
  const [sensors, setSensors] = useState<SensorLive[]>([]);
  const [pumpStatus, setPumpStatus] = useState<PumpStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ sensors: SensorLive[] }>('/api/sensors/live')
      .then(d => { setSensors(d.sensors); setLoading(false); })
      .catch(() => setLoading(false));

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.on('sensor:update', ({ deviceId, reading }: { deviceId: string; reading: Record<string, number> }) => {
      setSensors(prev => prev.map(s => {
        if (s.id !== deviceId) return s;
        const parts: string[] = [];
        if (reading.moisture != null) parts.push(`Moisture ${Math.round(reading.moisture)}%`);
        if (reading.temperature != null) parts.push(`Temp ${reading.temperature}°C`);
        if (reading.ph != null) parts.push(`pH ${reading.ph}`);
        if (reading.humidity != null) parts.push(`Humidity ${Math.round(reading.humidity)}%`);
        return { ...s, info: parts.join(' · ') || s.info, lastSeen: new Date().toISOString() };
      }));
    });
    socket.on('pump:status', (data: PumpStatus) => setPumpStatus(data));
    socket.on('pump:trigger', (data: PumpStatus) => setPumpStatus(data));
    return () => { socket.disconnect(); };
  }, []);

  return { sensors, pumpStatus, loading };
}
