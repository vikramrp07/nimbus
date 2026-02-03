import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, CreditCard, Target, Plus, PieChart, Settings } from 'lucide-react';

interface NavbarProps {
  onAddTransaction: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onAddTransaction }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/transactions', label: 'Activity', icon: CreditCard },
    { path: '/budget', label: 'Budget', icon: PieChart },
    { path: '/goals', label: 'Goals', icon: Target },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-primary-600 bg-primary-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50';
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 z-30">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Nimbus</span>
          </div>
        </div>
        
        <div className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive(item.path)}`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="p-4">
          <button 
            onClick={onAddTransaction}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            Add Transaction
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-30 px-4 py-2">
        <div className="flex justify-between items-center">
          {navItems.slice(0, 2).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-16 h-14 gap-1 rounded-xl transition-colors ${isActive(item.path)}`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
          
          <div className="relative -top-5">
            <button 
              onClick={onAddTransaction}
              className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-xl shadow-slate-900/30 active:scale-90 active:bg-slate-800 transition-all"
            >
              <Plus className="w-7 h-7" />
            </button>
          </div>

          {navItems.slice(2, 4).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-16 h-14 gap-1 rounded-xl transition-colors ${isActive(item.path)}`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
      
      {/* Spacer for bottom nav on mobile */}
      <div className="md:hidden h-24" />
    </>
  );
};
