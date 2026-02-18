import { AmountDisplay } from './AmountDisplay';
import { Button } from './ui/button';
import { CalendarClock } from 'lucide-react';
import { format } from 'date-fns';

/**
 * Card shown on the Home screen for overdue and upcoming planned payments.
 * Provides Pay and Skip actions.
 */
export function UpcomingPaymentCard({
  payment,
  dueDate,
  isOverdue,
  account,
  category,
  settings,
  onPay,
  onSkip,
}) {
  const iconBg =
    payment.type === 'INCOME' ? 'var(--ivy-green)' : 'var(--ivy-red)';

  return (
    <div
      className={`flex items-center justify-between rounded-xl border p-3 ${
        isOverdue
          ? 'border-error-subtle bg-error-subtle'
          : 'border-surface-variant bg-surface'
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ backgroundColor: iconBg }}
        >
          <CalendarClock className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {payment.title || category?.name || 'Payment'}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-outline">
            {account && <span>{account.name}</span>}
            {account && <span>·</span>}
            <span
              className={isOverdue ? 'font-medium text-error' : ''}
            >
              {isOverdue ? 'Due ' : ''}{format(dueDate, 'MMM d')}
            </span>
            {!payment.oneTime && payment.intervalType && (
              <>
                <span>·</span>
                <span>
                  every {payment.intervalN > 1 ? `${payment.intervalN} ` : ''}
                  {payment.intervalType.toLowerCase()}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="ml-2 flex shrink-0 items-center gap-2">
        <AmountDisplay
          amount={payment.amount}
          currency={settings.baseCurrency}
          type={payment.type}
          className="text-sm font-semibold"
        />
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            onClick={() => onSkip(payment)}
          >
            Skip
          </Button>
          <Button
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onPay(payment)}
          >
            Pay
          </Button>
        </div>
      </div>
    </div>
  );
}
