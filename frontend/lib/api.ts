const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function authHeader(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('agro_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: authHeader() });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

async function postForm<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { method: 'POST', headers: authHeader(), body: formData });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

export const api = { get, post, postForm };
