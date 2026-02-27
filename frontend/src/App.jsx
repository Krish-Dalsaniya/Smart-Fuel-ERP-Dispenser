import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Transactions from './pages/Transactions';
import Inventory from './pages/Inventory';
import Dispensers from './pages/Dispensers';
import Users from './pages/Users';
import Wallet from './pages/Wallet';
import Feedback from './pages/Feedback';
import FuelDispenser from './pages/FuelDispenser';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } }
});

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-950"><div className="w-8 h-8 border-2 border-fuel-500 border-t-transparent rounded-full animate-spin"/></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{
            style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' },
            success: { iconTheme: { primary: '#ff7d0a', secondary: '#0f172a' } }
          }} />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="inventory" element={<ProtectedRoute roles={['admin', 'operator']}><Inventory /></ProtectedRoute>} />
              <Route path="dispensers" element={<ProtectedRoute roles={['admin', 'operator']}><Dispensers /></ProtectedRoute>} />
              <Route path="users" element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="fuel-dispenser" element={<ProtectedRoute roles={['admin', 'operator']}><FuelDispenser /></ProtectedRoute>} />
              <Route path="feedback" element={<Feedback />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
