import { cn } from '@/lib/utils';
import {
  Wallet, CreditCard, PiggyBank, Landmark, Banknote,
  ShoppingCart, Coffee, Car, Zap, Heart, Gift, Gamepad2,
  Home, Briefcase, GraduationCap, Plane, Utensils, Shirt,
  Smartphone, Music, Book, Dumbbell, Pill, Bus,
} from 'lucide-react';

export const ICONS = [
  { name: 'wallet', Icon: Wallet },
  { name: 'card', Icon: CreditCard },
  { name: 'piggy', Icon: PiggyBank },
  { name: 'bank', Icon: Landmark },
  { name: 'cash', Icon: Banknote },
  { name: 'shopping', Icon: ShoppingCart },
  { name: 'food', Icon: Utensils },
  { name: 'coffee', Icon: Coffee },
  { name: 'transport', Icon: Car },
  { name: 'bus', Icon: Bus },
  { name: 'bills', Icon: Zap },
  { name: 'health', Icon: Heart },
  { name: 'gifts', Icon: Gift },
  { name: 'entertainment', Icon: Gamepad2 },
  { name: 'home', Icon: Home },
  { name: 'salary', Icon: Briefcase },
  { name: 'education', Icon: GraduationCap },
  { name: 'travel', Icon: Plane },
  { name: 'clothing', Icon: Shirt },
  { name: 'phone', Icon: Smartphone },
  { name: 'music', Icon: Music },
  { name: 'books', Icon: Book },
  { name: 'fitness', Icon: Dumbbell },
  { name: 'medicine', Icon: Pill },
];

export function IconPicker({ value, onChange, color }) {
  const bgColor = color
    ? `#${color.toString(16).padStart(6, '0')}`
    : 'var(--ivy-purple)';

  return (
    <div className="grid grid-cols-6 gap-2">
      {ICONS.map(({ name, Icon }) => (
        <button
          key={name}
          type="button"
          onClick={() => onChange(name)}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl transition-transform hover:scale-110',
            value === name ? 'text-white' : 'bg-surface-variant text-on-surface'
          )}
          style={value === name ? { backgroundColor: bgColor } : undefined}
          title={name}
        >
          <Icon className="h-5 w-5" />
        </button>
      ))}
    </div>
  );
}

export function getIconComponent(name) {
  const found = ICONS.find((i) => i.name === name);
  return found ? found.Icon : Wallet;
}
