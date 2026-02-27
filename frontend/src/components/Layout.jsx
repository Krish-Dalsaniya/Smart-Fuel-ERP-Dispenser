import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const icons = {
  dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  vehicles: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v5"/><circle cx="16" cy="17" r="2"/><circle cx="6" cy="17" r="2"/><path d="M9 17h5"/></svg>,
  transactions: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M21 6H3"/><path d="M7 12H3"/><path d="M7 18H3"/><path d="M12 13l4 4 4-4"/><path d="M16 17V7"/></svg>,
  inventory: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  dispensers: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8"/><path d="M8 10h8"/><path d="M8 14h4"/><circle cx="16" cy="17" r="1"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  wallet: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 10h2"/></svg>,
  fuelDispenser: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M4 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v7"/><path d="M16 11h2a2 2 0 0 1 2 2v7a1 1 0 0 1-1 1h-2"/><path d="M8 7h4"/><path d="M7 22h10"/></svg>,
  feedback: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: icons.dashboard, roles: ['admin', 'operator', 'vehicle_owner'] },
  { to: '/fuel-dispenser', label: 'Fuel Dispenser', icon: icons.fuelDispenser, roles: ['admin', 'operator'] },
  { to: '/vehicles', label: 'Vehicles', icon: icons.vehicles, roles: ['admin', 'operator', 'vehicle_owner'] },
  { to: '/transactions', label: 'Transactions', icon: icons.transactions, roles: ['admin', 'operator', 'vehicle_owner'] },
  { to: '/inventory', label: 'Inventory', icon: icons.inventory, roles: ['admin', 'operator'] },
  { to: '/dispensers', label: 'Dispensers', icon: icons.dispensers, roles: ['admin', 'operator'] },
  { to: '/wallet', label: 'Wallet', icon: icons.wallet, roles: ['admin', 'operator', 'vehicle_owner'] },
  { to: '/users', label: 'Users', icon: icons.users, roles: ['admin'] },
  { to: '/feedback', label: 'Feedback', icon: icons.feedback, roles: ['admin', 'operator', 'vehicle_owner'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const visibleItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-fuel-500 rounded-xl flex items-center justify-center glow">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-5 h-5">
                <path d="M4 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v7"/>
                <path d="M16 11h2a2 2 0 0 1 2 2v7a1 1 0 0 1-1 1h-2"/>
                <path d="M8 7h4"/>
              </svg>
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-lg leading-none">FuelFlow</h1>
              <p className="text-xs text-slate-500 font-mono">ERP System</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleItems.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuel-400 to-fuel-700 flex items-center justify-center text-white font-display font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <span className={`badge text-xs ${user?.role === 'admin' ? 'bg-fuel-500/20 text-fuel-400' : user?.role === 'operator' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm">
            {icons.logout} Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 animate-fadeIn">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
