import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Wallet, PieChart, Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/accounts', icon: Wallet, label: 'Accounts' },
  { path: '/reports', icon: PieChart, label: 'Reports' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-52 flex-col border-r border-surface-variant bg-surface z-40">
      {/* Brand */}
      <div className="px-4 pt-6 pb-4">
        <span className="text-lg font-bold text-primary">Ivy Wallet</span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary-subtle text-primary'
                  : 'text-outline hover:bg-surface-variant hover:text-on-surface'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Add Transaction button */}
      <div className="p-4">
        <button
          onClick={() => navigate('/transactions/new')}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-on-primary shadow-sm transition-transform hover:scale-[1.02] active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Transaction
        </button>
      </div>
    </aside>
  );
}
