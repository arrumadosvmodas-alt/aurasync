export const API_BASE = 'http://localhost:8000';

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

export async function adminApi<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const { method = 'GET', body } = options;
  const resp = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': getAdminToken(),
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
