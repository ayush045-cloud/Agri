'use client';
import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface DiseaseResult {
  type: string; title: string; desc: string; conf: number; col: string; disease: string; treatment: string; imageUrl: string;
}

const TYPE_COLORS: Record<string, string> = {
  danger: 'border-[#c0392b] bg-[#ffebee]',
  warning: 'border-[#e6a817] bg-[#fdf6e3]',
  healthy: 'border-[#4caf60] bg-[#e8f5eb]',
};

export default function DiseasePage() {
  const [dragging, setDragging] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function analyse(file: File) {
    setAnalysing(true); setResult(null); setError('');
    const fd = new FormData(); fd.append('image', file);
    try {
      const r = await api.postForm<DiseaseResult>('/api/disease/analyse', fd);
      setResult(r);
    } catch { setError('Analysis failed. Please try again.'); } finally { setAnalysing(false); }
  }

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    analyse(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-[#0f1a10]">AI Disease Detection</h1>
        <p className="text-[13px] text-[#7a9e80] mt-0.5">Upload a crop leaf photo for instant AI analysis</p>
      </div>

      {/* Upload Zone */}
      <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragging ? 'border-[#4caf60] bg-[#e8f5eb]' : 'border-[#d4e8d6] hover:border-[#4caf60] hover:bg-[#f3faf4]'}`}>
        <input type="file" accept="image/*" className="hidden" id="img-upload" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        <label htmlFor="img-upload" className="cursor-pointer">
          <div className="text-4xl mb-3">{preview ? '' : '📷'}</div>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="preview" className="max-h-40 mx-auto rounded-lg object-cover" />
          ) : (
            <>
              <div className="text-[15px] font-medium text-[#1a2b1c]">Drop plant image here or click to upload</div>
              <div className="text-[12px] text-[#7a9e80] mt-1">JPEG, PNG, WebP up to 10 MB</div>
            </>
          )}
        </label>
      </div>

      {analysing && (
        <div className="flex items-center gap-3 p-4 bg-[#e8f0fa] rounded-xl text-[13px] text-[#2563a8]">
          <span className="animate-spin">🔄</span> Analysing image with AI model…
        </div>
      )}

      {error && <div className="p-4 bg-[#ffebee] text-[#c0392b] rounded-xl text-[13px]">{error}</div>}

      {result && (
        <div className={`border-2 rounded-xl p-5 ${TYPE_COLORS[result.type] ?? 'border-[#d4e8d6] bg-white'}`}>
          <div className="flex items-start gap-4">
            {result.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`http://localhost:3001${result.imageUrl}`} alt="uploaded" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
            )}
            <div className="flex-1">
              <div className="text-[16px] font-semibold text-[#0f1a10]">{result.title}</div>
              <div className="text-[13px] text-[#3d5240] mt-1">{result.desc}</div>
              <div className="text-[12px] font-medium mt-2" style={{ color: result.col }}>Confidence: {Math.round(result.conf)}%</div>
              {result.treatment && (
                <div className="mt-3 p-3 bg-white/60 rounded-lg">
                  <div className="text-[12px] font-semibold text-[#1a2b1c] mb-1">💊 Treatment</div>
                  <div className="text-[12px] text-[#3d5240]">{result.treatment}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
