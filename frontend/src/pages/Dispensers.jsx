import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = { idle: 'bg-slate-500/20 text-slate-400', active: 'bg-emerald-500/20 text-emerald-400', maintenance: 'bg-yellow-500/20 text-yellow-400', offline: 'bg-red-500/20 text-red-400' };
const FUEL_COLORS = { petrol: '#ff7d0a', diesel: '#3b82f6', premium: '#a855f7' };

function DispenserModal({ onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ dispenserId: '', name: '', fuelType: 'petrol', location: '' });

  const mutation = useMutation({
    mutationFn: () => api.post('/dispensers', form),
    onSuccess: () => { toast.success('Dispenser added'); qc.invalidateQueries(['dispensers']); onClose(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Error'),
  });

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md p-8 animate-fadeIn">
        <div className="flex justify-between mb-6">
          <h3 className="font-display font-bold text-lg text-white">Add Dispenser</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
        </div>
        <div className="space-y-4">
          {[{ label: 'Dispenser ID', key: 'dispenserId' }, { label: 'Name', key: 'name' }, { label: 'Location', key: 'location' }].map(f => (
            <div key={f.key}>
              <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
              <input className="input" value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="block text-xs text-slate-500 mb-1">Fuel Type</label>
            <select className="input" value={form.fuelType} onChange={e => setForm(p => ({ ...p, fuelType: e.target.value }))}>
              {['petrol', 'diesel', 'premium'].map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="btn-primary flex-1 justify-center disabled:opacity-50">Add</button>
        </div>
      </div>
    </div>
  );
}

export default function Dispensers() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['dispensers'],
    queryFn: () => api.get('/dispensers').then(r => r.data.data),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/dispensers/${id}/status`, { status }),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries(['dispensers']); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Dispensers</h1>
          <p className="text-slate-500 text-sm">{data?.length || 0} dispensers</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ Add Dispenser</button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-2 border-fuel-500 border-t-transparent rounded-full animate-spin"/></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.map(d => (
            <div key={d._id} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-display font-bold text-white">{d.name}</p>
                  <p className="text-xs font-mono text-slate-500">{d.dispenserId}</p>
                </div>
                <span className={`badge ${STATUS_COLORS[d.status]}`}>{d.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="bg-slate-800 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Fuel Type</p>
                  <p className="capitalize font-semibold" style={{ color: FUEL_COLORS[d.fuelType] }}>{d.fuelType}</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Total Dispensed</p>
                  <p className="text-white font-bold">{d.totalDispensed?.toFixed(0)}L</p>
                </div>
              </div>
              {d.location && <p className="text-xs text-slate-500 mb-3">📍 {d.location}</p>}
              <select
                value={d.status}
                onChange={e => statusMutation.mutate({ id: d._id, status: e.target.value })}
                className="input text-sm"
              >
                {['idle', 'active', 'maintenance', 'offline'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}

      {showModal && <DispenserModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
