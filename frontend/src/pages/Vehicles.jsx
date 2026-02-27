import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const FUEL_COLORS = { petrol: '#ff7d0a', diesel: '#3b82f6', premium: '#a855f7', electric: '#10b981' };

function VehicleModal({ vehicle, onClose }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const isEdit = !!vehicle;
  const [form, setForm] = useState(vehicle || { plateNumber: '', make: '', model: '', year: '', fuelType: 'petrol', tankCapacity: '', rfidTag: '' });

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? api.put(`/vehicles/${vehicle._id}`, data) : api.post('/vehicles', data),
    onSuccess: () => {
      toast.success(isEdit ? 'Vehicle updated' : 'Vehicle registered');
      qc.invalidateQueries(['vehicles']);
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Error'),
  });

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg p-8 animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-lg text-white">{isEdit ? 'Edit Vehicle' : 'Register Vehicle'}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-lg">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Plate Number', key: 'plateNumber', upper: true },
            { label: 'RFID Tag', key: 'rfidTag' },
            { label: 'Make', key: 'make' },
            { label: 'Model', key: 'model' },
            { label: 'Year', key: 'year', type: 'number' },
            { label: 'Tank Capacity (L)', key: 'tankCapacity', type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
              <input type={f.type || 'text'} className="input" value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: f.upper ? e.target.value.toUpperCase() : e.target.value }))} />
            </div>
          ))}
          <div className="col-span-2">
            <label className="block text-xs text-slate-500 mb-1">Fuel Type</label>
            <select className="input" value={form.fuelType} onChange={e => setForm(p => ({ ...p, fuelType: e.target.value }))}>
              {['petrol', 'diesel', 'premium', 'electric'].map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="btn-primary flex-1 justify-center disabled:opacity-50">
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Vehicles() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);

  const endpoint = user?.role === 'vehicle_owner' ? '/vehicles/my' : '/vehicles';
  const { data, isLoading } = useQuery({
    queryKey: ['vehicles', search],
    queryFn: () => api.get(endpoint + (search ? `?search=${search}` : '')).then(r => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/vehicles/${id}`),
    onSuccess: () => { toast.success('Vehicle removed'); qc.invalidateQueries(['vehicles']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Error'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Vehicles</h1>
          <p className="text-slate-500 text-sm">{data?.length || 0} vehicles registered</p>
        </div>
        <button onClick={() => { setEditVehicle(null); setShowModal(true); }} className="btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Register Vehicle
        </button>
      </div>

      {user?.role !== 'vehicle_owner' && (
        <div className="flex gap-3">
          <input type="text" placeholder="Search by plate, make, model..." className="input max-w-sm" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-fuel-500 border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.map(v => (
            <div key={v._id} className="card p-5 hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-mono font-bold text-xl text-white tracking-widest">{v.plateNumber}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{v.make} {v.model} {v.year && `(${v.year})`}</p>
                </div>
                <span className="badge capitalize" style={{ background: `${FUEL_COLORS[v.fuelType]}20`, color: FUEL_COLORS[v.fuelType] }}>
                  {v.fuelType}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="bg-slate-800 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Wallet</p>
                  <p className="text-fuel-400 font-display font-bold">₹{v.walletBalance?.toFixed(2)}</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Total Fuel</p>
                  <p className="text-white font-bold">{v.totalFuelConsumed?.toFixed(1)}L</p>
                </div>
              </div>
              {v.owner && <p className="text-xs text-slate-500 mb-3">Owner: {v.owner?.name}</p>}
              <div className="flex gap-2">
                <button onClick={() => { setEditVehicle(v); setShowModal(true); }} className="btn-ghost flex-1 justify-center text-xs py-2">Edit</button>
                {user?.role === 'admin' && (
                  <button onClick={() => deleteMutation.mutate(v._id)} className="px-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-xs">Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {(showModal || editVehicle) && (
        <VehicleModal
          vehicle={editVehicle}
          onClose={() => { setShowModal(false); setEditVehicle(null); }}
        />
      )}
    </div>
  );
}
