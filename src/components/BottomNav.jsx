import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Wallet, PieChart, Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/accounts', icon: Wallet, label: 'Accounts' },
  { path: '/reports', icon: PieChart, label: 'Reports' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-surface-variant bg-surface pb-safe">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {navItems.slice(0, 2).map((item) => (
          <NavButton
            key={item.path}
            item={item}
            active={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          />
        ))}

        <button
          onClick={() => navigate('/transactions/new')}
          className="flex h-14 w-14 -translate-y-3 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <Plus className="h-6 w-6" />
        </button>

        {navItems.slice(2).map((item) => (
          <NavButton
            key={item.path}
            item={item}
            active={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          />
        ))}
      </div>
    </nav>
  );
}

function NavButton({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-0.5 px-3 py-2 text-xs transition-colors',
        active ? 'text-primary' : 'text-outline'
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{item.label}</span>
    </button>
  );
}
