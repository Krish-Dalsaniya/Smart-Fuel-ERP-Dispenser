import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const FUEL_COLORS = { petrol: '#ff7d0a', diesel: '#3b82f6', premium: '#a855f7' };

export default function Transactions() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ fuelType: '', paymentStatus: '', startDate: '', endDate: '' });

  const endpoint = user?.role === 'vehicle_owner' ? '/transactions/my' : '/transactions';
  const params = new URLSearchParams({ page, limit: 20, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) });

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', page, filters],
    queryFn: () => api.get(`${endpoint}?${params}`).then(r => r.data),
  });

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Transactions</h1>
        <p className="text-slate-500 text-sm">{data?.total || 0} total transactions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select className="input w-40" value={filters.fuelType} onChange={e => setFilters(p => ({ ...p, fuelType: e.target.value }))}>
          <option value="">All Fuels</option>
          {['petrol', 'diesel', 'premium'].map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select className="input w-40" value={filters.paymentStatus} onChange={e => setFilters(p => ({ ...p, paymentStatus: e.target.value }))}>
          <option value="">All Status</option>
          {['completed', 'pending', 'failed'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input type="date" className="input w-44" value={filters.startDate} onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))} />
        <input type="date" className="input w-44" value={filters.endDate} onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))} />
        <button onClick={() => setFilters({ fuelType: '', paymentStatus: '', startDate: '', endDate: '' })} className="btn-ghost">
          Clear
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-fuel-500 border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-slate-800">
                  <th className="text-left px-6 py-4">Transaction ID</th>
                  <th className="text-left px-6 py-4">Vehicle</th>
                  {user?.role !== 'vehicle_owner' && <th className="text-left px-6 py-4">Operator</th>}
                  <th className="text-left px-6 py-4">Fuel</th>
                  <th className="text-right px-6 py-4">Qty</th>
                  <th className="text-right px-6 py-4">Price/L</th>
                  <th className="text-right px-6 py-4">Total</th>
                  <th className="text-left px-6 py-4">Payment</th>
                  <th className="text-left px-6 py-4">Status</th>
                  <th className="text-left px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map(txn => (
                  <tr key={txn._id} className="table-row">
                    <td className="px-6 py-4 font-mono text-xs text-fuel-400">{txn.transactionId}</td>
                    <td className="px-6 py-4">
                      <p className="text-white font-semibold font-mono text-sm">{txn.vehicle?.plateNumber}</p>
                      <p className="text-xs text-slate-500">{txn.vehicle?.make} {txn.vehicle?.model}</p>
                    </td>
                    {user?.role !== 'vehicle_owner' && (
                      <td className="px-6 py-4 text-sm text-slate-400">{txn.operator?.name || '—'}</td>
                    )}
                    <td className="px-6 py-4">
                      <span className="badge capitalize" style={{ background: `${FUEL_COLORS[txn.fuelType]}20`, color: FUEL_COLORS[txn.fuelType] }}>
                        {txn.fuelType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm text-slate-300">{txn.quantity}L</td>
                    <td className="px-6 py-4 text-right text-xs text-slate-500">₹{txn.pricePerLiter}</td>
                    <td className="px-6 py-4 text-right font-semibold text-white">{fmt(txn.totalAmount)}</td>
                    <td className="px-6 py-4 text-xs capitalize text-slate-400">{txn.paymentMethod}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${txn.paymentStatus === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : txn.paymentStatus === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {txn.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {format(new Date(txn.createdAt), 'dd MMM yy HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data?.pages > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between">
              <p className="text-xs text-slate-500">Page {page} of {data.pages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost disabled:opacity-40 py-2 px-4 text-xs">← Prev</button>
                <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="btn-ghost disabled:opacity-40 py-2 px-4 text-xs">Next →</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
