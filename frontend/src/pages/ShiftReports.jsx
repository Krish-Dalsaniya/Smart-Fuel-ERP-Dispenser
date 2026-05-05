import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { format } from 'date-fns';

export default function ShiftReports() {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: ''
  });

  const { data: shifts, isLoading } = useQuery({
    queryKey: ['shifts', filters],
    queryFn: () => api.get('/shifts', { params: filters }).then(r => r.data?.data || []),
  });

  const stats = {
    totalRevenue: shifts?.reduce((acc, s) => acc + (s.totalRevenue || 0), 0) || 0,
    totalVolume: shifts?.reduce((acc, s) => acc + (s.totalVolumeLitres || 0), 0) || 0,
    totalTxns: shifts?.reduce((acc, s) => acc + (s.totalTransactions || 0), 0) || 0,
    count: shifts?.length || 0
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Shift Reports</h1>
          <p className="text-slate-500 text-sm mt-1">Review operator performance and shift history</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, color: 'text-fuel-400' },
          { label: 'Total Volume', value: `${stats.totalVolume.toLocaleString()}L`, color: 'text-blue-400' },
          { label: 'Total Transactions', value: stats.totalTxns, color: 'text-emerald-400' },
          { label: 'Total Shifts', value: stats.count, color: 'text-slate-400' },
        ].map((s, i) => (
          <div key={i} className="card p-5">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="card p-4 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-slate-500 mb-1">Status</label>
          <select 
            value={filters.status} 
            onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}
            className="input text-sm"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-slate-500 mb-1">Start Date</label>
          <input 
            type="date" 
            value={filters.startDate} 
            onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))}
            className="input text-sm"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-slate-500 mb-1">End Date</label>
          <input 
            type="date" 
            value={filters.endDate} 
            onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))}
            className="input text-sm"
          />
        </div>
      </div>

      {/* Shifts Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-xs font-mono uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold border-b border-slate-800">Shift ID</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-800">Operator</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-800">Time Window</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-800">Dispenser</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-800 text-right">Revenue</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-800 text-center">Status</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-800"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-500 animate-pulse">Loading reports...</td></tr>
              ) : shifts?.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-500 italic">No shift reports found.</td></tr>
              ) : (
                shifts?.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-400 uppercase tracking-tighter">
                      {s._id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-white font-medium">{s.operatorName}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-slate-300">
                        {format(new Date(s.startTime), 'MMM dd, HH:mm')}
                      </p>
                      {s.endTime && (
                        <p className="text-[10px] text-slate-500 font-mono">
                          to {format(new Date(s.endTime), 'HH:mm')}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {s.dispenser?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <p className="text-sm font-bold text-fuel-400">₹{s.totalRevenue?.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500">{s.totalVolumeLitres?.toFixed(1)}L sold</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${s.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link to={`/shift-report/${s._id}`} className="text-slate-500 hover:text-white transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
