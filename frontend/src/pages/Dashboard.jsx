import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const StatCard = ({ label, value, sub, icon, accent = 'fuel' }) => {
  const colors = {
    fuel: 'bg-fuel-500/10 text-fuel-400',
    blue: 'bg-blue-500/10 text-blue-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    purple: 'bg-purple-500/10 text-purple-400',
  };
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors[accent]}`}>
          {icon}
        </div>
        {sub && <span className="text-xs text-emerald-400 font-medium bg-emerald-400/10 px-2 py-1 rounded-lg">{sub}</span>}
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-white">{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
};

const FUEL_COLORS = { petrol: '#ff7d0a', diesel: '#3b82f6', premium: '#a855f7' };

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then(r => r.data.data),
    refetchInterval: 30000,
  });
  const { data: recentTxns } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => api.get('/dashboard/recent-transactions').then(r => r.data.data),
  });

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-fuel-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-white">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-slate-500 text-sm mt-1">{format(new Date(), 'EEEE, MMMM do yyyy')} — FuelFlow ERP Dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={fmt(data?.revenue?.total)}
          sub={`Today: ${fmt(data?.revenue?.daily)}`}
          accent="fuel"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
        />
        <StatCard label="Total Transactions" value={data?.transactions?.total?.toLocaleString()}
          sub={`Today: ${data?.transactions?.daily}`}
          accent="blue"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M21 6H3"/><path d="M7 12H3"/><path d="M7 18H3"/></svg>}
        />
        <StatCard label="Active Vehicles" value={data?.vehicles?.active?.toLocaleString()}
          sub={`Total: ${data?.vehicles?.total}`}
          accent="emerald"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v5"/><circle cx="16" cy="17" r="2"/><circle cx="6" cy="17" r="2"/></svg>}
        />
        <StatCard label="Total Users" value={data?.users?.total?.toLocaleString()}
          sub={`Monthly: ${fmt(data?.revenue?.monthly)}`}
          accent="purple"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="card p-6 col-span-2">
          <h3 className="font-display font-semibold text-white mb-6">Revenue — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.revenueChart || []}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff7d0a" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ff7d0a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={d => format(new Date(d), 'MMM d')} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#e2e8f0' }}
                formatter={(v) => [fmt(v), 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#ff7d0a" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Fuel breakdown */}
        <div className="card p-6">
          <h3 className="font-display font-semibold text-white mb-6">Fuel Sales Breakdown</h3>
          {data?.fuelBreakdown?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={data.fuelBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="total">
                    {data.fuelBreakdown.map((entry) => (
                      <Cell key={entry._id} fill={FUEL_COLORS[entry._id] || '#64748b'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {data.fuelBreakdown.map(item => (
                  <div key={item._id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: FUEL_COLORS[item._id] }}/>
                      <span className="capitalize text-slate-300">{item._id}</span>
                    </div>
                    <span className="text-slate-400 font-mono text-xs">{item.quantity?.toFixed(0)}L</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="flex items-center justify-center h-40 text-slate-600 text-sm">No data yet</div>}
        </div>
      </div>

      {/* Inventory status */}
      <div className="grid grid-cols-3 gap-4">
        {data?.inventory?.map(inv => (
          <div key={inv.fuelType} className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{inv.fuelType}</p>
                <p className="text-lg font-display font-bold text-white mt-0.5">{inv.currentStock?.toLocaleString()}L</p>
              </div>
              <span className={`badge ${inv.isLowStock ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {inv.isLowStock ? '⚠ Low Stock' : '✓ Normal'}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${inv.stockPercentage}%`,
                  background: inv.isLowStock ? '#ef4444' : FUEL_COLORS[inv.fuelType]
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>{inv.stockPercentage}% remaining</span>
              <span>₹{inv.pricePerLiter}/L</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-display font-semibold text-white">Recent Transactions</h3>
          <a href="/transactions" className="text-xs text-fuel-400 hover:text-fuel-300">View all →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-slate-800">
                <th className="text-left px-6 py-3">Transaction ID</th>
                <th className="text-left px-6 py-3">Vehicle</th>
                <th className="text-left px-6 py-3">Fuel</th>
                <th className="text-right px-6 py-3">Qty</th>
                <th className="text-right px-6 py-3">Amount</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentTxns?.map(txn => (
                <tr key={txn._id} className="table-row">
                  <td className="px-6 py-4 font-mono text-xs text-fuel-400">{txn.transactionId}</td>
                  <td className="px-6 py-4 text-sm text-white">{txn.vehicle?.plateNumber}</td>
                  <td className="px-6 py-4">
                    <span className="badge capitalize" style={{ background: `${FUEL_COLORS[txn.fuelType]}20`, color: FUEL_COLORS[txn.fuelType] }}>
                      {txn.fuelType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm text-slate-300">{txn.quantity}L</td>
                  <td className="px-6 py-4 text-right font-semibold text-white">{fmt(txn.totalAmount)}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${txn.paymentStatus === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {txn.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {format(new Date(txn.createdAt), 'MMM d, HH:mm')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
