'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

const NAV = [
  { href: '/', icon: '📊', label: 'Dashboard', group: 'Overview' },
  { href: '/irrigation', icon: '💧', label: 'Irrigation', group: 'Overview' },
  { href: '/disease', icon: '🔬', label: 'Disease Detection', group: 'AI Features' },
  { href: '/crops', icon: '🌾', label: 'Crop Advisor', group: 'AI Features' },
  { href: '/chat', icon: '🤖', label: 'Farm AI Chat', group: 'AI Features' },
  { href: '/sensors', icon: '📡', label: 'Sensors & Data', group: 'System' },
  { href: '/settings', icon: '⚙️', label: 'Settings', group: 'System' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const groups = [...new Set(NAV.map(n => n.group))];

  return (
    <aside className="w-[248px] bg-[#1a3a1f] flex flex-col fixed top-0 left-0 h-screen z-50">
      {/* Brand */}
      <div className="p-6 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4caf60] to-[#3d8b47] flex items-center justify-center text-xl mb-3 shadow-lg">🌿</div>
        <div className="font-serif text-xl text-white">Agro Mind</div>
        <div className="text-[10px] text-[#a5d6a7] uppercase tracking-widest mt-1 opacity-70">Smart Crop Intelligence</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {groups.map(group => (
          <div key={group}>
            <div className="px-5 pt-4 pb-1 text-[9.5px] font-bold uppercase tracking-widest text-[#4caf60] opacity-60">{group}</div>
            {NAV.filter(n => n.group === group).map(n => (
              <Link key={n.href} href={n.href}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 mx-2 rounded-lg text-[13.5px] transition-all ${
                  pathname === n.href
                    ? 'bg-gradient-to-r from-[#2d6a35] to-[#245229] text-white font-medium shadow-md'
                    : 'text-[#c8e6ca]/75 hover:bg-white/5 hover:text-white'
                }`}>
                <span className="text-[15px] w-5 text-center">{n.icon}</span>
                {n.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#2d6a35] flex items-center justify-center text-base">👨‍🌾</div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold text-[#cde8cf] truncate">{user?.name ?? 'Guest'}</div>
            <div className="text-[11px] text-[#7a9e80] capitalize">{user?.role ?? 'visitor'}</div>
          </div>
          {user && <button onClick={logout} className="text-[11px] text-[#7a9e80] hover:text-white transition-colors">Exit</button>}
        </div>
      </div>
    </aside>
  );
}
