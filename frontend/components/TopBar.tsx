'use client';
import { usePathname } from 'next/navigation';

const TITLES: Record<string, string> = {
  '/': 'Farm Dashboard',
  '/irrigation': 'Smart Irrigation',
  '/disease': 'Disease Detection',
  '/crops': 'Crop Advisor',
  '/chat': 'Farm AI Chat',
  '/sensors': 'Sensors & Data',
  '/settings': 'Settings',
};

export function TopBar() {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? 'Agro Mind';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <header className="h-[60px] bg-white border-b border-[#d4e8d6] px-7 flex items-center justify-between sticky top-0 z-40">
      <div>
        <div className="text-[15px] font-semibold text-[#0f1a10]">{title}</div>
        <div className="text-[11.5px] text-[#7a9e80]">{dateStr}</div>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e8f5eb] text-[#245229] text-[12px] font-medium border border-[#d4e8d6]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4caf60] animate-pulse" />
          Live
        </span>
      </div>
    </header>
  );
}
