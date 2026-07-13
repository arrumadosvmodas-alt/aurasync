import { Platform } from 'react-native';

import { FALLBACK_CATALOG, FALLBACK_COMPLETE_CATALOG, FALLBACK_RECOMMENDATIONS } from './fallbackCatalog';

// Ler URL da API via variável de ambiente EXPO_PUBLIC_API_URL
// Default: http://localhost:8010 ou http://10.0.2.2:8010 no Android (dev local)
// Produção: https://aurasync-api.vercel.app (ou URL do seu backend)
export const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:8010' : 'http://localhost:8010');

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

const FALLBACK_IMAGES: Record<string, string> = {
  meditation: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=400&auto=format&fit=crop',
  music: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop',
  soundscape: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=400&auto=format&fit=crop',
  binaural: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=400&auto=format&fit=crop',
  breathing: 'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?q=80&w=400&auto=format&fit=crop',
};

export function coverUrl(item: ContentItem | null | undefined): string | undefined {
  const url = item?.cover_image?.url;
  if (url) return mediaUrl(url);
  if (item?.type) return FALLBACK_IMAGES[item.type];
  return FALLBACK_IMAGES.meditation;
}

export function audioUrl(item: ContentItem | null | undefined): string | undefined {
  return mediaUrl(item?.audio?.[0]?.url) || undefined;
}

export interface Playlist {
  id: string;
  title: string;
  description: string | null;
  item_count: number;
  is_premium: boolean;
}

export interface CatalogCategory {
  name: string;
  icon: string;
  description: string;
  count: number;
  items: ContentItem[];
}

export interface CompleteCatalog {
  catalog: {
    binaural: CatalogCategory;
    meditation: CatalogCategory;
    soundscape: CatalogCategory;
    music: CatalogCategory;
    breathing: CatalogCategory;
  };
  images: {
    name: string;
    icon: string;
    description: string;
    count: number;
    items: ImageAsset[];
  };
  playlists: {
    name: string;
    icon: string;
    description: string;
    count: number;
    items: Playlist[];
  };
  summary: {
    total_content_items: number;
    breakdown_by_type: {
      binaural: number;
      meditation: number;
      soundscape: number;
      music: number;
      breathing: number;
    };
    total_images: number;
    total_playlists: number;
    total_categories: number;
    storage_size_mb: number;
  };
}


function fallbackForPath<T>(path: string): T | null {
  if (path.startsWith('/catalog/complete')) return FALLBACK_COMPLETE_CATALOG as T;
  if (path.startsWith('/catalog')) return FALLBACK_CATALOG as T;
  if (path.startsWith('/recommendations')) return FALLBACK_RECOMMENDATIONS as T;
  return null;
}

async function apiIdentityError(path: string, status: number): Promise<string | null> {
  try {
    const health = await fetch(`${API_BASE}/health`);
    if (!health.ok) return null;
    const data = await health.json();
    if (data?.app !== 'AuraSync API') {
      return `API incorreta em ${API_BASE}: esperado AuraSync API, recebido ${data?.app ?? 'aplicação desconhecida'}. Verifique EXPO_PUBLIC_API_URL e a porta do backend. Rota ${path} retornou HTTP ${status}.`;
    }
  } catch {
    return null;
  }
  return null;
}

export async function api<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null } = {},
): Promise<T> {
  const { method = 'GET', body, token } = options;
  let resp: Response;

  try {
    resp = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    const fallback = fallbackForPath<T>(path);
    if (fallback) return fallback;
    throw error;
  }

  if (!resp.ok) {
    const fallback = fallbackForPath<T>(path);
    if (fallback) return fallback;

    let detail = (await apiIdentityError(path, resp.status)) || `HTTP ${resp.status}`;
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

export async function fetchCompleteCatalog(): Promise<CompleteCatalog> {
  return api<CompleteCatalog>('/catalog/complete');
}
