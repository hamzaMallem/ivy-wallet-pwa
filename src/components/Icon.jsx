import { ICONS } from './IconPicker';
import { Wallet } from 'lucide-react';

/**
 * Renders an icon component by name
 * Avoids creating components during render by using a stable component
 */
export function Icon({ name, className = 'h-5 w-5', ...props }) {
  const iconData = ICONS.find((i) => i.name === name);
  const IconComponent = iconData ? iconData.Icon : Wallet;

  return <IconComponent className={className} {...props} />;
}
