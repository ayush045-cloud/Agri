import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';

export const metadata: Metadata = {
  title: 'Agro Mind — Smart Irrigation & Crop Intelligence',
  description: 'AI-powered agricultural dashboard for Indian farmers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="ml-[248px] flex-1 flex flex-col min-h-screen">
              <TopBar />
              <main className="flex-1 p-7 bg-[#f4f9f4]">{children}</main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
