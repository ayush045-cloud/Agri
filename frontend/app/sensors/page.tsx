'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { useSensors } from '@/lib/useSensors';
import { Skeleton } from '@/components/Skeleton';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface SensorHistory {
  readings: { moisture: number | null; temperature: number | null; humidity: number | null; recordedAt: string }[];
}

const BADGE: Record<string, string> = {
  'badge-online': 'bg-[#e8f5eb] text-[#245229]',
  'badge-low': 'bg-[#fdf6e3] text-[#7a5400]',
  'badge-urgent': 'bg-[#ffebee] text-[#c0392b]',
};

export default function SensorsPage() {
  const { sensors, loading } = useSensors();
  const [selected, setSelected] = useState<string | null>(null);

  const { data: history } = useSWR<SensorHistory>(
    selected ? `history-${selected}` : null,
    () => api.get(`/api/sensors/history/${selected}?limit=50`),
    { refreshInterval: 60000 }
  );

  const chartData = (history?.readings ?? [])
    .slice().reverse()
    .map(r => ({
      time: new Date(r.recordedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      moisture: r.moisture != null ? Math.round(r.moisture) : undefined,
      temp: r.temperature,
      humidity: r.humidity != null ? Math.round(r.humidity) : undefined,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#0f1a10]">Sensors &amp; Data</h1>
        <p className="text-[13px] text-[#7a9e80] mt-0.5">Live IoT sensor readings — updated in real-time via WebSocket</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? [...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />) :
          sensors.map(s => (
            <button key={s.id} onClick={() => setSelected(selected === s.id ? null : s.id)}
              className={`text-left p-4 rounded-xl border-2 transition-colors ${selected === s.id ? 'border-[#4caf60] bg-[#f3faf4]' : 'border-[#d4e8d6] bg-white hover:border-[#a5d6a7]'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-[#0f1a10] text-[14px]">{s.id}</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${BADGE[s.status] ?? 'bg-gray-100 text-gray-600'}`}>{s.label}</span>
              </div>
              <div className="text-[12.5px] font-medium text-[#245229]">{s.field}</div>
              <div className="text-[11.5px] text-[#7a9e80] mt-1 leading-relaxed">{s.info}</div>
            </button>
          ))
        }
      </div>

      {selected && chartData.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-[#d4e8d6]">
          <h2 className="font-semibold text-[#0f1a10] mb-4 text-[15px]">History — Sensor {selected}</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#7a9e80' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: '#7a9e80' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #d4e8d6', fontSize: 12 }} />
              {chartData.some(d => d.moisture != null) && <Line type="monotone" dataKey="moisture" stroke="#4caf60" strokeWidth={2} dot={false} name="Moisture %" />}
              {chartData.some(d => d.temp != null) && <Line type="monotone" dataKey="temp" stroke="#e6a817" strokeWidth={2} dot={false} name="Temp °C" />}
              {chartData.some(d => d.humidity != null) && <Line type="monotone" dataKey="humidity" stroke="#2563a8" strokeWidth={2} dot={false} name="Humidity %" />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex justify-end">
        <a href="http://localhost:3001/api/sensors/export" className="px-4 py-2 bg-white border border-[#d4e8d6] text-[#245229] rounded-lg text-[13px] font-medium hover:bg-[#f3faf4] transition-colors">
          ⬇ Export CSV (7 days)
        </a>
      </div>
    </div>
  );
}
