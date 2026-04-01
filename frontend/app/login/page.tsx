'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export default function LoginPage() {
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(name, email, password);
      router.push('/');
    } catch { setError('Invalid credentials. Please try again.'); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#f4f9f4] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm border border-[#d4e8d6] shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4caf60] to-[#3d8b47] flex items-center justify-center text-2xl mx-auto mb-3 shadow-lg">🌿</div>
          <div className="font-serif text-2xl text-[#0f2412]">Agro Mind</div>
          <div className="text-[12px] text-[#7a9e80] mt-1">{mode === 'login' ? 'Sign in to your farm dashboard' : 'Create your farm account'}</div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' && (
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" required
              className="w-full border border-[#d4e8d6] rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#4caf60]/30" />
          )}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required
            className="w-full border border-[#d4e8d6] rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#4caf60]/30" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required
            className="w-full border border-[#d4e8d6] rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#4caf60]/30" />
          {error && <div className="text-[12px] text-[#c0392b]">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-[#3d8b47] text-white rounded-lg text-[13px] font-medium hover:bg-[#2d6a35] transition-colors disabled:opacity-50">
            {loading ? '…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-4 text-center text-[12px] text-[#7a9e80]">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setMode(m => m === 'login' ? 'register' : 'login')} className="text-[#3d8b47] font-medium hover:underline">
            {mode === 'login' ? 'Register' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
