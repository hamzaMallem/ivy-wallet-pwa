import { cn } from '@/lib/utils';
import { formatAmount } from '@/lib/utils';

export function AmountDisplay({ amount, currency = 'MAD', type, className }) {
  const colorClass =
    type === 'INCOME'
      ? 'text-ivy-green'
      : type === 'EXPENSE'
        ? 'text-ivy-red'
        : 'text-on-background';

  return (
    <span className={cn('font-semibold', colorClass, className)}>
      {type === 'EXPENSE' && '-'}
      {formatAmount(Math.abs(amount))} {currency}
    </span>
  );
}
