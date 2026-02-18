import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTransactions, addTransaction } from '@/store/slices/transactionsSlice';
import { fetchAccounts } from '@/store/slices/accountsSlice';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import { fetchSettings } from '@/store/slices/settingsSlice';
import { fetchTags } from '@/store/slices/tagsSlice';
import {
  fetchPlannedPayments,
  editPlannedPayment,
  removePlannedPayment,
} from '@/store/slices/plannedPaymentsSlice';
import { selectTotalBalance } from '@/store/selectors/balanceSelectors';
import {
  selectPeriodIncome,
  selectPeriodExpense,
  selectPeriodTransactions,
} from '@/store/selectors/statsSelectors';
import { nextMonth, previousMonth } from '@/store/slices/uiSlice';
import { calculateNextOccurrence } from '@/lib/recurringUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AmountDisplay } from '@/components/AmountDisplay';
import { TransactionItem } from '@/components/TransactionItem';
import { EmptyState } from '@/components/EmptyState';
import { RecurringNotification } from '@/components/RecurringNotification';
import { UpcomingPaymentCard } from '@/components/UpcomingPaymentCard';
import { ChevronLeft, ChevronRight, Inbox, Search } from 'lucide-react';
import {
  format,
  isToday,
  isYesterday,
  startOfDay,
  addDays,
  isBefore,
  isAfter,
} from 'date-fns';

// ─── Helpers ────────────────────────────────────────────────────────────────

function groupByDate(transactions) {
  const groups = {};
  for (const tx of transactions) {
    const date = tx.dateTime
      ? format(new Date(tx.dateTime), 'yyyy-MM-dd')
      : 'unknown';
    if (!groups[date]) groups[date] = [];
    groups[date].push(tx);
  }
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, txs]) => ({ date, transactions: txs }));
}

function formatDateLabel(dateStr) {
  const date = new Date(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEEE, MMM d');
}

/**
 * Returns the next due date for a planned payment.
 * - One-time: returns startDate
 * - Recurring: returns the next occurrence after lastProcessedDate (or today)
 */
function getNextDueDate(payment) {
  if (payment.oneTime) {
    return new Date(payment.startDate);
  }
  if (!payment.intervalType || !payment.intervalN) return null;

  const startDate = startOfDay(new Date(payment.startDate));
  const today = startOfDay(new Date());

  // Payment hasn't started yet — next due is the start date
  if (isAfter(startDate, today)) return startDate;

  const afterDate = payment.lastProcessedDate
    ? startOfDay(new Date(payment.lastProcessedDate))
    : today;

  try {
    return calculateNextOccurrence(
      payment.startDate,
      payment.intervalN,
      payment.intervalType,
      afterDate
    );
  } catch {
    return null;
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export function HomePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const settings = useAppSelector((state) => state.settings.data);
  const timePeriod = useAppSelector((state) => state.ui.timePeriod);
  const totalBalance = useAppSelector(selectTotalBalance);
  const income = useAppSelector(selectPeriodIncome);
  const expense = useAppSelector(selectPeriodExpense);
  const periodTransactions = useAppSelector(selectPeriodTransactions);
  const accounts = useAppSelector((state) => state.accounts.items);
  const categories = useAppSelector((state) => state.categories.items);
  const plannedPayments = useAppSelector((state) => state.plannedPayments.items);

  const grouped = useMemo(
    () => groupByDate(periodTransactions),
    [periodTransactions]
  );

  // ── Overdue & Upcoming planned payments ────────────────────────────────────
  const { overdue, upcoming } = useMemo(() => {
    const today = startOfDay(new Date());
    const in7Days = addDays(today, 7);

    const overdue = [];
    const upcoming = [];

    for (const p of plannedPayments) {
      const dueDate = getNextDueDate(p);
      if (!dueDate) continue;

      const dueDateNorm = startOfDay(dueDate);

      if (isBefore(dueDateNorm, today)) {
        // Overdue — only one-time (recurring are auto-processed by the service)
        if (p.oneTime) {
          overdue.push({ payment: p, dueDate });
        }
      } else if (!isAfter(dueDateNorm, in7Days)) {
        // Due within the next 7 days
        upcoming.push({ payment: p, dueDate });
      }
    }

    overdue.sort((a, b) => a.dueDate - b.dueDate);
    upcoming.sort((a, b) => a.dueDate - b.dueDate);

    return { overdue, upcoming };
  }, [plannedPayments]);

  useEffect(() => {
    dispatch(fetchSettings());
    dispatch(fetchAccounts());
    dispatch(fetchCategories());
    dispatch(fetchTransactions());
    dispatch(fetchTags());
    dispatch(fetchPlannedPayments());
  }, [dispatch]);

  // ── Pay / Skip handlers ────────────────────────────────────────────────────

  const handlePay = async (payment) => {
    await dispatch(
      addTransaction({
        type: payment.type,
        amount: payment.amount,
        accountId: payment.accountId,
        categoryId: payment.categoryId || undefined,
        title: payment.title || undefined,
        description: payment.description || undefined,
        dateTime: new Date().toISOString(),
        tags: [],
        plannedPaymentId: payment.id,
      })
    );

    if (payment.oneTime) {
      await dispatch(removePlannedPayment(payment.id));
    } else {
      // Advance lastProcessedDate so processRecurring skips this occurrence
      await dispatch(
        editPlannedPayment({
          id: payment.id,
          changes: { lastProcessedDate: new Date().toISOString() },
        })
      );
    }
  };

  const handleSkip = async (payment) => {
    if (payment.oneTime) {
      await dispatch(removePlannedPayment(payment.id));
    } else {
      // For recurring: advance lastProcessedDate past the current occurrence
      const dueDate = getNextDueDate(payment);
      const skipTo = dueDate ? dueDate : new Date();
      await dispatch(
        editPlannedPayment({
          id: payment.id,
          changes: { lastProcessedDate: skipTo.toISOString() },
        })
      );
    }
  };

  const periodLabel = format(
    new Date(timePeriod.year, timePeriod.month),
    'MMMM yyyy'
  );

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-8 md:max-w-2xl lg:max-w-4xl">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-outline">
          {settings.name ? `Hello, ${settings.name}` : 'Ivy Wallet'}
        </p>
        <Button variant="ghost" size="icon" onClick={() => navigate('/search')}>
          <Search className="h-5 w-5" />
        </Button>
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start">
        {/* Left column: balance + stats + upcoming */}
        <div>
          {/* Balance Card */}
          <Card className="mb-4 bg-primary text-on-primary">
            <CardContent className="pt-4">
              <p className="text-sm opacity-80">Total Balance</p>
              <p className="text-3xl font-bold">
                {settings.hideCurrentBalance
                  ? '****'
                  : `${totalBalance.toFixed(2)} ${settings.baseCurrency}`}
              </p>
            </CardContent>
          </Card>

          {/* Period Selector */}
          <div className="mb-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch(previousMonth())}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm font-medium">{periodLabel}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch(nextMonth())}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Income / Expense / Cashflow Summary */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="pt-3">
                <p className="text-xs text-outline">Income</p>
                <AmountDisplay
                  amount={settings.hideIncome ? 0 : income}
                  currency={settings.baseCurrency}
                  type="INCOME"
                  className="text-lg"
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-3">
                <p className="text-xs text-outline">Expenses</p>
                <AmountDisplay
                  amount={expense}
                  currency={settings.baseCurrency}
                  type="EXPENSE"
                  className="text-lg"
                />
              </CardContent>
            </Card>
            <Card className="col-span-2">
              <CardContent className="flex items-center justify-between pt-3">
                <p className="text-xs text-outline">Cashflow</p>
                <AmountDisplay
                  amount={settings.hideIncome ? 0 : income - expense}
                  currency={settings.baseCurrency}
                  type={income - expense >= 0 ? 'INCOME' : 'EXPENSE'}
                  className="text-sm font-bold"
                />
              </CardContent>
            </Card>
          </div>

          {/* Overdue Planned Payments */}
          {overdue.length > 0 && (
            <div className="mb-5">
              <h2 className="mb-2 text-sm font-medium text-error">
                Overdue ({overdue.length})
              </h2>
              <div className="space-y-2">
                {overdue.map(({ payment, dueDate }) => (
                  <UpcomingPaymentCard
                    key={payment.id}
                    payment={payment}
                    dueDate={dueDate}
                    isOverdue
                    account={accounts.find((a) => a.id === payment.accountId)}
                    category={categories.find((c) => c.id === payment.categoryId)}
                    settings={settings}
                    onPay={handlePay}
                    onSkip={handleSkip}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Planned Payments */}
          {upcoming.length > 0 && (
            <div className="mb-5">
              <h2 className="mb-2 text-sm font-medium text-outline">
                Upcoming ({upcoming.length})
              </h2>
              <div className="space-y-2">
                {upcoming.map(({ payment, dueDate }) => (
                  <UpcomingPaymentCard
                    key={payment.id}
                    payment={payment}
                    dueDate={dueDate}
                    isOverdue={false}
                    account={accounts.find((a) => a.id === payment.accountId)}
                    category={categories.find((c) => c.id === payment.categoryId)}
                    settings={settings}
                    onPay={handlePay}
                    onSkip={handleSkip}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: transaction list */}
        <div>
          <h2 className="mb-2 text-sm font-medium text-outline">Transactions</h2>
          {grouped.length === 0 ? (
            <EmptyState
              icon={Inbox}
              iconClassName="mb-4 h-20 w-20 text-primary"
              title="No transactions"
              description="Add your first transaction to get started"
            >
              <Button
                className="mt-2"
                onClick={() => navigate('/transactions/new')}
              >
                + Add First Transaction
              </Button>
            </EmptyState>
          ) : (
            <div className="space-y-4">
              {grouped.map((group) => (
                <div key={group.date}>
                  <p className="mb-1 text-xs font-medium text-outline">
                    {formatDateLabel(group.date)}
                  </p>
                  <div className="space-y-1">
                    {group.transactions.map((tx) => (
                      <TransactionItem
                        key={tx.id}
                        transaction={tx}
                        onClick={() => navigate(`/transactions/${tx.id}`)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recurring Transaction Notification */}
      <RecurringNotification />
    </div>
  );
}
