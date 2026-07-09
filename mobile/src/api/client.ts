// Ler URL da API via variável de ambiente EXPO_PUBLIC_API_URL
// Default: http://localhost:8000 (dev local)
// Produção: https://aurasync-api.vercel.app (ou URL do seu backend)
export const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export interface ImageAsset {
  id: string;
  title: string;
  url: string | null;
  colors: string[];
  visual_tags: string[];
  spiritual_axis: string[];
  attribution: string | null;
}

export interface AudioAsset {
  id: string;
  url: string;
  format: string;
  is_loopable: boolean;
}

export interface BinauralInfo {
  left_hz: number;
  right_hz: number;
  beat_hz: number;
  base_noise: string;
  ambience: string | null;
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
  cover_image: ImageAsset | null;
  audio: AudioAsset[];
  binaural: BinauralInfo | null;
  attributions: string[];
}

export interface Recommendation {
  item: ContentItem;
  score: number;
  reasons: string[];
}

export interface JourneyStep {
  id: string;
  day_number: number;
  title: string;
  content_item_id: string | null;
  image_asset_id: string | null;
  contemplation_text: string | null;
  breathing_pattern: string | null;
}

export interface Journey {
  id: string;
  title: string;
  description: string | null;
  spiritual_axis: string;
  objective: string | null;
  total_days: number;
  level: string;
  is_premium: boolean;
  steps: JourneyStep[];
}

export function mediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

export async function api<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null } = {},
): Promise<T> {
  const { method = 'GET', body, token } = options;
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
  return resp.json() as Promise<T>;
}
