import { authHeader } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
      ...init?.headers,
    },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

async function upload(path: string, file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: authHeader(),
    body: form,
  });
  if (!res.ok) throw new Error(await res.text() || res.statusText);
  return res.json();
}

export const api = {
  get: <T>(path: string, init?: RequestInit) =>
    request<T>(path, { method: 'GET', ...init }),
  post: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), ...init }),
  put: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body), ...init }),
  patch: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body), ...init }),
  delete: <T>(path: string, init?: RequestInit) =>
    request<T>(path, { method: 'DELETE', ...init }),
  upload,
};
