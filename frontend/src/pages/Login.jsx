import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-fuel-500/5 rounded-full blur-3xl"/>
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-fuel-600/5 rounded-full blur-3xl"/>
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-fuel-500 rounded-2xl glow mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-8 h-8">
              <path d="M4 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v7"/>
              <path d="M16 11h2a2 2 0 0 1 2 2v7a1 1 0 0 1-1 1h-2"/>
              <path d="M8 7h4"/>
            </svg>
          </div>
          <h1 className="font-display font-bold text-3xl text-white mb-1">FuelFlow ERP</h1>
          <p className="text-slate-500 text-sm">Smart Fuel Dispenser Management System</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h2 className="font-display font-bold text-xl text-white mb-6">Sign In</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="admin@fuelflow.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPass ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">Demo Credentials</p>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span className="text-fuel-400">Admin:</span>
                <span>admin@demo.com / admin123</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="text-blue-400">Operator:</span>
                <span>operator@demo.com / oper123</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="text-emerald-400">Owner:</span>
                <span>owner@demo.com / owner123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
