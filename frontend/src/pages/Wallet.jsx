import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Wallet() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles', 'my'],
    queryFn: () => api.get(user?.role === 'vehicle_owner' ? '/vehicles/my' : '/vehicles').then(r => r.data.data),
  });

  const topupMutation = useMutation({
    mutationFn: (data) => api.post('/wallet/topup', data),
    onSuccess: (res) => {
      toast.success(`₹${res.data.data.amount} added to wallet!`);
      qc.invalidateQueries(['vehicles']);
      setAmount('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Top-up failed'),
  });

  const quickAmounts = [500, 1000, 2000, 5000];
  const selectedV = vehicles?.find(v => v._id === selectedVehicle);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Wallet</h1>
        <p className="text-slate-500 text-sm">Manage vehicle wallet balances</p>
      </div>

      {/* Vehicle selector */}
      <div className="card p-6">
        <h3 className="font-display font-semibold text-white mb-4">Select Vehicle</h3>
        <div className="grid grid-cols-1 gap-3">
          {vehicles?.map(v => (
            <button
              key={v._id}
              onClick={() => setSelectedVehicle(v._id)}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${selectedVehicle === v._id ? 'border-fuel-500 bg-fuel-500/10' : 'border-slate-700 bg-slate-800 hover:border-slate-600'}`}
            >
              <div className="text-left">
                <p className="font-mono font-bold text-white">{v.plateNumber}</p>
                <p className="text-xs text-slate-400">{v.make} {v.model}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Balance</p>
                <p className="text-fuel-400 font-display font-bold text-lg">₹{v.walletBalance?.toFixed(2)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Top up */}
      {selectedVehicle && (
        <div className="card p-6 animate-fadeIn">
          <h3 className="font-display font-semibold text-white mb-4">Top Up — {selectedV?.plateNumber}</h3>

          {/* Quick amounts */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {quickAmounts.map(a => (
              <button key={a} onClick={() => setAmount(String(a))}
                className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${amount === String(a) ? 'border-fuel-500 bg-fuel-500/10 text-fuel-400' : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                ₹{a}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-xs text-slate-500 mb-1">Custom Amount</label>
            <input type="number" className="input text-lg" placeholder="Enter amount" value={amount} onChange={e => setAmount(e.target.value)} min="1" />
          </div>

          <div className="mb-4">
            <label className="block text-xs text-slate-500 mb-2">Payment Method</label>
            <div className="flex gap-3">
              {['card', 'upi', 'cash'].map(m => (
                <button key={m} onClick={() => setPaymentMethod(m)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize border-2 transition-all ${paymentMethod === m ? 'border-fuel-500 bg-fuel-500/10 text-fuel-400' : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {amount && parseFloat(amount) > 0 && (
            <div className="p-4 bg-fuel-500/10 border border-fuel-500/20 rounded-xl mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Adding to wallet</span>
                <span className="text-fuel-400 font-bold">₹{parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-slate-400">New balance</span>
                <span className="text-white font-bold">₹{(selectedV?.walletBalance + parseFloat(amount)).toFixed(2)}</span>
              </div>
            </div>
          )}

          <button
            onClick={() => topupMutation.mutate({ vehicleId: selectedVehicle, amount: parseFloat(amount), paymentMethod })}
            disabled={topupMutation.isPending || !amount || parseFloat(amount) <= 0}
            className="w-full btn-primary justify-center py-3 text-base disabled:opacity-50"
          >
            {topupMutation.isPending ? (
              <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Processing...</span>
            ) : '+ Add Money to Wallet'}
          </button>
        </div>
      )}
    </div>
  );
}
