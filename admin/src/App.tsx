import { useEffect, useState } from 'react';
import { adminApi, clearAdminToken, getAdminToken, login, setAdminToken, type User } from './api';
import type { ContentItem } from './api';
import { ContentForm } from './ContentForm';
import { ContentTable } from './ContentTable';
import { UsersTable } from './UsersTable';

function LoginScreen({ onReady }: { onReady: () => void }) {
  const [email, setEmail] = useState('admin@aurasync.app');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setBusy(true);
    setError(null);
    try {
      const result = await login(email, password);
      setAdminToken(result.access_token);
      onReady();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao fazer login');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: '80px auto' }}>
      <h1>AuraSync CMS</h1>
      <p className="hint">Faça login com sua conta de administrador</p>
      <label>E-mail</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="admin@aurasync.app"
        disabled={busy}
      />
      <label>Senha</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
        disabled={busy}
        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
      />
      {error ? <p className="error">{error}</p> : null}
      <div style={{ marginTop: 16 }}>
        <button onClick={handleLogin} disabled={busy || !email || !password}>
          {busy ? 'Entrando...' : 'Entrar'}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [logged, setLogged] = useState(!!getAdminToken());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'content' | 'users'>('content');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!logged) return;
    setLoading(true);
    setError(null);
    try {
      const [itemsData, usersData, meData] = await Promise.all([
        adminApi<ContentItem[]>('/admin/content'),
        adminApi<User[]>('/admin/users'),
        adminApi<User>('/auth/me'),
      ]);
      setItems(itemsData);
      setUsers(usersData);
      setCurrentUser(meData);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erro ao carregar dados';
      setError(message);
      if (message.includes('401') || message.toLowerCase().includes('unauthorized')) {
        clearAdminToken();
        setLogged(false);
        setCurrentUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (logged && !currentUser) {
      load();
    }
  }, [logged, currentUser]);

  const logout = () => {
    clearAdminToken();
    setLogged(false);
    setCurrentUser(null);
    setItems([]);
    setUsers([]);
  };

  if (!logged) {
    return <LoginScreen onReady={() => setLogged(true)} />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1>AuraSync — CMS</h1>
          <p className="hint" style={{ marginBottom: 0 }}>
            {currentUser ? `Conectado como ${currentUser.email}` : loading ? 'Carregando...' : 'Erro ao conectar'}
          </p>
        </div>
        <button className="secondary" onClick={logout}>
          Sair
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => setTab('content')}
          style={{
            background: tab === 'content' ? 'var(--bright-blue)' : 'var(--surface-light)',
            color: 'var(--text)',
            border: tab === 'content' ? '1px solid var(--bright-blue)' : '1px solid var(--border)',
          }}
        >
          Conteúdo ({items.length})
        </button>
        <button
          onClick={() => setTab('users')}
          style={{
            background: tab === 'users' ? 'var(--bright-blue)' : 'var(--surface-light)',
            color: 'var(--text)',
            border: tab === 'users' ? '1px solid var(--bright-blue)' : '1px solid var(--border)',
          }}
        >
          Usuários ({users.length})
        </button>
      </div>

      {error ? (
        <p className="error" style={{ marginBottom: 16 }}>
          {error} <button className="secondary" onClick={load}>Tentar novamente</button>
        </p>
      ) : null}

      {tab === 'content' ? (
        <>
          <p className="hint" style={{ marginBottom: 20 }}>
            Curadoria de conteúdo com licenciamento obrigatório. Nenhum áudio publica sem fonte, autor e
            licença registrados.
          </p>
          <ContentForm onCreated={load} />
          <ContentTable items={items} onChange={load} />
        </>
      ) : (
        <UsersTable users={users} currentUserId={currentUser?.id} onChange={load} />
      )}
    </div>
  );
}
