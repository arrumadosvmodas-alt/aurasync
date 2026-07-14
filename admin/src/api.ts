export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ImageAsset {
  id: string;
  title: string;
  url: string | null;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  type: string;
  spiritual_axis: string[];
  mood_tags: string[];
  duration_seconds: number | null;
  is_premium: boolean;
  is_active: boolean;
  published_at: string | null;
  cover_image: ImageAsset | null;
  audio: { id: string; url: string; format: string }[];
  attributions: string[];
}

export interface User {
  id: string;
  email: string;
  display_name: string | null;
  cpf: string | null;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string | null;
  token_type: string;
}

export const CONTENT_TYPES = ['music', 'meditation', 'soundscape', 'binaural', 'breathing'] as const;

export const AXES = [
  'earth', 'water', 'fire', 'air', 'ether', 'light', 'night', 'root', 'heart', 'sky',
] as const;

export function getAdminToken(): string {
  return localStorage.getItem('aurasync.admin_token') ?? '';
}

export function setAdminToken(token: string): void {
  localStorage.setItem('aurasync.admin_token', token);
}

export function clearAdminToken(): void {
  localStorage.removeItem('aurasync.admin_token');
}

export async function adminApi<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const { method = 'GET', body } = options;
  const token = getAdminToken();
  const resp = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!resp.ok) {
    let detail = `HTTP ${resp.status}`;
    try {
      const data = await resp.json();
      if (typeof data.detail === 'string') detail = data.detail;
    } catch {
      // corpo não-JSON: mantém o código HTTP
    }
    throw new Error(detail);
  }
  if (resp.status === 204) return undefined as T;
  return resp.json() as Promise<T>;
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const resp = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!resp.ok) {
    let detail = `HTTP ${resp.status}`;
    try {
      const data = await resp.json();
      if (typeof data.detail === 'string') detail = data.detail;
    } catch {
      // nada
    }
    throw new Error(detail);
  }
  return resp.json();
}
