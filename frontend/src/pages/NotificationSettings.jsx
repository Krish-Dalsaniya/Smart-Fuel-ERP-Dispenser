import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function NotificationSettings() {
  const qc = useQueryClient();
  const [settings, setSettings] = useState({
    fuelingConfirmation: true,
    lowBalanceAlert: true,
    lowBalanceThreshold: 500,
    preferredChannel: 'sms',
    phone: ''
  });

  const { isLoading } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: () => api.get('/notifications/settings').then(r => {
      setSettings(r.data.data);
      return r.data.data;
    }),
  });

  const mutation = useMutation({
    mutationFn: (data) => api.put('/notifications/settings', data),
    onSuccess: () => {
      toast.success('Preferences updated');
      qc.invalidateQueries(['notification-settings']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const handleToggle = (field) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Notification Preferences</h1>
        <p className="text-slate-500 text-sm mt-1">Manage how and when you receive system alerts</p>
      </div>

      <div className="card p-8 space-y-8">
        {/* Channel Selection */}
        <div>
          <label className="block text-xs font-mono text-slate-500 mb-4 uppercase tracking-widest">Preferred Channel</label>
          <div className="grid grid-cols-2 gap-4">
            {['sms', 'whatsapp'].map(channel => (
              <button
                key={channel}
                onClick={() => setSettings(p => ({ ...p, preferredChannel: channel }))}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${settings.preferredChannel === channel ? 'border-fuel-500 bg-fuel-500/10 text-white' : 'border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-700'}`}
              >
                <span className="capitalize font-bold">{channel}</span>
                <span className="text-[10px] uppercase tracking-tighter opacity-60">
                  {channel === 'whatsapp' ? 'Official Business API' : 'Standard Mobile Network'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <label className="block text-xs font-mono text-slate-500 mb-2 uppercase tracking-widest">Alert Phone Number</label>
          <input 
            type="text" 
            className="input font-mono text-lg" 
            placeholder="+91 00000 00000"
            value={settings.phone}
            onChange={e => setSettings(p => ({ ...p, phone: e.target.value }))}
          />
          <p className="text-[10px] text-slate-600 mt-2 italic">International format recommended (e.g. +91...)</p>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-800">
          {/* Toggles */}
          {[
            { id: 'fuelingConfirmation', label: 'Fueling Confirmation', desc: 'Receive a message after every successful fueling transaction' },
            { id: 'lowBalanceAlert', label: 'Low Balance Alerts', desc: 'Get notified when your wallet balance falls below the threshold' },
          ].map(item => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50">
              <div className="max-w-[80%]">
                <p className="text-sm font-bold text-white">{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <button 
                onClick={() => handleToggle(item.id)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${settings[item.id] ? 'bg-fuel-500' : 'bg-slate-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings[item.id] ? 'translate-x-6' : 'translate-x-0'}`}/>
              </button>
            </div>
          ))}

          {/* Threshold Slider */}
          {settings.lowBalanceAlert && (
            <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm font-bold text-white">Low Balance Threshold</p>
                <span className="text-fuel-400 font-display font-bold">₹{settings.lowBalanceThreshold}</span>
              </div>
              <input 
                type="range" 
                min="100" 
                max="5000" 
                step="100"
                value={settings.lowBalanceThreshold}
                onChange={e => setSettings(p => ({ ...p, lowBalanceThreshold: parseInt(e.target.value) }))}
                className="w-full accent-fuel-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-2">
                <span>₹100</span>
                <span>₹5,000</span>
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={() => mutation.mutate(settings)}
          disabled={mutation.isPending}
          className="w-full btn-primary justify-center py-3 text-base shadow-lg shadow-fuel-500/20"
        >
          {mutation.isPending ? 'Saving...' : 'Update Preferences'}
        </button>
      </div>
    </div>
  );
}
