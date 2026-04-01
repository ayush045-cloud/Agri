'use client';
import useSWR from 'swr';
import { useState } from 'react';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/Skeleton';
import { useSensors } from '@/lib/useSensors';

interface ScheduleItem { id?: string; name: string; meta: string; badge: string; label: string; status?: string; fieldId?: string; }

const BADGE: Record<string, string> = {
  'badge-done': 'bg-[#e8f5eb] text-[#245229]',
  'badge-active': 'bg-[#e8f0fa] text-[#2563a8]',
  'badge-soon': 'bg-[#fdf6e3] text-[#7a5400]',
  'badge-urgent': 'bg-[#ffebee] text-[#c0392b]',
};

export default function IrrigationPage() {
  const { data, isLoading, mutate } = useSWR('schedule', () => api.get<{ schedule: ScheduleItem[] }>('/api/irrigation/schedule'), { refreshInterval: 15000 });
  const { pumpStatus } = useSensors();
  const [accepting, setAccepting] = useState(false);

  async function acceptPlan() {
    setAccepting(true);
    try { await api.post('/api/irrigation/accept', {}); await mutate(); } finally { setAccepting(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#0f1a10]">Smart Irrigation</h1>
          <p className="text-[13px] text-[#7a9e80] mt-0.5">AI-optimised watering schedule for your fields</p>
        </div>
        <button onClick={acceptPlan} disabled={accepting}
          className="px-4 py-2 bg-[#3d8b47] text-white rounded-lg text-[13px] font-medium hover:bg-[#2d6a35] transition-colors disabled:opacity-50">
          {accepting ? 'Accepting…' : '✓ Accept Plan'}
        </button>
      </div>

      {pumpStatus && (
        <div className="p-4 bg-[#e8f0fa] border border-[#2563a8]/20 rounded-xl text-[13px] text-[#2563a8]">
          🔄 Pump {pumpStatus.status === 'active' ? 'started' : 'status updated'} for field {pumpStatus.fieldId}
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#d4e8d6]">
        <div className="p-5 border-b border-[#d4e8d6]">
          <h2 className="font-semibold text-[#0f1a10] text-[15px]">Today&apos;s Schedule</h2>
        </div>
        {isLoading ? (
          <div className="p-5 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : (
          <div className="divide-y divide-[#d4e8d6]">
            {(data?.schedule ?? []).map((s, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4">
                <div>
                  <div className="text-[13.5px] font-medium text-[#1a2b1c]">{s.name}</div>
                  <div className="text-[11.5px] text-[#7a9e80] mt-0.5">{s.meta}</div>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${BADGE[s.badge] ?? 'bg-gray-100 text-gray-600'}`}>{s.label}</span>
              </div>
            ))}
            {(data?.schedule ?? []).length === 0 && (
              <div className="px-5 py-8 text-center text-[13px] text-[#7a9e80]">No irrigation scheduled for today.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
