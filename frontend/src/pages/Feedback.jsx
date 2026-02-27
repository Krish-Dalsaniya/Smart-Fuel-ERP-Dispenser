import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function Feedback() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({ rating: 5, category: 'general', message: '' });
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['feedback'],
    queryFn: () => api.get('/feedback').then(r => r.data.data),
    enabled: user?.role === 'admin',
  });

  const submitMutation = useMutation({
    mutationFn: () => api.post('/feedback', form),
    onSuccess: () => { toast.success('Feedback submitted, thank you!'); setForm({ rating: 5, category: 'general', message: '' }); setShowForm(false); },
    onError: (err) => toast.error(err.response?.data?.message || 'Error'),
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, response }) => api.patch(`/feedback/${id}/respond`, { response }),
    onSuccess: () => { toast.success('Response sent'); qc.invalidateQueries(['feedback']); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Feedback</h1>
          <p className="text-slate-500 text-sm">{user?.role === 'admin' ? 'Review customer feedback' : 'Share your experience'}</p>
        </div>
        {user?.role !== 'admin' && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">+ Submit Feedback</button>
        )}
      </div>

      {/* Submit form for non-admins */}
      {showForm && user?.role !== 'admin' && (
        <div className="card p-6 animate-fadeIn">
          <h3 className="font-display font-semibold text-white mb-4">Your Feedback</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-500 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(r => (
                  <button key={r} onClick={() => setForm(p => ({ ...p, rating: r }))}
                    className={`w-10 h-10 rounded-xl text-lg transition-all ${form.rating >= r ? 'text-yellow-400' : 'text-slate-600'}`}>
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Category</label>
              <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {['general', 'service', 'fuel_quality', 'pricing'].map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Message</label>
              <textarea className="input min-h-[100px]" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Share your thoughts..." />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
            <button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending || !form.message} className="btn-primary disabled:opacity-50">
              {submitMutation.isPending ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      )}

      {/* Admin view */}
      {user?.role === 'admin' && (
        isLoading ? (
          <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-2 border-fuel-500 border-t-transparent rounded-full animate-spin"/></div>
        ) : (
          <div className="space-y-4">
            {data?.map(fb => (
              <div key={fb._id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuel-400 to-fuel-700 flex items-center justify-center text-white font-bold text-sm">
                      {fb.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{fb.user?.name}</p>
                      <p className="text-xs text-slate-500">{format(new Date(fb.createdAt), 'dd MMM yyyy HH:mm')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex">{Array.from({ length: 5 }).map((_, i) => <span key={i} className={i < fb.rating ? 'text-yellow-400' : 'text-slate-700'}>★</span>)}</div>
                    <span className={`badge ${fb.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{fb.status}</span>
                  </div>
                </div>
                <span className="badge bg-slate-700 text-slate-300 capitalize mb-3">{fb.category?.replace('_', ' ')}</span>
                <p className="text-sm text-slate-300 my-3">{fb.message}</p>
                {fb.adminResponse ? (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm text-blue-300">
                    <p className="text-xs text-blue-400 mb-1 font-semibold">Admin Response</p>
                    {fb.adminResponse}
                  </div>
                ) : (
                  <AdminResponseForm fb={fb} onRespond={respondMutation.mutate} />
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

function AdminResponseForm({ fb, onRespond }) {
  const [res, setRes] = useState('');
  return (
    <div className="flex gap-2 mt-2">
      <input className="input flex-1 text-sm" placeholder="Write a response..." value={res} onChange={e => setRes(e.target.value)} />
      <button onClick={() => res && onRespond({ id: fb._id, response: res })} disabled={!res} className="btn-primary text-xs disabled:opacity-50">Reply</button>
    </div>
  );
}
