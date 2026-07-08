import { useCallback, useEffect, useState } from 'react';

import { adminApi, getAdminToken, setAdminToken } from './api';
import type { ContentItem } from './api';
import { ContentForm } from './ContentForm';
import { ContentTable } from './ContentTable';

function TokenGate({ onReady }: { onReady: () => void }) {
  const [token, setToken] = useState(getAdminToken());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    setAdminToken(token);
    try {
      await adminApi('/admin/content');
      onReady();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Token inválido');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: '80px auto' }}>
      <h1>AuraSync CMS</h1>
      <p className="hint">Token de admin (dev: "dev-admin-token")</p>
      <label>X-Admin-Token</label>
      <input value={token} onChange={(e) => setToken(e.target.value)} type="password" />
      {error ? <p className="error">{error}</p> : null}
      <div style={{ marginTop: 16 }}>
        <button onClick={submit} disabled={busy || !token}>
          {busy ? 'Verificando…' : 'Entrar'}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setItems(await adminApi<ContentItem[]>('/admin/content'));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar catálogo');
    }
  }, []);

  useEffect(() => {
    if (ready) load();
  }, [ready, load]);

  if (!ready) {
    return <TokenGate onReady={() => setReady(true)} />;
  }

  return (
    <div>
      <h1>AuraSync — CMS</h1>
      <p className="hint" style={{ marginBottom: 20 }}>
        Curadoria de conteúdo com licenciamento obrigatório. Nenhum áudio publica
        sem fonte, autor e licença registrados.
      </p>
      {error ? <p className="error">{error}</p> : null}
      <ContentForm onCreated={load} />
      <ContentTable items={items} onChange={load} />
    </div>
  );
}
