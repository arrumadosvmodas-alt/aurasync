import { useState } from 'react';

import { adminApi, AXES, CONTENT_TYPES } from './api';

const AXIS_LABELS: Record<string, string> = {
  earth: 'Terra', water: 'Água', fire: 'Fogo', air: 'Ar', ether: 'Éter',
  light: 'Luz', night: 'Noite', root: 'Raiz', heart: 'Coração', sky: 'Céu',
};

const SAFE_LICENSES = ['Proprietary (obra própria)', 'CC0', 'CC BY 4.0', 'Public Domain'];

export function ContentForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<string>('soundscape');
  const [axes, setAxes] = useState<string[]>([]);
  const [duration, setDuration] = useState('300');
  const [isPremium, setIsPremium] = useState(false);

  const [storagePath, setStoragePath] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [licenseName, setLicenseName] = useState(SAFE_LICENSES[0]);
  const [attributionRequired, setAttributionRequired] = useState(false);
  const [attributionText, setAttributionText] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const toggleAxis = (axis: string) => {
    setAxes((prev) => (prev.includes(axis) ? prev.filter((a) => a !== axis) : [...prev, axis]));
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const content = await adminApi<{ id: string }>('/admin/content', {
        method: 'POST',
        body: {
          title,
          description: description || null,
          type,
          spiritual_axis: axes,
          mood_tags: [],
          duration_seconds: duration ? parseInt(duration, 10) : null,
          is_premium: isPremium,
        },
      });

      // Práticas de respiração podem não ter áudio próprio.
      if (storagePath) {
        const audio = await adminApi<{ id: string }>(`/admin/content/${content.id}/audio`, {
          method: 'POST',
          body: { storage_path: storagePath, format: storagePath.split('.').pop() ?? 'wav' },
        });
        await adminApi('/admin/licenses', {
          method: 'POST',
          body: {
            asset_type: 'audio',
            asset_id: audio.id,
            source_name: sourceName || 'AuraSync (conteúdo próprio)',
            source_url: sourceUrl || null,
            author_name: authorName || null,
            license_name: licenseName,
            attribution_required: attributionRequired,
            attribution_text: attributionRequired ? attributionText : null,
            commercial_use_allowed: true,
            derivative_allowed: true,
          },
        });
      }

      setSuccess(`Conteúdo "${title}" criado como rascunho. Publique na tabela abaixo.`);
      setTitle('');
      setDescription('');
      setAxes([]);
      setStoragePath('');
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao criar conteúdo');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <h2>Novo conteúdo</h2>
      <p className="hint">
        Todo asset de áudio precisa de licença registrada antes de poder ser publicado.
      </p>

      <label>Título</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Chuva Leve em Floresta" />

      <label>Descrição</label>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />

      <div className="row">
        <div>
          <label>Tipo</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {CONTENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Duração (segundos)</label>
          <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
        </div>
      </div>

      <label>Eixos espirituais</label>
      <div className="chip-row">
        {AXES.map((axis) => (
          <span
            key={axis}
            className={`chip ${axes.includes(axis) ? 'active' : ''}`}
            onClick={() => toggleAxis(axis)}
          >
            {AXIS_LABELS[axis]}
          </span>
        ))}
      </div>

      <label>
        <input
          type="checkbox"
          style={{ width: 'auto', marginRight: 6 }}
          checked={isPremium}
          onChange={(e) => setIsPremium(e.target.checked)}
        />
        Conteúdo premium
      </label>

      <hr style={{ border: 'none', borderTop: '1px solid var(--surface-light)', margin: '20px 0' }} />
      <h3>Asset de áudio e licença (opcional para práticas de respiração)</h3>

      <label>Caminho em storage/ (ex.: audio/chuva.wav)</label>
      <input value={storagePath} onChange={(e) => setStoragePath(e.target.value)} placeholder="audio/arquivo.wav" />

      {storagePath ? (
        <>
          <div className="row">
            <div>
              <label>Fonte</label>
              <input value={sourceName} onChange={(e) => setSourceName(e.target.value)} placeholder="Freesound, Musopen, AuraSync..." />
            </div>
            <div>
              <label>URL da fonte</label>
              <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
            </div>
          </div>
          <div className="row">
            <div>
              <label>Autor</label>
              <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
            </div>
            <div>
              <label>Licença</label>
              <select value={licenseName} onChange={(e) => setLicenseName(e.target.value)}>
                {SAFE_LICENSES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
          <label>
            <input
              type="checkbox"
              style={{ width: 'auto', marginRight: 6 }}
              checked={attributionRequired}
              onChange={(e) => setAttributionRequired(e.target.checked)}
            />
            Exige atribuição
          </label>
          {attributionRequired ? (
            <>
              <label>Texto de atribuição</label>
              <input value={attributionText} onChange={(e) => setAttributionText(e.target.value)} />
            </>
          ) : null}
        </>
      ) : null}

      {error ? <p className="error">{error}</p> : null}
      {success ? <p className="hint" style={{ color: 'var(--success)' }}>{success}</p> : null}

      <div style={{ marginTop: 16 }}>
        <button onClick={submit} disabled={busy || !title}>
          {busy ? 'Salvando…' : 'Criar conteúdo'}
        </button>
      </div>
    </div>
  );
}
