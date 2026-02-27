import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ROLE_COLORS = { admin: 'bg-fuel-500/20 text-fuel-400', operator: 'bg-blue-500/20 text-blue-400', vehicle_owner: 'bg-emerald-500/20 text-emerald-400' };

export default function Users() {
  const qc = useQueryClient();
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'operator', phone: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['users', roleFilter, search],
    queryFn: () => api.get(`/users?${new URLSearchParams({ role: roleFilter, search }).toString()}`).then(r => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (d) => api.post('/auth/register', d),
    onSuccess: () => { toast.success('User created'); qc.invalidateQueries(['users']); setShowAdd(false); },
    onError: (err) => toast.error(err.response?.data?.message || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => { toast.success('User removed'); qc.invalidateQueries(['users']); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Users</h1>
          <p className="text-slate-500 text-sm">{data?.length || 0} registered users</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary">+ Add User</button>
      </div>

      {showAdd && (
        <div className="card p-6 animate-fadeIn">
          <h3 className="font-display font-semibold text-white mb-4">New User</h3>
          <div className="grid grid-cols-2 gap-4">
            {[{ label: 'Name', key: 'name' }, { label: 'Email', key: 'email', type: 'email' }, { label: 'Password', key: 'password', type: 'password' }, { label: 'Phone', key: 'phone' }].map(f => (
              <div key={f.key}>
                <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
                <input type={f.type || 'text'} className="input" value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label className="block text-xs text-slate-500 mb-1">Role</label>
              <select className="input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                {['admin', 'operator', 'vehicle_owner'].map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
            <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending} className="btn-primary disabled:opacity-50">Create User</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <input type="text" placeholder="Search users..." className="input max-w-xs" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input w-40" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          {['admin', 'operator', 'vehicle_owner'].map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-2 border-fuel-500 border-t-transparent rounded-full animate-spin"/></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-slate-800">
                <th className="text-left px-6 py-4">User</th>
                <th className="text-left px-6 py-4">Role</th>
                <th className="text-left px-6 py-4">Phone</th>
                <th className="text-left px-6 py-4">Joined</th>
                <th className="text-left px-6 py-4">Last Login</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {data?.map(u => (
                <tr key={u._id} className="table-row">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-fuel-400 to-fuel-700 flex items-center justify-center text-white font-display font-bold text-xs">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge capitalize ${ROLE_COLORS[u.role]}`}>{u.role?.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">{u.phone || '—'}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{format(new Date(u.createdAt), 'dd MMM yyyy')}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{u.lastLogin ? format(new Date(u.lastLogin), 'dd MMM yyyy HH:mm') : 'Never'}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => deleteMutation.mutate(u._id)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
