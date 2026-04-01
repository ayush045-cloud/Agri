'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './api';

interface AuthUser { id: string; email: string; name: string; role: string; }
interface AuthCtx { user: AuthUser | null; login: (email: string, password: string) => Promise<void>; register: (name: string, email: string, password: string) => Promise<void>; logout: () => void; loading: boolean; }

const Ctx = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('agro_user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const data = await api.post<{ token: string; user: AuthUser }>('/api/auth/login', { email, password });
    localStorage.setItem('agro_token', data.token);
    localStorage.setItem('agro_user', JSON.stringify(data.user));
    setUser(data.user);
  }

  async function register(name: string, email: string, password: string) {
    const data = await api.post<{ token: string; user: AuthUser }>('/api/auth/register', { name, email, password });
    localStorage.setItem('agro_token', data.token);
    localStorage.setItem('agro_user', JSON.stringify(data.user));
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('agro_token');
    localStorage.removeItem('agro_user');
    setUser(null);
  }

  return <Ctx.Provider value={{ user, login, register, logout, loading }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
