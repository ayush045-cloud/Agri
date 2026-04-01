'use client';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/Skeleton';

const FarmMap = dynamic(() => import('@/components/FarmMap'), { ssr: false, loading: () => <Skeleton className="h-64 w-full rounded-xl" /> });

interface Settings { farmName: string; area: number; waterSource: string; alertLanguage: string; apiUrl: string; autoIrr: boolean; weather: boolean; disease: boolean; sms: boolean; mandi: boolean; }

export default function SettingsPage() {
  const { data, isLoading } = useSWR('settings', () => api.get<{ settings: Settings | null }>('/api/settings'));
  const [form, setForm] = useState<Settings>({ farmName: '', area: 0, waterSource: 'borewell', alertLanguage: 'English', apiUrl: '', autoIrr: false, weather: true, disease: true, sms: false, mandi: false });
  const [markerPos, setMarkerPos] = useState<[number, number]>([30.9, 75.85]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data?.settings) setForm(data.settings);
  }, [data]);

  async function save() {
    setSaving(true); setSaved(false);
    try { await api.post('/api/settings', form); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    finally { setSaving(false); }
  }

  const toggle = (key: keyof Settings) => setForm(f => ({ ...f, [key]: !f[key as keyof Settings] }));
  const ToggleRow = ({ k, label }: { k: keyof Settings; label: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-[#d4e8d6] last:border-0">
      <span className="text-[13.5px] text-[#1a2b1c]">{label}</span>
      <button onClick={() => toggle(k)} className={`w-10 h-5 rounded-full transition-colors relative ${form[k] ? 'bg-[#4caf60]' : 'bg-[#d4e8d6]'}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form[k] ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );

  if (isLoading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-[#0f1a10]">Settings</h1>
        <p className="text-[13px] text-[#7a9e80] mt-0.5">Configure your farm profile, alerts, and integrations</p>
      </div>

      {/* Farm info */}
      <div className="bg-white rounded-xl p-5 border border-[#d4e8d6] space-y-4">
        <h2 className="font-semibold text-[#0f1a10] text-[14px]">Farm Profile</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-[#3d5240] mb-1">Farm Name</label>
            <input value={form.farmName} onChange={e => setForm(f => ({...f, farmName: e.target.value}))}
              className="w-full border border-[#d4e8d6] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#4caf60]/30" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#3d5240] mb-1">Total Area (ha)</label>
            <input type="number" value={form.area} onChange={e => setForm(f => ({...f, area: parseFloat(e.target.value)}))}
              className="w-full border border-[#d4e8d6] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#4caf60]/30" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#3d5240] mb-1">Water Source</label>
            <select value={form.waterSource} onChange={e => setForm(f => ({...f, waterSource: e.target.value}))}
              className="w-full border border-[#d4e8d6] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#4caf60]/30 bg-white">
              {['borewell','canal','rainwater','mixed'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#3d5240] mb-1">Alert Language</label>
            <select value={form.alertLanguage} onChange={e => setForm(f => ({...f, alertLanguage: e.target.value}))}
              className="w-full border border-[#d4e8d6] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#4caf60]/30 bg-white">
              {['English','Hindi','Punjabi','Marathi','Telugu','Tamil'].map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-xl p-5 border border-[#d4e8d6]">
        <h2 className="font-semibold text-[#0f1a10] text-[14px] mb-1">Farm Location</h2>
        <p className="text-[12px] text-[#7a9e80] mb-3">Click on the map to set your farm&apos;s coordinates</p>
        <FarmMap position={markerPos} onPositionChange={setMarkerPos} />
        <div className="mt-2 text-[11px] text-[#7a9e80]">Lat: {markerPos[0].toFixed(5)}, Lng: {markerPos[1].toFixed(5)}</div>
      </div>

      {/* Toggles */}
      <div className="bg-white rounded-xl p-5 border border-[#d4e8d6]">
        <h2 className="font-semibold text-[#0f1a10] text-[14px] mb-2">Automation &amp; Alerts</h2>
        <ToggleRow k="autoIrr" label="Auto-Irrigation (AI-triggered)" />
        <ToggleRow k="weather" label="Weather Alerts" />
        <ToggleRow k="disease" label="Disease Alerts" />
        <ToggleRow k="sms" label="SMS Alerts" />
        <ToggleRow k="mandi" label="Mandi Price Notifications" />
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving}
          className="px-5 py-2.5 bg-[#3d8b47] text-white rounded-lg text-[13px] font-medium hover:bg-[#2d6a35] transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
        {saved && <span className="text-[13px] text-[#4caf60] font-medium">✓ Saved successfully</span>}
      </div>
    </div>
  );
}
