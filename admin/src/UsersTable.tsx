import { Fragment, useState } from 'react';

import { adminApi, type User } from './api';

export function UsersTable({
  users,
  currentUserId,
  onChange,
}: {
  users: User[];
  currentUserId: string | undefined;
  onChange: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateUser = async (userId: string, updates: { role?: string; is_active?: boolean }) => {
    setBusyId(userId);
    setErrors((prev) => ({ ...prev, [userId]: '' }));
    try {
      await adminApi(`/admin/users/${userId}`, { method: 'PATCH', body: updates });
      onChange();
    } catch (e) {
      setErrors((prev) => ({
        ...prev,
        [userId]: e instanceof Error ? e.message : 'Erro ao atualizar usuario',
      }));
    } finally {
      setBusyId(null);
    }
  };

  const toggleRole = (user: User) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    updateUser(user.id, { role: newRole });
  };

  const toggleActive = (user: User) => {
    updateUser(user.id, { is_active: !user.is_active });
  };

  return (
    <div className="card">
      <h2>Usuarios ({users.length})</h2>
      <table>
        <thead>
          <tr>
            <th>E-mail</th>
            <th>Nome</th>
            <th>Papel</th>
            <th>Status</th>
            <th>Cadastro</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <Fragment key={user.id}>
              <tr>
                <td>{user.email}</td>
                <td>{user.display_name || '—'}</td>
                <td>
                  <span className={`badge ${user.role === 'admin' ? 'published' : 'draft'}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`badge ${user.is_active ? 'published' : 'draft'}`}>
                    {user.is_active ? 'ativo' : 'desativado'}
                  </span>
                </td>
                <td style={{ fontSize: '12px' }}>{new Date(user.created_at).toLocaleDateString('pt-BR')}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {user.id === currentUserId ? (
                    <span className="hint" style={{ fontSize: '12px' }}>
                      sua conta
                    </span>
                  ) : (
                    <>
                      <button
                        className="secondary"
                        disabled={busyId === user.id}
                        onClick={() => toggleRole(user)}
                        style={{ marginRight: 4, fontSize: '12px', padding: '4px 8px' }}
                      >
                        {user.role === 'admin' ? 'Remover admin' : 'Fazer admin'}
                      </button>
                      <button
                        className={user.is_active ? 'danger' : 'secondary'}
                        disabled={busyId === user.id}
                        onClick={() => toggleActive(user)}
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                      >
                        {user.is_active ? 'Desativar' : 'Reativar'}
                      </button>
                    </>
                  )}
                </td>
              </tr>
              {errors[user.id] ? (
                <tr>
                  <td colSpan={6}>
                    <p className="error">{errors[user.id]}</p>
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
