'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

interface CropResult { emoji: string; name: string; score: number; why: string; }

const SOILS = ['loamy','clay','sandy','silt','black','red'];
const SEASONS = ['rabi','kharif','zaid'];
const STATES = ['Punjab','Haryana','UP','Maharashtra','MP','Rajasthan','Gujarat','AP','Karnataka'];

export default function CropsPage() {
  const [form, setForm] = useState({ soil: 'loamy', ph: '6.5', rainfall: '800', temp: '25', region: 'Punjab', season: 'rabi', nitrogen: 'medium', water: 'moderate' });
  const [results, setResults] = useState<{ crops: CropResult[]; summary: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function recommend() {
    setLoading(true); setError('');
    try { const r = await api.post<{ crops: CropResult[]; summary: string }>('/api/crops/recommend', form); setResults(r); }
    catch { setError('Recommendation service unavailable.'); } finally { setLoading(false); }
  }

  const field = (label: string, key: keyof typeof form, type: 'text'|'number' = 'text') => (
    <div>
      <label className="block text-[12px] font-medium text-[#3d5240] mb-1">{label}</label>
      <input type={type} value={form[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
        className="w-full border border-[#d4e8d6] rounded-lg px-3 py-2 text-[13px] text-[#1a2b1c] focus:outline-none focus:ring-2 focus:ring-[#4caf60]/30 bg-white" />
    </div>
  );
  const select = (label: string, key: keyof typeof form, opts: string[]) => (
    <div>
      <label className="block text-[12px] font-medium text-[#3d5240] mb-1">{label}</label>
      <select value={form[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
        className="w-full border border-[#d4e8d6] rounded-lg px-3 py-2 text-[13px] text-[#1a2b1c] focus:outline-none focus:ring-2 focus:ring-[#4caf60]/30 bg-white">
        {opts.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-[#0f1a10]">AI Crop Advisor</h1>
        <p className="text-[13px] text-[#7a9e80] mt-0.5">Get personalised crop recommendations based on your soil and conditions</p>
      </div>

      <div className="bg-white rounded-xl p-5 border border-[#d4e8d6]">
        <h2 className="font-semibold text-[#0f1a10] mb-4 text-[14px]">Farm Conditions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {select('Soil Type', 'soil', SOILS)}
          {field('pH Level', 'ph', 'number')}
          {field('Rainfall (mm)', 'rainfall', 'number')}
          {field('Temperature (°C)', 'temp', 'number')}
          {select('State / Region', 'region', STATES)}
          {select('Season', 'season', SEASONS)}
          {select('Nitrogen Level', 'nitrogen', ['low','medium','high'])}
          {select('Water Availability', 'water', ['scarce','moderate','abundant'])}
        </div>
        <button onClick={recommend} disabled={loading}
          className="px-5 py-2.5 bg-[#3d8b47] text-white rounded-lg text-[13px] font-medium hover:bg-[#2d6a35] transition-colors disabled:opacity-50">
          {loading ? '🔄 Analysing…' : '🌾 Get Recommendations'}
        </button>
        {error && <p className="mt-2 text-[12px] text-[#c0392b]">{error}</p>}
      </div>

      {results && (
        <>
          {results.summary && (
            <div className="p-4 bg-[#e8f5eb] border border-[#4caf60]/30 rounded-xl text-[13px] text-[#245229]">{results.summary}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.crops.map((c, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-[#d4e8d6]">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{c.emoji}</span>
                  <div>
                    <div className="font-semibold text-[#0f1a10] text-[14px]">{c.name}</div>
                    <div className="text-[11px] text-[#7a9e80]">Match Score</div>
                  </div>
                  <div className="ml-auto text-[18px] font-bold text-[#3d8b47]">{c.score}%</div>
                </div>
                <div className="h-1.5 bg-[#d4e8d6] rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-[#4caf60] rounded-full" style={{ width: `${c.score}%` }} />
                </div>
                <div className="text-[12px] text-[#3d5240]">{c.why}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
