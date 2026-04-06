import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { Home, Wallet, LayoutDashboard, Settings, Search, Zap, User, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useBtcPrice } from '../hooks/useBtcPrice';
import { cn } from '../lib/utils';

export default function Layout() {
  const { role, user } = useAuth();
  const { price, loading: priceLoading } = useBtcPrice();

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/wallet', icon: Wallet, label: 'Wallet' },
    { to: '/dashboard', icon: LayoutDashboard, label: 'Vendor' },
    { to: '/admin', icon: Settings, label: 'Admin' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-accent rounded flex items-center justify-center font-black text-black text-xl transition-transform group-hover:scale-110">
            <Zap size={18} className="fill-black" />
          </div>
          <span className="text-sm font-black tracking-[0.2em] uppercase">TaskSats</span>
        </Link>

        <div className="hidden md:flex items-center gap-2 px-4 py-1 rounded-full border border-accent/30 bg-accent/5">
          <Zap size={12} className="text-accent fill-accent" />
          <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Lightning Fast</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">BTC Price</span>
            <span className="text-xs font-mono text-gray-400">
              {priceLoading ? '...' : price ? `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '—'}
            </span>
          </div>
          
          {user ? (
            <Link to="/profile" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold hover:bg-white/10 transition-colors">
              {user?.email?.[0].toUpperCase() || '?'}
            </Link>
          ) : (
            <Link to="/login" className="btn-primary py-2 px-4 text-xs flex items-center gap-2">
              <LogIn size={14} />
              Sign In
            </Link>
          )}
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        {/* Desktop Sidebar (Optional, maybe keep it minimal or hide for landing-focused feel) */}
        <aside className="hidden md:flex flex-col w-20 border-r border-white/5 p-4 sticky top-16 h-[calc(100vh-64px)]">
          <nav className="flex flex-col items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "p-3 rounded-xl transition-all",
                    isActive ? "bg-accent text-black" : "text-gray-500 hover:text-white hover:bg-white/5"
                  )
                }
                title={item.label}
              >
                <item.icon size={20} />
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 pb-24 md:pb-0">
          <div className="max-w-6xl mx-auto p-6 md:p-12">
            <Outlet />
          </div>
          
          {/* Footer */}
          <footer className="mt-20 border-t border-white/5 p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <div className="flex gap-4">
              <span>tasksats.com</span>
              <span>•</span>
              <span>tasksats.ai</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={10} className="text-accent fill-accent" />
              <span>Powered by Bitcoin Lightning</span>
            </div>
          </footer>
        </main>
      </div>

      {/* Mobile Bottom Tabs */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/10 flex justify-around items-center p-4 z-50">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 transition-colors",
                isActive ? "text-accent" : "text-gray-500"
              )
            }
          >
            <item.icon size={24} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
