import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#ff7d0a', '#3b82f6', '#a855f7', '#10b981'];

export default function ShiftDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['shift-detail', id],
    queryFn: () => api.get(`/shifts/${id}`).then(r => r.data.data),
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-fuel-500 border-t-transparent rounded-full animate-spin"/></div>;
  if (!data) return <div className="text-center py-12">Shift report not found.</div>;

  const { shift, transactions } = data;

  const chartData = shift.fuelBreakdown?.map(item => ({
    name: item.fuelType.charAt(0).toUpperCase() + item.fuelType.slice(1),
    value: item.litres
  })) || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto print:p-0">
      <div className="flex items-center justify-between print:hidden">
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-white flex items-center gap-2 text-sm font-medium">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Back to list
        </button>
        <button onClick={handlePrint} className="btn-ghost gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
          Print Report
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden print:border-none print:bg-white print:text-black">
        {/* Header Section */}
        <div className="p-8 border-b border-slate-800 print:border-slate-200">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-fuel-500/10 text-fuel-400 border border-fuel-500/20 mb-3 inline-block print:hidden">
                Shift Report
              </span>
              <h1 className="text-3xl font-display font-bold text-white print:text-black">
                {shift.operatorName}
              </h1>
              <p className="text-slate-500 font-mono text-sm mt-1">Shift ID: {shift._id}</p>
            </div>
            <div className="text-right md:text-right flex flex-col items-end">
              <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mb-1">Time Period</p>
              <p className="text-white font-semibold print:text-black">
                {format(new Date(shift.startTime), 'MMM dd, HH:mm')} — {shift.endTime ? format(new Date(shift.endTime), 'HH:mm') : 'Active'}
              </p>
              <p className="text-slate-500 text-xs mt-1">Dispenser: {shift.dispenser?.name || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-800 border-b border-slate-800 print:divide-slate-200 print:border-slate-200">
          {[
            { label: 'Total Revenue', value: `₹${shift.totalRevenue?.toLocaleString()}`, sub: `${shift.totalTransactions} transactions` },
            { label: 'Total Volume', value: `${shift.totalVolumeLitres?.toFixed(2)}L`, sub: 'Fuel dispensed' },
            { label: 'Opening Cash', value: `₹${shift.openingCash?.toLocaleString()}`, sub: 'At start' },
            { label: 'Closing Cash', value: `₹${shift.closingCash?.toLocaleString()}`, sub: 'At end' },
          ].map((s, i) => (
            <div key={i} className="p-6">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-xl font-display font-bold text-white print:text-black">{s.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 divide-x divide-slate-800 print:divide-slate-200">
          {/* Charts Column */}
          <div className="p-8 lg:col-span-1 border-b lg:border-b-0 border-slate-800 print:border-slate-200">
            <h3 className="text-sm font-mono text-slate-500 uppercase tracking-widest mb-6">Fuel Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 space-y-3">
              {shift.fuelBreakdown?.map((item, i) => (
                <div key={item.fuelType} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}/>
                    <span className="capitalize text-slate-400">{item.fuelType}</span>
                  </div>
                  <span className="text-white font-medium print:text-black">{item.litres.toFixed(1)}L — ₹{item.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transactions Column */}
          <div className="lg:col-span-2 p-8">
            <h3 className="text-sm font-mono text-slate-500 uppercase tracking-widest mb-6">Transactions</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {transactions?.map((t) => (
                <div key={t._id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex justify-between items-center group print:bg-white print:border-slate-200 print:text-black">
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-fuel-400 transition-colors print:text-black">
                      {t.vehicle?.plateNumber}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {format(new Date(t.createdAt), 'HH:mm')} • {t.quantity}L of {t.fuelType}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white print:text-black">₹{t.totalAmount.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{t.paymentMethod}</p>
                  </div>
                </div>
              ))}
              {transactions?.length === 0 && (
                <p className="text-center py-12 text-slate-500 italic">No transactions recorded in this shift.</p>
              )}
            </div>
          </div>
        </div>

        {shift.notes && (
          <div className="p-8 bg-slate-950/50 border-t border-slate-800 print:bg-white print:border-slate-200">
            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Notes</h3>
            <p className="text-slate-400 text-sm italic">"{shift.notes}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
