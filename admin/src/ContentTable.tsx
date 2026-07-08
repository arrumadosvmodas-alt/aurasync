import { Fragment, useState } from 'react';

import { adminApi } from './api';
import type { ContentItem } from './api';

const AXIS_LABELS: Record<string, string> = {
  earth: 'Terra', water: 'Água', fire: 'Fogo', air: 'Ar', ether: 'Éter',
  light: 'Luz', night: 'Noite', root: 'Raiz', heart: 'Coração', sky: 'Céu',
};

export function ContentTable({
  items,
  onChange,
}: {
  items: ContentItem[];
  onChange: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const publish = async (item: ContentItem) => {
    setBusyId(item.id);
    setErrors((prev) => ({ ...prev, [item.id]: '' }));
    try {
      await adminApi(`/admin/content/${item.id}/publish`, { method: 'POST' });
      onChange();
    } catch (e) {
      setErrors((prev) => ({
        ...prev,
        [item.id]: e instanceof Error ? e.message : 'Erro ao publicar',
      }));
    } finally {
      setBusyId(null);
    }
  };

  const unpublish = async (item: ContentItem) => {
    setBusyId(item.id);
    try {
      await adminApi(`/admin/content/${item.id}/unpublish`, { method: 'POST' });
      onChange();
    } finally {
      setBusyId(null);
    }
  };

  const togglePremium = async (item: ContentItem) => {
    setBusyId(item.id);
    try {
      await adminApi(`/admin/content/${item.id}`, {
        method: 'PATCH',
        body: { is_premium: !item.is_premium },
      });
      onChange();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="card">
      <h2>Catálogo ({items.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Título</th>
            <th>Tipo</th>
            <th>Eixos</th>
            <th>Áudio</th>
            <th>Status</th>
            <th>Premium</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <Fragment key={item.id}>
              <tr>
                <td>{item.title}</td>
                <td>{item.type}</td>
                <td>{item.spiritual_axis.map((a) => AXIS_LABELS[a] ?? a).join(', ') || '—'}</td>
                <td>{item.audio.length > 0 ? '✓' : item.type === 'breathing' ? '—' : '⚠ falta'}</td>
                <td>
                  <span className={`badge ${item.published_at ? 'published' : 'draft'}`}>
                    {item.published_at ? 'publicado' : 'rascunho'}
                  </span>
                </td>
                <td>
                  <button
                    className="secondary"
                    disabled={busyId === item.id}
                    onClick={() => togglePremium(item)}
                  >
                    {item.is_premium ? 'Premium' : 'Gratuito'}
                  </button>
                </td>
                <td>
                  {item.published_at ? (
                    <button className="secondary" disabled={busyId === item.id} onClick={() => unpublish(item)}>
                      Despublicar
                    </button>
                  ) : (
                    <button disabled={busyId === item.id} onClick={() => publish(item)}>
                      Publicar
                    </button>
                  )}
                </td>
              </tr>
              {errors[item.id] ? (
                <tr>
                  <td colSpan={7}>
                    <p className="error">{errors[item.id]}</p>
                  </td>
                </tr>
              ) : null}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
