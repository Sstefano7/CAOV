import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { Profile, TipoSocio, UserRole } from '../../context/AuthContext';
import './Admin.css';

type Filter = 'todos' | 'pendiente' | 'aprobado' | 'rechazado';

interface UserRow extends Profile {
  created_at?: string;
}

const ROLE_LABELS: Record<string, string> = {
  socio: 'Socio',
  jugador: 'Jugador',
  profesor: 'Profesor',
  admin: 'Admin',
  superadmin: 'Super Admin',
};

const TIPO_LABELS: Record<string, string> = {
  cadete: 'Cadete ($10.000)',
  activo: 'Activo ($12.000)',
  grupo_familiar: 'Grupo Familiar ($15.000)',
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [filter, setFilter] = useState<Filter>('pendiente');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  // Estado de aprobación + rol para el modal inline
  const [editRoles, setEditRoles] = useState<Record<string, UserRole>>({});
  const [editTipos, setEditTipos] = useState<Record<string, TipoSocio>>({});
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter !== 'todos') {
      query = query.eq('account_status', filter);
    }

    const { data } = await query;
    if (data) setUsers(data as UserRow[]);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [filter]);

  const handleApprove = async (user: UserRow) => {
    setProcessing(user.id);
    const role = editRoles[user.id] ?? 'socio';
    const tipo = editTipos[user.id] ?? 'activo';

    await supabase.from('profiles').update({
      account_status: 'aprobado',
      role,
      tipo_socio: tipo,
      approved_at: new Date().toISOString(),
    }).eq('id', user.id);

    // Si no tiene número de socio todavía, crear entrada en socios
    const { data: existing } = await supabase
      .from('socios')
      .select('id')
      .eq('profile_id', user.id)
      .single();

    if (!existing) {
      const montoMap: Record<string, number> = {
        cadete: 10000,
        activo: 12000,
        grupo_familiar: 15000,
      };
      const numeroSocio = `CAOV-${Date.now().toString().slice(-6)}`;
      await supabase.from('socios').insert({
        profile_id: user.id,
        numero_socio: numeroSocio,
        tipo_socio: tipo === 'grupo_familiar' ? 'activo' : tipo,
        estado: 'activo',
        monto_cuota: montoMap[tipo] ?? 12000,
      });
    }

    await fetchUsers();
    setProcessing(null);
  };

  const handleReject = async (userId: string) => {
    if (!confirm('¿Estás seguro de rechazar este usuario?')) return;
    setProcessing(userId);
    await supabase.from('profiles').update({
      account_status: 'rechazado',
      rejected_at: new Date().toISOString(),
    }).eq('id', userId);
    await fetchUsers();
    setProcessing(null);
  };

  const handleRestore = async (userId: string) => {
    setProcessing(userId);
    await supabase.from('profiles').update({
      account_status: 'pendiente',
    }).eq('id', userId);
    await fetchUsers();
    setProcessing(null);
  };

  const handleUpdateSocio = async (user: UserRow) => {
    setProcessing(user.id);
    const role = editRoles[user.id] ?? user.role;
    const tipo = editTipos[user.id] ?? user.tipo_socio;

    await supabase.from('profiles').update({
      role,
      tipo_socio: tipo,
    }).eq('id', user.id);

    // Actualizar también la tabla de socios
    const montoMap: Record<string, number> = {
      cadete: 10000,
      activo: 12000,
      grupo_familiar: 15000,
    };
    await supabase.from('socios').update({
      tipo_socio: tipo === 'grupo_familiar' ? 'activo' : tipo,
      monto_cuota: montoMap[tipo] ?? 12000,
    }).eq('profile_id', user.id);

    setEditingUserId(null);
    await fetchUsers();
    setProcessing(null);
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.dni?.includes(search)
  );

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">👥 Gestión de Usuarios</h1>
          <p className="admin-page-subtitle">Aprobá, rechazá y administrá los socios del club</p>
        </div>
      </div>

      <div className="admin-card">
        {/* Filtros */}
        <div className="admin-filters">
          {(['pendiente', 'aprobado', 'rechazado', 'todos'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
            >
              {f === 'pendiente' ? '⏳ Pendientes' :
               f === 'aprobado' ? '✅ Aprobados' :
               f === 'rechazado' ? '🚫 Rechazados' : '🔍 Todos'}
            </button>
          ))}
          <input
            type="text"
            className="admin-input"
            placeholder="Buscar por nombre, email o DNI..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '200px' }}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">👤</div>
            <p className="admin-empty-text">No hay usuarios en esta categoría</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>DNI</th>
                  <th>Teléfono</th>
                  <th>Registro</th>
                  <th>Estado</th>
                  <th>Rol / Tipo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{user.full_name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{user.email}</div>
                    </td>
                    <td>{user.dni ?? '—'}</td>
                    <td>{user.phone ?? '—'}</td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('es-AR') : '—'}
                    </td>
                    <td>
                      <span className={`status-badge status-badge--${user.account_status}`}>
                        {user.account_status === 'pendiente' ? '⏳ Pendiente' :
                         user.account_status === 'aprobado' ? '✅ Aprobado' : '🚫 Rechazado'}
                      </span>
                    </td>
                    <td>
                      {user.account_status === 'pendiente' || editingUserId === user.id ? (
                        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                          <select
                            className="admin-select"
                            style={{ width: 'auto', fontSize: '12px' }}
                            value={editRoles[user.id] ?? user.role ?? 'socio'}
                            onChange={e => setEditRoles(r => ({ ...r, [user.id]: e.target.value as UserRole }))}
                          >
                            <option value="socio">Socio</option>
                            <option value="jugador">Jugador</option>
                            <option value="profesor">Profesor</option>
                            <option value="admin">Admin</option>
                          </select>
                          <select
                            className="admin-select"
                            style={{ width: 'auto', fontSize: '12px' }}
                            value={editTipos[user.id] ?? user.tipo_socio ?? 'activo'}
                            onChange={e => setEditTipos(t => ({ ...t, [user.id]: e.target.value as TipoSocio }))}
                          >
                            {Object.entries(TIPO_LABELS).map(([k, v]) => (
                              <option key={k} value={k}>{v}</option>
                            ))}
                          </select>
                          {editingUserId === user.id && (
                            <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                              <button className="btn-approve" style={{ padding: '2px 6px', fontSize: '10px' }} onClick={() => handleUpdateSocio(user)} disabled={processing === user.id}>💾 Guardar</button>
                              <button className="btn-reject" style={{ padding: '2px 6px', fontSize: '10px' }} onClick={() => setEditingUserId(null)}>❌</button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <span className="status-badge status-badge--aprobado" style={{ background: 'transparent' }}>
                              {ROLE_LABELS[user.role] ?? user.role}
                            </span>
                            {user.tipo_socio && (
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                                {TIPO_LABELS[user.tipo_socio] ?? user.tipo_socio}
                              </div>
                            )}
                          </div>
                          <button 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: 0.5 }}
                            onClick={() => {
                              setEditRoles(r => ({ ...r, [user.id]: user.role as UserRole }));
                              setEditTipos(t => ({ ...t, [user.id]: user.tipo_socio as TipoSocio }));
                              setEditingUserId(user.id);
                            }}
                            title="Editar rol y tipo"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="admin-action-btns">
                        {user.account_status === 'pendiente' && (
                          <>
                            <button
                              className="btn-approve"
                              onClick={() => handleApprove(user)}
                              disabled={processing === user.id}
                            >
                              {processing === user.id ? '...' : '✅ Aprobar'}
                            </button>
                            <button
                              className="btn-reject"
                              onClick={() => handleReject(user.id)}
                              disabled={processing === user.id}
                            >
                              🚫 Rechazar
                            </button>
                          </>
                        )}
                        {user.account_status === 'aprobado' && (
                          <button
                            className="btn-reject"
                            onClick={() => handleReject(user.id)}
                            disabled={processing === user.id}
                          >
                            🚫 Suspender
                          </button>
                        )}
                        {user.account_status === 'rechazado' && (
                          <button
                            className="btn-approve"
                            onClick={() => handleRestore(user.id)}
                            disabled={processing === user.id}
                          >
                            ↩️ Restaurar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
