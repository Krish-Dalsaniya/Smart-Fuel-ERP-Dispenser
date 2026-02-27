import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const FUEL_COLORS = { petrol: '#ff7d0a', diesel: '#3b82f6', premium: '#a855f7' };

function RestockModal({ inv, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ quantity: '', supplier: '', cost: '' });

  const mutation = useMutation({
    mutationFn: () => api.put(`/inventory/${inv._id}`, { restock: { quantity: parseFloat(form.quantity), supplier: form.supplier, cost: parseFloat(form.cost) } }),
    onSuccess: () => { toast.success('Inventory restocked!'); qc.invalidateQueries(['inventory']); onClose(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Error'),
  });

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md p-8 animate-fadeIn">
        <div className="flex justify-between mb-6">
          <h3 className="font-display font-bold text-lg text-white capitalize">Restock {inv.fuelType}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Quantity (Liters)', key: 'quantity', type: 'number' },
            { label: 'Supplier Name', key: 'supplier' },
            { label: 'Total Cost (₹)', key: 'cost', type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
              <input type={f.type || 'text'} className="input" value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.quantity} className="btn-primary flex-1 justify-center disabled:opacity-50">
            {mutation.isPending ? 'Saving...' : 'Restock'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Inventory() {
  const qc = useQueryClient();
  const [restockItem, setRestockItem] = useState(null);
  const [editPrice, setEditPrice] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => api.get('/inventory').then(r => r.data.data),
  });

  const priceMutation = useMutation({
    mutationFn: ({ id, price }) => api.patch(`/inventory/${id}/price`, { pricePerLiter: price }),
    onSuccess: () => { toast.success('Price updated'); qc.invalidateQueries(['inventory']); setEditPrice({}); },
    onError: (err) => toast.error(err.response?.data?.message || 'Error'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/inventory', data),
    onSuccess: () => { toast.success('Inventory created'); qc.invalidateQueries(['inventory']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Error'),
  });

  if (isLoading) return <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-2 border-fuel-500 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Inventory</h1>
          <p className="text-slate-500 text-sm">Fuel stock management & pricing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {data?.map(inv => (
          <div key={inv._id} className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${FUEL_COLORS[inv.fuelType]}20` }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke={FUEL_COLORS[inv.fuelType]} strokeWidth="2" className="w-5 h-5">
                    <path d="M4 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v7"/><path d="M8 7h4"/>
                  </svg>
                </div>
                <div>
                  <h3 className="capitalize font-display font-bold text-white">{inv.fuelType}</h3>
                  <p className="text-xs text-slate-500">Stock Inventory</p>
                </div>
              </div>
              <span className={`badge ${inv.isLowStock ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {inv.isLowStock ? '⚠ Low' : '✓ OK'}
              </span>
            </div>

            {/* Stock bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">{inv.currentStock?.toLocaleString()}L</span>
                <span className="text-slate-500">/ {inv.capacity?.toLocaleString()}L</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3">
                <div className="h-3 rounded-full transition-all" style={{ width: `${inv.stockPercentage}%`, background: inv.isLowStock ? '#ef4444' : FUEL_COLORS[inv.fuelType] }}/>
              </div>
              <p className="text-xs text-slate-500 mt-1">{inv.stockPercentage}% remaining</p>
            </div>

            {/* Price */}
            <div className="bg-slate-800 rounded-xl p-4 mb-4">
              <p className="text-xs text-slate-500 mb-2">Price per Liter</p>
              {editPrice[inv._id] !== undefined ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="input flex-1 py-2"
                    value={editPrice[inv._id]}
                    onChange={e => setEditPrice(p => ({ ...p, [inv._id]: e.target.value }))}
                    step="0.01"
                  />
                  <button onClick={() => priceMutation.mutate({ id: inv._id, price: parseFloat(editPrice[inv._id]) })} className="btn-primary py-2 px-3 text-xs">Save</button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-fuel-400 font-display font-bold text-xl">₹{inv.pricePerLiter}</span>
                  <button onClick={() => setEditPrice(p => ({ ...p, [inv._id]: inv.pricePerLiter }))} className="text-xs text-slate-500 hover:text-fuel-400 transition-colors">Edit ✎</button>
                </div>
              )}
            </div>

            {inv.lastRestocked && (
              <p className="text-xs text-slate-500 mb-4">Last restocked: {format(new Date(inv.lastRestocked), 'dd MMM yyyy')}</p>
            )}

            <button onClick={() => setRestockItem(inv)} className="w-full btn-primary justify-center">
              ⊕ Restock
            </button>
          </div>
        ))}

        {/* Add new fuel type */}
        {data?.length < 3 && (
          <div className="card p-6 border-dashed flex items-center justify-center">
            <button onClick={() => createMutation.mutate({ fuelType: 'premium', capacity: 10000, currentStock: 0, pricePerLiter: 100 })} className="text-slate-500 hover:text-fuel-400 transition-colors text-sm flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              Add Premium Fuel
            </button>
          </div>
        )}
      </div>

      {restockItem && <RestockModal inv={restockItem} onClose={() => setRestockItem(null)} />}
    </div>
  );
}
