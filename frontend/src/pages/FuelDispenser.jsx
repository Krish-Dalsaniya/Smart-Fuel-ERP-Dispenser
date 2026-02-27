import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function FuelDispenser() {
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const [vehicle, setVehicle] = useState(null);
  const [identifier, setIdentifier] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('wallet');

  const { data: inventory } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => api.get('/inventory').then(r => r.data.data),
  });

  const identifyMutation = useMutation({
    mutationFn: (plateNumber) => api.post('/vehicles/identify', { plateNumber }),
    onSuccess: (res) => {
      setVehicle(res.data.data);
      setStep(2);
      toast.success(`Vehicle identified: ${res.data.data.plateNumber}`);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Vehicle not found'),
  });

  const dispenseMutation = useMutation({
    mutationFn: (data) => api.post('/transactions', data),
    onSuccess: (res) => {
      toast.success('Fuel dispensed successfully!');
      qc.invalidateQueries(['dashboard-stats']);
      qc.invalidateQueries(['inventory']);
      setStep(4);
      setTimeout(() => {
        setStep(1); setVehicle(null); setIdentifier(''); setFuelType(''); setQuantity('');
      }, 8000);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Transaction failed'),
  });

  const selectedInventory = inventory?.find(i => i.fuelType === fuelType);
  const totalAmount = selectedInventory ? (parseFloat(quantity) * selectedInventory.pricePerLiter).toFixed(2) : 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-white">Fuel Dispenser</h1>
        <p className="text-slate-500 text-sm mt-1">Vehicle identification & fuel dispensing terminal</p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-display font-bold transition-all ${step >= s ? 'bg-fuel-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
              {step > s ? '✓' : s}
            </div>
            <span className={`text-sm font-medium ${step >= s ? 'text-white' : 'text-slate-600'}`}>
              {['Identify Vehicle', 'Select Fuel', 'Confirm'][s - 1]}
            </span>
            {s < 3 && <div className={`flex-1 h-px ${step > s ? 'bg-fuel-500' : 'bg-slate-800'}`}/>}
          </div>
        ))}
      </div>

      {/* Step 1: Identify Vehicle */}
      {step === 1 && (
        <div className="card p-8 animate-fadeIn">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-fuel-500/10 rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#ff7d0a" strokeWidth="2" className="w-6 h-6"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v5"/><circle cx="16" cy="17" r="2"/><circle cx="6" cy="17" r="2"/></svg>
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">Vehicle Identification</h2>
              <p className="text-sm text-slate-500">Enter plate number or scan RFID tag</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Plate Number / RFID</label>
              <input
                type="text"
                className="input text-lg font-mono uppercase tracking-widest"
                placeholder="e.g. GJ01AB1234"
                value={identifier}
                onChange={e => setIdentifier(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && identifier && identifyMutation.mutate(identifier)}
              />
            </div>
            <button
              onClick={() => identifyMutation.mutate(identifier)}
              disabled={!identifier || identifyMutation.isPending}
              className="w-full btn-primary justify-center py-3 text-base disabled:opacity-50"
            >
              {identifyMutation.isPending ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Identifying...</span>
              ) : 'Identify Vehicle →'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select fuel */}
      {step === 2 && vehicle && (
        <div className="space-y-4 animate-fadeIn">
          <div className="card p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Vehicle Details</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Plate Number</p>
                <p className="text-white font-mono font-semibold text-lg">{vehicle.plateNumber}</p>
              </div>
              <div>
                <p className="text-slate-500">Vehicle</p>
                <p className="text-white font-semibold">{vehicle.make} {vehicle.model}</p>
              </div>
              <div>
                <p className="text-slate-500">Owner</p>
                <p className="text-white">{vehicle.owner?.name}</p>
              </div>
              <div>
                <p className="text-slate-500">Wallet Balance</p>
                <p className="text-fuel-400 font-display font-bold text-lg">₹{vehicle.walletBalance?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-display font-semibold text-white mb-4">Select Fuel Type</h3>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {inventory?.map(inv => (
                <button
                  key={inv.fuelType}
                  onClick={() => setFuelType(inv.fuelType)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${fuelType === inv.fuelType ? 'border-fuel-500 bg-fuel-500/10' : 'border-slate-700 bg-slate-800 hover:border-slate-600'}`}
                >
                  <p className="capitalize font-display font-bold text-white text-sm mb-1">{inv.fuelType}</p>
                  <p className="text-fuel-400 font-mono font-semibold">₹{inv.pricePerLiter}/L</p>
                  <p className={`text-xs mt-1 ${inv.isLowStock ? 'text-red-400' : 'text-slate-500'}`}>
                    {inv.currentStock?.toLocaleString()}L available
                  </p>
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-400 mb-2">Quantity (Liters)</label>
              <input
                type="number"
                className="input text-lg"
                placeholder="Enter liters"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                min="0.1"
                step="0.1"
              />
            </div>

            {quantity && fuelType && (
              <div className="p-4 bg-fuel-500/10 border border-fuel-500/20 rounded-xl mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Amount</span>
                  <span className="text-fuel-400 font-display font-bold text-lg">₹{totalAmount}</span>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-400 mb-2">Payment Method</label>
              <div className="flex gap-3">
                {['wallet', 'cash', 'card'].map(m => (
                  <button key={m} onClick={() => setPaymentMethod(m)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize border-2 transition-all ${paymentMethod === m ? 'border-fuel-500 bg-fuel-500/10 text-fuel-400' : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-ghost flex-1 justify-center">← Back</button>
              <button
                onClick={() => setStep(3)}
                disabled={!fuelType || !quantity || parseFloat(quantity) <= 0}
                className="btn-primary flex-1 justify-center disabled:opacity-50"
              >
                Review →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div className="card p-8 animate-fadeIn">
          <h2 className="font-display font-bold text-lg text-white mb-6">Confirm Transaction</h2>
          <div className="space-y-3 mb-6">
            {[
              ['Vehicle', `${vehicle?.plateNumber} — ${vehicle?.make} ${vehicle?.model}`],
              ['Owner', vehicle?.owner?.name],
              ['Fuel Type', fuelType],
              ['Quantity', `${quantity} Liters`],
              ['Price per Liter', `₹${selectedInventory?.pricePerLiter}`],
              ['Total Amount', `₹${totalAmount}`],
              ['Payment', paymentMethod.toUpperCase()],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2 border-b border-slate-800 text-sm">
                <span className="text-slate-500">{label}</span>
                <span className="text-white font-semibold capitalize">{value}</span>
              </div>
            ))}
          </div>

          {paymentMethod === 'wallet' && parseFloat(totalAmount) > vehicle?.walletBalance && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 mb-4">
              ⚠ Insufficient wallet balance (₹{vehicle?.walletBalance?.toFixed(2)})
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-ghost flex-1 justify-center">← Back</button>
            <button
              onClick={() => dispenseMutation.mutate({
                vehicleId: vehicle._id,
                fuelType,
                quantity: parseFloat(quantity),
                paymentMethod,
              })}
              disabled={dispenseMutation.isPending || (paymentMethod === 'wallet' && parseFloat(totalAmount) > vehicle?.walletBalance)}
              className="btn-primary flex-1 justify-center disabled:opacity-50"
            >
              {dispenseMutation.isPending ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Processing...</span>
              ) : '⛽ Dispense Fuel'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <div className="card p-12 text-center animate-fadeIn">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 pulse-ring">
            <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" className="w-10 h-10">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className="font-display font-bold text-2xl text-white mb-2">Fuel Dispensed!</h2>
          <p className="text-slate-400 mb-1">{quantity}L of {fuelType} dispensed to</p>
          <p className="text-fuel-400 font-mono font-bold text-lg">{vehicle?.plateNumber}</p>
          <p className="text-slate-500 text-sm mt-4">Resetting terminal in a few seconds...</p>
        </div>
      )}
    </div>
  );
}
