import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAccounts, removeAccount } from '@/store/slices/accountsSlice';
import { fetchTransactions } from '@/store/slices/transactionsSlice';
import { fetchTags } from '@/store/slices/tagsSlice';
import { selectAccountBalances } from '@/store/selectors/balanceSelectors';
import { openModal } from '@/store/slices/uiSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransactionItem } from '@/components/TransactionItem';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { ArrowLeft, Edit, Trash2, Inbox } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

export function AccountDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const account = useAppSelector((state) =>
    state.accounts.items.find((a) => a.id === id)
  );
  const transactions = useAppSelector((state) => state.transactions.items);
  const settings = useAppSelector((state) => state.settings.data);
  const balances = useAppSelector(selectAccountBalances);

  const accountTransactions = useMemo(
    () =>
      transactions
        .filter((t) => t.accountId === id || t.toAccountId === id)
        .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime)),
    [transactions, id]
  );

  const income = useMemo(
    () =>
      accountTransactions
        .filter((t) => t.type === 'INCOME' && t.accountId === id)
        .reduce((s, t) => s + t.amount, 0),
    [accountTransactions, id]
  );

  const expense = useMemo(
    () =>
      accountTransactions
        .filter((t) => t.type === 'EXPENSE' && t.accountId === id)
        .reduce((s, t) => s + t.amount, 0),
    [accountTransactions, id]
  );

  // Running balance chart data — sorted oldest→newest, one point per day
  const balanceHistory = useMemo(() => {
    const sorted = [...accountTransactions].sort(
      (a, b) => new Date(a.dateTime) - new Date(b.dateTime)
    );
    let running = 0;
    const byDay = {};
    sorted.forEach((t) => {
      if (t.type === 'INCOME') running += t.amount;
      else if (t.type === 'EXPENSE') running -= t.amount;
      else if (t.type === 'TRANSFER') {
        if (t.accountId === id) running -= t.amount;
        else running += t.toAmount ?? t.amount;
      }
      const day = format(new Date(t.dateTime), 'MMM d');
      byDay[day] = parseFloat(running.toFixed(2));
    });
    return Object.entries(byDay).map(([day, balance]) => ({ day, balance }));
  }, [accountTransactions, id]);

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchTransactions());
    dispatch(fetchTags());
  }, [dispatch]);

  if (!account) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6 md:max-w-2xl lg:max-w-4xl">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <p className="mt-4 text-center text-outline">Account not found</p>
      </div>
    );
  }

  const colorHex = `#${(account.color || 0x5c3df5).toString(16).padStart(6, '0')}`;

  const handleDelete = async () => {
    await dispatch(removeAccount(id));
    navigate('/accounts');
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-8 md:max-w-2xl lg:max-w-4xl">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-1 items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: colorHex }}
          >
            <Icon name={account.icon || 'wallet'} className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">{account.name}</h1>
            <p className="text-xs text-outline">
              {account.currency || settings.baseCurrency}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            dispatch(openModal({ modal: 'editAccount', data: account }))
          }
        >
          <Edit className="h-4 w-4" />
        </Button>
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <span className="text-xs text-error">Delete?</span>
            <Button variant="destructive" size="sm" className="h-7 px-2 text-xs" onClick={handleDelete}>Yes</Button>
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setConfirmDelete(false)}>No</Button>
          </div>
        ) : (
          <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4 text-error" />
          </Button>
        )}
      </div>

      {/* Balance */}
      <Card className="mb-4" style={{ borderColor: colorHex }}>
        <CardContent className="pt-4">
          <p className="text-sm text-outline">Balance</p>
          <p className="text-2xl font-bold">
            {(balances[id] || 0).toFixed(2)} {account.currency || settings.baseCurrency}
          </p>
          <div className="mt-2 flex gap-4 text-sm">
            <span className="text-ivy-green">+{income.toFixed(2)} income</span>
            <span className="text-ivy-red">-{expense.toFixed(2)} expenses</span>
          </div>
        </CardContent>
      </Card>

      {/* Balance history chart */}
      {balanceHistory.length > 1 && (
        <Card className="mb-4">
          <CardContent className="pt-4 pb-2">
            <p className="mb-2 text-xs font-medium text-outline">Balance Over Time</p>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={balanceHistory} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colorHex} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={colorHex} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis hide />
                <Tooltip
                  formatter={(v) => [`${v.toFixed(2)} ${account.currency || settings.baseCurrency}`, 'Balance']}
                  labelStyle={{ fontSize: 11 }}
                  contentStyle={{ fontSize: 11 }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke={colorHex}
                  strokeWidth={2}
                  fill="url(#balanceGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Transactions */}
      <h2 className="mb-2 text-sm font-medium text-outline">Transactions</h2>
      {accountTransactions.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No transactions"
          description="Add a transaction to this account"
        />
      ) : (
        <div className="space-y-1">
          {accountTransactions.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              onClick={() => navigate(`/transactions/${tx.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
