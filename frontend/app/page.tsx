'use client';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { SkeletonCard, Skeleton } from '@/components/Skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardData {
  soilMoisture: { name: string; pct: number; color: string }[];
  alerts: { pip: string; title: string; meta: string }[];
  waterChart: { day: string; val: number }[];
  schedule: { name: string; meta: string; badge: string; label: string }[];
  diseaseHistory: { title: string; meta: string; badge: string; label: string }[];
  sensors: { id: string; field: string; info: string; status: string; label: string }[];
}

const BADGE_STYLES: Record<string, string> = {
  'badge-done': 'bg-[#e8f5eb] text-[#245229]',
  'badge-active': 'bg-[#e8f0fa] text-[#2563a8]',
  'badge-soon': 'bg-[#fdf6e3] text-[#7a5400]',
  'badge-urgent': 'bg-[#ffebee] text-[#c0392b]',
  'badge-online': 'bg-[#e8f5eb] text-[#245229]',
  'badge-low': 'bg-[#fdf6e3] text-[#7a5400]',
};

const PIP_STYLES: Record<string, string> = {
  'pip-red': 'bg-[#c0392b]',
  'pip-amber': 'bg-[#e6a817]',
  'pip-green': 'bg-[#4caf60]',
};

const MANDI_MOCK = [
  { crop: 'Wheat', price: '₹2,275/qtl', trend: '↑ +₹45' },
  { crop: 'Rice', price: '₹2,183/qtl', trend: '↔ Stable' },
  { crop: 'Cotton', price: '₹6,620/qtl', trend: '↑ +₹120' },
  { crop: 'Mustard', price: '₹5,650/qtl', trend: '↓ -₹30' },
];

function StatCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className={`rounded-xl p-4 border border-[#d4e8d6] bg-gradient-to-br ${color} text-white`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm font-medium opacity-90 mt-0.5">{label}</div>
      {sub && <div className="text-xs opacity-70 mt-1">{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useSWR<DashboardData>('dashboard', () => api.get('/api/dashboard'), { refreshInterval: 30000 });

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="🌾" label="Total Fields" value={isLoading ? '…' : String(data?.soilMoisture.length ?? 0)} sub="Active monitoring" color="from-[#2d6a35] to-[#1a3a1f]" />
        <StatCard icon="📡" label="Active Sensors" value={isLoading ? '…' : String(data?.sensors.filter(s => s.status === 'badge-online').length ?? 0)} sub="Online now" color="from-[#2563a8] to-[#1a3a8a]" />
        <StatCard icon="💧" label="Water Today" value={isLoading ? '…' : `${data?.waterChart.find(w => w.day === 'Today')?.val ?? 0} L`} sub="Total used" color="from-[#245229] to-[#0f2412]" />
        <StatCard icon="🟢" label="System" value="Operational" sub="All systems go" color="from-[#3d8b47] to-[#2d6a35]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Soil Moisture */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-[#d4e8d6]">
          <h2 className="font-semibold text-[#0f1a10] mb-4 text-[15px]">Soil Moisture by Field</h2>
          {isLoading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : (
            <div className="space-y-3">
              {(data?.soilMoisture ?? []).map((f, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[13px] mb-1">
                    <span className="text-[#1a2b1c] font-medium">{f.name}</span>
                    <span className="font-semibold" style={{ color: f.color }}>{f.pct}%</span>
                  </div>
                  <div className="h-2 bg-[#d4e8d6] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${f.pct}%`, background: f.color }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl p-5 border border-[#d4e8d6]">
          <h2 className="font-semibold text-[#0f1a10] mb-4 text-[15px]">Active Alerts</h2>
          {isLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : (
            <div className="space-y-3">
              {(data?.alerts ?? []).map((a, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg bg-[#f4f9f4]">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${PIP_STYLES[a.pip] ?? 'bg-gray-400'}`} />
                  <div>
                    <div className="text-[12.5px] font-medium text-[#1a2b1c] leading-snug">{a.title}</div>
                    <div className="text-[11px] text-[#7a9e80] mt-0.5">{a.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Water Usage Chart */}
      <div className="bg-white rounded-xl p-5 border border-[#d4e8d6]">
        <h2 className="font-semibold text-[#0f1a10] mb-4 text-[15px]">7-Day Water Usage (L)</h2>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data?.waterChart ?? []}>
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#7a9e80' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#7a9e80' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #d4e8d6', fontSize: 12 }} />
              <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                {(data?.waterChart ?? []).map((entry, index) => (
                  <Cell key={index} fill={entry.day === 'Today' ? '#4caf60' : '#a5d6a7'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-[#d4e8d6]">
          <h2 className="font-semibold text-[#0f1a10] mb-4 text-[15px]">Today's Irrigation Schedule</h2>
          {isLoading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <div className="divide-y divide-[#d4e8d6]">
              {(data?.schedule ?? []).map((s, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-[13px] font-medium text-[#1a2b1c]">{s.name}</div>
                    <div className="text-[11px] text-[#7a9e80]">{s.meta}</div>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${BADGE_STYLES[s.badge] ?? 'bg-gray-100 text-gray-600'}`}>{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mandi Prices */}
        <div className="bg-white rounded-xl p-5 border border-[#d4e8d6]">
          <h2 className="font-semibold text-[#0f1a10] mb-1 text-[15px]">Mandi Market Prices</h2>
          <p className="text-[11px] text-[#7a9e80] mb-4">MSP & APMC rates · Updated daily</p>
          <div className="space-y-3">
            {MANDI_MOCK.map((m, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-[#1a2b1c]">{m.crop}</span>
                <div className="text-right">
                  <div className="text-[13px] font-semibold text-[#245229]">{m.price}</div>
                  <div className={`text-[11px] ${m.trend.startsWith('↑') ? 'text-[#4caf60]' : m.trend.startsWith('↓') ? 'text-[#c0392b]' : 'text-[#7a9e80]'}`}>{m.trend}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[#d4e8d6] text-[10px] text-[#7a9e80]">Source: APMC / e-NAM</div>
        </div>
      </div>
    </div>
  );
}
