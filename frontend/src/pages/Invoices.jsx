import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Invoices() {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.get('/invoices').then(r => r.data?.data || []),
  });

  const handleDownload = async (invoice) => {
    try {
      const response = await api.get(`/invoices/${invoice._id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to download invoice');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Tax Invoices</h1>
        <p className="text-slate-500 text-sm mt-1">Manage and track all generated GST invoices</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-xs font-mono uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold border-b border-slate-800">Invoice #</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-800">Date</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-800">Customer</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-800">Vehicle</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-800 text-right">Amount</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-800 text-center">Status</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-800"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-500 animate-pulse">Loading invoices...</td></tr>
              ) : invoices?.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-500 italic">No invoices generated yet.</td></tr>
              ) : (
                invoices?.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-fuel-400 font-bold">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {format(new Date(inv.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-white font-medium">{inv.customerName}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {inv.vehicle?.plateNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <p className="text-sm font-bold text-white">₹{inv.totalAmount.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => handleDownload(inv)}
                        className="p-2 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                        title="Download PDF"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      </button>
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
