import { useAppSelector } from '@/store/hooks';
import { Badge } from '@/components/ui/badge';
import { AmountDisplay } from './AmountDisplay';
import { Icon } from './Icon';
import { ArrowLeftRight } from 'lucide-react';
import { format } from 'date-fns';

export function TransactionItem({ transaction, onClick }) {
  const categories = useAppSelector((state) => state.categories.items);
  const accounts = useAppSelector((state) => state.accounts.items);
  const allTags = useAppSelector((state) => state.tags.items);
  const settings = useAppSelector((state) => state.settings.data);

  const txTags = (transaction.tags || [])
    .map((id) => allTags.find((t) => t.id === id))
    .filter(Boolean);

  const category = categories.find((c) => c.id === transaction.categoryId);
  const account = accounts.find((a) => a.id === transaction.accountId);
  const toAccount = accounts.find((a) => a.id === transaction.toAccountId);

  const badgeVariant =
    transaction.type === 'INCOME'
      ? 'income'
      : transaction.type === 'EXPENSE'
        ? 'expense'
        : 'transfer';

  const iconName = category?.icon || 'wallet';
  const isTransfer = transaction.type === 'TRANSFER';

  const bgColor =
    transaction.type === 'TRANSFER'
      ? 'var(--ivy-blue)'
      : category?.color
        ? `#${category.color.toString(16).padStart(6, '0')}`
        : 'var(--ivy-purple)';

  const subtitle =
    transaction.type === 'TRANSFER'
      ? `${account?.name || '?'} → ${toAccount?.name || '?'}`
      : account?.name || '';

  return (
    <button
      onClick={() => onClick?.(transaction)}
      className="flex w-full items-center justify-between rounded-xl p-3 text-left transition-colors hover:bg-surface-variant"
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
          style={{ backgroundColor: bgColor }}
        >
          {isTransfer ? (
            <ArrowLeftRight className="h-5 w-5" />
          ) : (
            <Icon name={iconName} className="h-5 w-5" />
          )}
        </div>
        <div>
          <p className="font-medium text-on-surface">
            {transaction.title || category?.name || 'Untitled'}
          </p>
          <div className="flex items-center gap-2 text-xs text-outline">
            <span>{subtitle}</span>
            {transaction.dateTime && (
              <span>{format(new Date(transaction.dateTime), 'MMM d')}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <AmountDisplay
          amount={transaction.amount}
          currency={settings.baseCurrency}
          type={transaction.type}
        />
        <div className="flex flex-wrap justify-end gap-1">
          <Badge variant={badgeVariant}>{transaction.type}</Badge>
          {transaction.plannedPaymentId && (
            <Badge variant="outline" className="text-xs">
              Recurring
            </Badge>
          )}
          {txTags.map((tag) => (
            <Badge key={tag.id} variant="outline" className="text-xs text-outline">
              #{tag.name}
            </Badge>
          ))}
        </div>
      </div>
    </button>
  );
}
