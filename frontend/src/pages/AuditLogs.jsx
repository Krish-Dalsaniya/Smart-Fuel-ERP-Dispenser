import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { format } from 'date-fns';

const ACTION_COLORS = {
  CREATE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  UPDATE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
  LOGIN: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  REGISTER: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  UPDATE_PRICE: 'bg-fuel-500/20 text-fuel-400 border-fuel-500/30',
  UPDATE_STATUS: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const MODULES = ['Auth', 'User', 'Vehicle', 'Transaction', 'Inventory', 'Dispenser'];

export default function AuditLogs() {
  const [filters, setFilters] = useState({
    page: 1,
    module: '',
    startDate: '',
    endDate: '',
    search: ''
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => api.get('/audit-logs', { params: filters }).then(r => r.data),
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Audit Trail</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor system activities and user actions</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => refetch()} 
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 transition-all border border-slate-700"
            title="Refresh Logs"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase tracking-wider">Module</label>
          <select 
            name="module" 
            value={filters.module} 
            onChange={handleFilterChange}
            className="input text-sm h-10"
          >
            <option value="">All Modules</option>
            {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase tracking-wider">Start Date</label>
          <input 
            type="date" 
            name="startDate" 
            value={filters.startDate} 
            onChange={handleFilterChange}
            className="input text-sm h-10"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase tracking-wider">End Date</label>
          <input 
            type="date" 
            name="endDate" 
            value={filters.endDate} 
            onChange={handleFilterChange}
            className="input text-sm h-10"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase tracking-wider">Search User/Target</label>
          <input 
            type="text" 
            name="search" 
            placeholder="Search..."
            value={filters.search} 
            onChange={handleFilterChange}
            className="input text-sm h-10"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-xs font-mono uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold border-b border-slate-800">Timestamp</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-800">User</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-800">Action</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-800">Module</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-800">Target</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-800 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-fuel-500 border-t-transparent rounded-full animate-spin"/>
                      <span className="text-slate-500 font-mono text-sm">Loading logs...</span>
                    </div>
                  </td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-mono text-sm">
                    No activity logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                data?.data.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-slate-300 font-medium">
                        {format(new Date(log.timestamp), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {format(new Date(log.timestamp), 'HH:mm:ss')}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-white font-medium">{log.userName}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-tighter">{log.role.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${ACTION_COLORS[log.action] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-400 font-medium">{log.module}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap max-w-[200px]">
                      {log.targetName ? (
                        <div className="flex flex-col truncate">
                          <span className="text-sm text-white font-medium truncate">{log.targetName}</span>
                          <span className="text-[10px] text-slate-500 font-mono truncate">{log.targetId}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600 italic">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-xs text-slate-500 font-mono bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50 group-hover:border-slate-600 transition-colors">
                        {log.ipAddress || '—'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && data?.pagination && data.pagination.pages > 1 && (
          <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-mono">
              Showing page {data.pagination.page} of {data.pagination.pages} ({data.pagination.total} total logs)
            </p>
            <div className="flex gap-2">
              <button 
                disabled={filters.page === 1}
                onClick={() => handlePageChange(filters.page - 1)}
                className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-all"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button 
                disabled={filters.page === data.pagination.pages}
                onClick={() => handlePageChange(filters.page + 1)}
                className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-all"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
