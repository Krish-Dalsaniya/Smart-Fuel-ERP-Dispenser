import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const qc = useQueryClient();
  const [formData, setFormData] = useState({
    stationName: '',
    stationAddress: '',
    stationGSTIN: '',
    invoiceCounter: 1000
  });

  const { isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then(r => {
      const data = r.data.data;
      setFormData({
        stationName: data.stationName,
        stationAddress: data.stationAddress,
        stationGSTIN: data.stationGSTIN,
        invoiceCounter: data.invoiceCounter
      });
      return data;
    }),
  });

  const mutation = useMutation({
    mutationFn: (data) => api.post('/settings', data),
    onSuccess: () => {
      toast.success('Settings updated successfully');
      qc.invalidateQueries(['settings']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Error updating settings'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-fuel-500 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Station Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Configure station identity and tax invoice details</p>
      </div>

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Station Name</label>
              <input 
                type="text" 
                className="input" 
                value={formData.stationName} 
                onChange={e => setFormData(p => ({ ...p, stationName: e.target.value }))} 
                placeholder="e.g. Smart Fuel Gujarat"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Station GSTIN</label>
              <input 
                type="text" 
                className="input font-mono uppercase" 
                value={formData.stationGSTIN} 
                onChange={e => setFormData(p => ({ ...p, stationGSTIN: e.target.value.toUpperCase() }))} 
                placeholder="24AAAAA0000A1Z5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Station Address</label>
              <textarea 
                rows="3"
                className="input" 
                value={formData.stationAddress} 
                onChange={e => setFormData(p => ({ ...p, stationAddress: e.target.value }))} 
                placeholder="Enter full postal address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Invoice Start Counter</label>
              <input 
                type="number" 
                className="input" 
                value={formData.invoiceCounter} 
                onChange={e => setFormData(p => ({ ...p, invoiceCounter: parseInt(e.target.value) }))} 
              />
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono italic">Next invoice will start from this number</p>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={mutation.isPending}
              className="w-full btn-primary justify-center py-3 text-base"
            >
              {mutation.isPending ? 'Saving Changes...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>

      <div className="p-4 bg-fuel-500/10 border border-fuel-500/20 rounded-2xl flex items-start gap-4">
        <div className="w-10 h-10 bg-fuel-500/20 rounded-xl flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ff7d0a" strokeWidth="2" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        </div>
        <div className="text-xs text-slate-400 leading-relaxed">
          <p className="font-bold text-fuel-400 mb-1 uppercase tracking-wider">Note on GST Compliance</p>
          These details are hardcoded into the PDF header at the time of generation. Updating these settings will only affect future invoices. Ensure your GSTIN is accurate to remain compliant with Indian tax laws.
        </div>
      </div>
    </div>
  );
}
