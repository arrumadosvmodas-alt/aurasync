import type { CompleteCatalog, ContentItem, Recommendation } from './client';

const PUBLIC_AUDIO = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav';

function item(
  id: string,
  title: string,
  type: ContentItem['type'],
  description: string,
  image: string,
  duration: number,
  axes: string[],
  moods: string[],
  loopable = false,
): ContentItem {
  return {
    id,
    title,
    description,
    type,
    spiritual_axis: axes,
    mood_tags: moods,
    duration_seconds: duration,
    is_premium: false,
    cover_image: {
      id: `cover_${id}`,
      title,
      url: image,
      colors: [],
      visual_tags: [],
      spiritual_axis: axes,
      attribution: null,
    },
    audio: type === 'breathing' ? [] : [
      {
        id: `audio_${id}`,
        url: PUBLIC_AUDIO,
        format: 'wav',
        is_loopable: loopable,
      },
    ],
    binaural: type === 'binaural' ? {
      left_hz: 150,
      right_hz: 154,
      beat_hz: 4,
      base_noise: 'brown',
      ambience: null,
    } : null,
    attributions: [],
  };
}

export const FALLBACK_CATALOG: ContentItem[] = [
  item('fb_binaural_aguas', '?guas Profundas', 'binaural', 'Prepara??o para sono e relaxamento profundo.', 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=800&auto=format&fit=crop', 1200, ['water', 'night'], ['calm', 'deep'], true),
  item('fb_binaural_portal', 'Portal da Calma', 'binaural', 'Batida suave para desacelerar e contemplar.', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop', 900, ['water', 'ether'], ['calm'], true),
  item('fb_binaural_foco', 'Clareira do Foco', 'binaural', 'Foco leve e presen?a mental.', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop', 900, ['air', 'fire'], ['focused'], true),
  item('fb_binaural_raiz', 'Raiz da Montanha', 'binaural', 'Aterramento e estabilidade interior.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop', 900, ['earth', 'root'], ['grounded'], true),
  item('fb_binaural_silencio', 'Sil?ncio Expandido', 'binaural', 'Contempla??o profunda e quietude.', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop', 1200, ['ether', 'sky'], ['vast'], true),

  item('fb_med_zen', 'Medita??o Zen da Manh?', 'meditation', 'Comece seu dia com calma e presen?a plena.', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop', 600, ['air', 'light'], ['calm']),
  item('fb_med_enraizamento', 'Medita??o Guiada: Enraizamento', 'meditation', 'Conecte-se ? terra e estabilize sua energia.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop', 900, ['earth', 'root'], ['grounded']),
  item('fb_med_silencio', 'Medita??o do Sil?ncio Interior', 'meditation', 'Mergulhe na profundidade do seu ser.', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop', 1200, ['ether', 'night'], ['deep']),
  item('fb_med_vipassana', 'Medita??o Vipassana: Observa??o', 'meditation', 'Observe pensamentos sem julgamento.', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop', 1500, ['ether', 'air'], ['focused']),
  item('fb_med_metta', 'Medita??o Metta: Compaix?o Infinita', 'meditation', 'Cultive amor incondicional por si e pelos outros.', 'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?q=80&w=800&auto=format&fit=crop', 900, ['heart', 'light'], ['warm']),
  item('fb_med_body_scan', 'Medita??o Body Scan Profundo', 'meditation', 'Percorra o corpo com consci?ncia plena.', 'https://images.unsplash.com/photo-1437482078695-73f5ca6c96e3?q=80&w=800&auto=format&fit=crop', 1200, ['earth', 'root'], ['calm']),

  item('fb_sound_floresta', 'Sons da Floresta Tropical', 'soundscape', 'Ambiente natural com floresta, p?ssaros e ?gua.', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop', 1800, ['water', 'earth'], ['calm'], true),
  item('fb_sound_chuva', 'Chuva Relaxante', 'soundscape', 'Chuva meditativa para descanso.', 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop', 1800, ['water', 'night'], ['calm'], true),
  item('fb_sound_oceano', 'Oceano ao Amanhecer', 'soundscape', 'Ondas suaves e sons costeiros.', 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=800&auto=format&fit=crop', 1800, ['water', 'light'], ['luminous'], true),
  item('fb_sound_pinheiros', 'Floresta de Pinheiros ? Noite', 'soundscape', 'Ambiente florestal profundo e noturno.', 'https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?q=80&w=800&auto=format&fit=crop', 1800, ['earth', 'night'], ['deep'], true),
  item('fb_sound_ribeirao', 'Ribeir?o Cristalino', 'soundscape', '?gua corrente pura com p?ssaros ao fundo.', 'https://images.unsplash.com/photo-1437482078695-73f5ca6c96e3?q=80&w=800&auto=format&fit=crop', 1800, ['water', 'root'], ['gentle'], true),
  item('fb_sound_tempestade', 'Tempestade Distante', 'soundscape', 'Trov?o e chuva para medita??o profunda.', 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=800&auto=format&fit=crop', 2400, ['water', 'ether'], ['contemplative'], true),

  item('fb_music_harmonia', 'Harmonia Celestial', 'music', 'M?sica ambiente minimalista com tons puros.', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop', 900, ['ether', 'light'], ['luminous']),
  item('fb_music_cura', 'Acordes da Cura', 'music', 'Frequ?ncias de relaxamento profundo.', 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?q=80&w=800&auto=format&fit=crop', 1200, ['heart', 'light'], ['healing']),
  item('fb_music_piano', 'Piano Meditativo', 'music', 'Composi??o delicada para contempla??o e paz.', 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=800&auto=format&fit=crop', 1500, ['heart', 'ether'], ['gentle']),
  item('fb_music_cristais', 'Cristais Cantadores', 'music', 'Paisagem sonora para expans?o de consci?ncia.', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop', 1800, ['ether', 'fire'], ['vast']),

  item('fb_breath_478', 'Respira??o 4-7-8', 'breathing', 'Inspire por 4, segure por 7, expire por 8.', 'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?q=80&w=800&auto=format&fit=crop', 300, ['night', 'water'], ['calm']),
  item('fb_breath_446', 'Respira??o Fluida 4-4-6', 'breathing', 'Ritmo fluido para soltar tens?o.', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop', 300, ['water', 'air'], ['airy']),
  item('fb_breath_4444', 'Respira??o Quadrada 4-4-4-4', 'breathing', 'Clareza e presen?a em tempos iguais.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop', 300, ['air', 'earth'], ['focused']),
];

function category(type: ContentItem['type'], name: string, icon: string, description: string) {
  const items = FALLBACK_CATALOG.filter((entry) => entry.type === type);
  return { name, icon, description, count: items.length, items };
}

export const FALLBACK_COMPLETE_CATALOG: CompleteCatalog = {
  catalog: {
    binaural: category('binaural', 'Sess?es Binaurais', 'waveform', 'Batidas para estados mentais contemplativos'),
    meditation: category('meditation', 'Medita??es Guiadas', 'spa', 'Pr?ticas meditativas orientadas'),
    soundscape: category('soundscape', 'Sons da Natureza', 'tree', 'Ambientes sonoros naturais'),
    music: category('music', 'M?sica Ambiente', 'music', 'Composi??es harm?nicas'),
    breathing: category('breathing', 'Pr?ticas de Respira??o', 'weather-windy', 'Exerc?cios respirat?rios'),
  },
  images: {
    name: 'Imagens Contemplativas',
    icon: 'image',
    description: 'Imagens de apoio contemplativo',
    count: FALLBACK_CATALOG.length,
    items: FALLBACK_CATALOG.map((entry) => entry.cover_image!).filter(Boolean),
  },
  playlists: {
    name: 'Playlists Tem?ticas',
    icon: 'playlist-music',
    description: 'Sele??es curatoriais locais',
    count: 0,
    items: [],
  },
  summary: {
    total_content_items: FALLBACK_CATALOG.length,
    breakdown_by_type: {
      binaural: FALLBACK_CATALOG.filter((entry) => entry.type === 'binaural').length,
      meditation: FALLBACK_CATALOG.filter((entry) => entry.type === 'meditation').length,
      soundscape: FALLBACK_CATALOG.filter((entry) => entry.type === 'soundscape').length,
      music: FALLBACK_CATALOG.filter((entry) => entry.type === 'music').length,
      breathing: FALLBACK_CATALOG.filter((entry) => entry.type === 'breathing').length,
    },
    total_images: FALLBACK_CATALOG.length,
    total_playlists: 0,
    total_categories: 5,
    storage_size_mb: 0,
  },
};

export const FALLBACK_RECOMMENDATIONS: Recommendation[] = FALLBACK_CATALOG
  .filter((entry) => entry.type !== 'breathing')
  .slice(0, 8)
  .map((entry, index) => ({
    item: entry,
    score: 95 - index * 3,
    reasons: ['biblioteca offline embutida'],
  }));
