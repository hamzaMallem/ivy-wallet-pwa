import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectPeriodTransactions,
  selectPeriodIncome,
  selectPeriodExpense,
  selectExpensesByCategory,
  selectIncomeByCategory,
} from '@/store/selectors/statsSelectors';
import { nextMonth, previousMonth } from '@/store/slices/uiSlice';
import { fetchAccounts } from '@/store/slices/accountsSlice';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import { fetchTags } from '@/store/slices/tagsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AmountDisplay } from '@/components/AmountDisplay';
import { EmptyState } from '@/components/EmptyState';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  ChevronLeft,
  ChevronRight,
  PieChart as PieChartIcon,
  SlidersHorizontal,
  X,
  CalendarRange,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, Legend,
  AreaChart, Area,
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const CHART_COLORS = [
  '#5C3DF5', '#12B880', '#F53D3D', '#3193F5', '#F57A3D',
  '#F53D99', '#F5D018', '#9987F5', '#5AE0B4', '#87BEF5',
  '#74747A', '#CC6633',
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function CategoryBreakdown({ data, total, currency }) {
  if (data.length === 0) return null;
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.id} className="flex items-center gap-3">
          <div
            className="h-3 w-3 flex-shrink-0 rounded-full"
            style={{ backgroundColor: item.chartColor }}
          />
          <span className="flex-1 truncate text-sm">{item.name}</span>
          <span className="text-sm font-medium">
            {item.amount.toFixed(2)} {currency}
          </span>
          <span className="w-10 text-right text-xs text-outline">
            {total > 0 ? `${((item.amount / total) * 100).toFixed(0)}%` : '0%'}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Reusable multi-select chip row used for accounts, categories, and tags */
function FilterChips({ label, items, selected, onToggle, getLabel, getColor }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-outline">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => {
          const active = selected.includes(item.id);
          const color = getColor?.(item);
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                active
                  ? 'bg-primary text-on-primary'
                  : 'border border-outline text-outline hover:border-primary hover:text-primary'
              }`}
            >
              {color && (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: active ? 'white' : color }}
                />
              )}
              {getLabel(item)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function ReportsPage() {
  const dispatch = useAppDispatch();

  // Load data on mount in case user lands here directly
  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchCategories());
    dispatch(fetchTags());
  }, [dispatch]);

  // All transactions (needed for custom range + trend)
  const allTransactions = useAppSelector((state) => state.transactions.items);

  // Base selectors (unfiltered, period-scoped)
  const periodTransactions = useAppSelector(selectPeriodTransactions);
  const baseIncome = useAppSelector(selectPeriodIncome);
  const baseExpense = useAppSelector(selectPeriodExpense);
  const baseExpensesByCategory = useAppSelector(selectExpensesByCategory);
  const baseIncomeByCategory = useAppSelector(selectIncomeByCategory);

  const accounts = useAppSelector((state) => state.accounts.items);
  const categories = useAppSelector((state) => state.categories.items);
  const allTags = useAppSelector((state) => state.tags.items);
  const settings = useAppSelector((state) => state.settings.data);
  const timePeriod = useAppSelector((state) => state.ui.timePeriod);

  // Date mode
  const [dateMode, setDateMode] = useState('period'); // 'period' | 'custom'
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const periodLabel = format(new Date(timePeriod.year, timePeriod.month), 'MMMM yyyy');
  const treatTransfers = settings.treatTransfersAsIncomeExpense ?? false;

  const activeFilterCount =
    selectedAccounts.length + selectedCategories.length + selectedTags.length;
  const isFiltered = activeFilterCount > 0 || dateMode === 'custom';

  const clearAllFilters = () => {
    setSelectedAccounts([]);
    setSelectedCategories([]);
    setSelectedTags([]);
  };

  const toggle = (setter) => (id) =>
    setter((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // ── Custom date range base transactions ───────────────────────────────────
  const customRangeTransactions = useMemo(() => {
    if (dateMode !== 'custom' || !customFrom || !customTo) return [];
    const from = new Date(customFrom);
    const to = new Date(customTo);
    to.setHours(23, 59, 59, 999);
    return allTransactions.filter((t) => {
      if (!t.dateTime) return false;
      const d = new Date(t.dateTime);
      return d >= from && d <= to;
    });
  }, [dateMode, customFrom, customTo, allTransactions]);

  // ── Filtered transactions (chained) ───────────────────────────────────────
  const filteredTransactions = useMemo(() => {
    let txs = dateMode === 'custom' ? customRangeTransactions : periodTransactions;

    if (selectedAccounts.length > 0) {
      txs = txs.filter(
        (t) =>
          selectedAccounts.includes(t.accountId) ||
          (t.toAccountId && selectedAccounts.includes(t.toAccountId))
      );
    }
    if (selectedCategories.length > 0) {
      txs = txs.filter((t) => selectedCategories.includes(t.categoryId));
    }
    if (selectedTags.length > 0) {
      txs = txs.filter((t) =>
        (t.tags || []).some((id) => selectedTags.includes(id))
      );
    }

    return txs;
  }, [periodTransactions, selectedAccounts, selectedCategories, selectedTags]);

  // ── Derived stats (use base selectors when no filter, recompute when filtered) ──
  const income = useMemo(() => {
    if (!isFiltered) return baseIncome;
    return filteredTransactions
      .filter(
        (t) =>
          t.type === 'INCOME' ||
          (treatTransfers && t.type === 'TRANSFER' && t.toAccountId)
      )
      .reduce((sum, t) => {
        if (t.type === 'TRANSFER') return sum + (t.toAmount ?? t.amount);
        return sum + t.amount;
      }, 0);
  }, [filteredTransactions, isFiltered, baseIncome, treatTransfers]);

  const expense = useMemo(() => {
    if (!isFiltered) return baseExpense;
    return filteredTransactions
      .filter(
        (t) => t.type === 'EXPENSE' || (treatTransfers && t.type === 'TRANSFER')
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions, isFiltered, baseExpense, treatTransfers]);

  const expensesByCategory = useMemo(() => {
    if (!isFiltered) return baseExpensesByCategory;
    const byCategory = {};
    filteredTransactions
      .filter((t) => t.type === 'EXPENSE')
      .forEach((t) => {
        const catId = t.categoryId || 'uncategorized';
        byCategory[catId] = (byCategory[catId] || 0) + t.amount;
      });
    return byCategory;
  }, [filteredTransactions, isFiltered, baseExpensesByCategory]);

  const incomeByCategory = useMemo(() => {
    if (!isFiltered) return baseIncomeByCategory;
    const byCategory = {};
    filteredTransactions
      .filter((t) => t.type === 'INCOME')
      .forEach((t) => {
        const catId = t.categoryId || 'uncategorized';
        byCategory[catId] = (byCategory[catId] || 0) + t.amount;
      });
    return byCategory;
  }, [filteredTransactions, isFiltered, baseIncomeByCategory]);

  const buildChartData = (byCategory) =>
    Object.entries(byCategory)
      .map(([catId, amount], i) => {
        const cat = categories.find((c) => c.id === catId);
        return {
          id: catId,
          name: cat?.name || 'Uncategorized',
          amount,
          chartColor: cat?.color
            ? `#${cat.color.toString(16).padStart(6, '0')}`
            : CHART_COLORS[i % CHART_COLORS.length],
        };
      })
      .sort((a, b) => b.amount - a.amount);

  const expenseData = useMemo(
    () => buildChartData(expensesByCategory),
    [expensesByCategory, categories]
  );
  const incomeData = useMemo(
    () => buildChartData(incomeByCategory),
    [incomeByCategory, categories]
  );

  // ── Monthly trend (last 6 months) ─────────────────────────────────────────
  const trendData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const monthDate = subMonths(now, 5 - i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      const monthTxs = allTransactions.filter((t) => {
        if (!t.dateTime) return false;
        const d = new Date(t.dateTime);
        return d >= start && d <= end;
      });
      const inc = monthTxs
        .filter((t) => t.type === 'INCOME')
        .reduce((s, t) => s + t.amount, 0);
      const exp = monthTxs
        .filter((t) => t.type === 'EXPENSE')
        .reduce((s, t) => s + t.amount, 0);
      return {
        month: format(monthDate, 'MMM yy'),
        Income: parseFloat(inc.toFixed(2)),
        Expenses: parseFloat(exp.toFixed(2)),
      };
    });
  }, [allTransactions]);

  // ── Total balance per month (last 12 months) ──────────────────────────────
  const balanceOverTime = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const monthDate = subMonths(now, 11 - i);
      const end = endOfMonth(monthDate);
      // Sum all transactions up to end of this month
      const txsUpTo = allTransactions.filter((t) => {
        if (!t.dateTime) return false;
        return new Date(t.dateTime) <= end;
      });
      let balance = 0;
      txsUpTo.forEach((t) => {
        if (t.type === 'INCOME') balance += t.amount;
        else if (t.type === 'EXPENSE') balance -= t.amount;
        else if (t.type === 'TRANSFER') {
          balance -= t.amount;
          balance += t.toAmount ?? t.amount;
        }
      });
      return {
        month: format(monthDate, 'MMM yy'),
        Balance: parseFloat(balance.toFixed(2)),
      };
    });
  }, [allTransactions]);

  const hasData = income > 0 || expense > 0;

  const emptyDescription = isFiltered
    ? 'No transactions match the active filters'
    : 'Add transactions to see your reports';

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-8 md:max-w-2xl lg:max-w-4xl">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Reports</h1>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`relative flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm transition-colors ${
            showFilters || isFiltered
              ? 'bg-primary-subtle text-primary'
              : 'text-outline hover:text-on-surface'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Period / Custom toggle */}
      <div className="mb-4">
        {dateMode === 'period' ? (
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => dispatch(previousMonth())}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm font-medium">{periodLabel}</span>
            <Button variant="ghost" size="icon" onClick={() => dispatch(nextMonth())}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="flex-1 text-sm"
            />
            <span className="text-sm text-outline">→</span>
            <Input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="flex-1 text-sm"
            />
          </div>
        )}
        <button
          onClick={() => setDateMode((m) => (m === 'period' ? 'custom' : 'period'))}
          className={`mt-2 flex items-center gap-1 text-xs transition-colors ${
            dateMode === 'custom' ? 'text-primary' : 'text-outline hover:text-on-surface'
          }`}
        >
          <CalendarRange className="h-3.5 w-3.5" />
          {dateMode === 'custom' ? 'Back to monthly view' : 'Custom date range'}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="mb-4">
          <CardContent className="space-y-4 pt-4">
            <FilterChips
              label="Accounts"
              items={accounts}
              selected={selectedAccounts}
              onToggle={toggle(setSelectedAccounts)}
              getLabel={(a) => a.name}
              getColor={(a) =>
                a.color
                  ? `#${a.color.toString(16).padStart(6, '0')}`
                  : 'var(--ivy-purple)'
              }
            />
            <FilterChips
              label="Categories"
              items={categories}
              selected={selectedCategories}
              onToggle={toggle(setSelectedCategories)}
              getLabel={(c) => c.name}
              getColor={(c) =>
                c.color
                  ? `#${c.color.toString(16).padStart(6, '0')}`
                  : 'var(--ivy-gray)'
              }
            />
            <FilterChips
              label="Tags"
              items={allTags}
              selected={selectedTags}
              onToggle={toggle(setSelectedTags)}
              getLabel={(t) => `#${t.name}`}
            />

            {isFiltered && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-xs text-outline hover:text-error"
              >
                <X className="h-3 w-3" />
                Clear all filters
              </button>
            )}

            {!accounts.length && !categories.length && !allTags.length && (
              <p className="text-sm text-outline">No filter options available yet.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active filter summary chips (shown when panel is closed) */}
      {!showFilters && isFiltered && (
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          {selectedAccounts.map((id) => {
            const a = accounts.find((x) => x.id === id);
            return a ? (
              <span
                key={id}
                className="flex items-center gap-1 rounded-full bg-primary-subtle px-2 py-0.5 text-xs text-primary"
              >
                {a.name}
                <button onClick={() => toggle(setSelectedAccounts)(id)}>
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ) : null;
          })}
          {selectedCategories.map((id) => {
            const c = categories.find((x) => x.id === id);
            return c ? (
              <span
                key={id}
                className="flex items-center gap-1 rounded-full bg-primary-subtle px-2 py-0.5 text-xs text-primary"
              >
                {c.name}
                <button onClick={() => toggle(setSelectedCategories)(id)}>
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ) : null;
          })}
          {selectedTags.map((id) => {
            const t = allTags.find((x) => x.id === id);
            return t ? (
              <span
                key={id}
                className="flex items-center gap-1 rounded-full bg-primary-subtle px-2 py-0.5 text-xs text-primary"
              >
                #{t.name}
                <button onClick={() => toggle(setSelectedTags)(id)}>
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ) : null;
          })}
          <button
            onClick={clearAllFilters}
            className="text-xs text-outline underline hover:text-on-surface"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Content */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start">
        {/* Left column: summary stats (period-scoped) */}
        <div>
          {!hasData ? (
            <EmptyState
              icon={PieChartIcon}
              title={isFiltered ? 'No matching data' : 'No data yet'}
              description={emptyDescription}
            />
          ) : (
            <>
              {/* Summary */}
              <div className="mb-4 grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="pt-3">
                    <p className="text-xs text-outline">Income</p>
                    <AmountDisplay
                      amount={income}
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
              </div>

              {/* Net */}
              <Card className="mb-6">
                <CardContent className="flex items-center justify-between pt-3">
                  <p className="text-xs text-outline">Net</p>
                  <AmountDisplay
                    amount={income - expense}
                    currency={settings.baseCurrency}
                    type={income - expense >= 0 ? 'INCOME' : 'EXPENSE'}
                    className="text-xl font-bold"
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Right column: charts + breakdown (Trend & Balance always visible) */}
        <div>
            <Tabs defaultValue="expenses">
              <TabsList className="w-full">
                <TabsTrigger value="expenses" className="flex-1">Expenses</TabsTrigger>
                <TabsTrigger value="income" className="flex-1">Income</TabsTrigger>
                <TabsTrigger value="trend" className="flex-1">Trend</TabsTrigger>
                <TabsTrigger value="balance" className="flex-1">Balance</TabsTrigger>
              </TabsList>

              <TabsContent value="expenses">
                {expenseData.length > 0 && (
                  <Card className="mb-4">
                    <CardContent className="pt-4">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={expenseData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={90}
                            dataKey="amount"
                            nameKey="name"
                            paddingAngle={2}
                          >
                            {expenseData.map((entry) => (
                              <Cell key={entry.id} fill={entry.chartColor} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [
                              `${value.toFixed(2)} ${settings.baseCurrency}`,
                              'Amount',
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
                <Card>
                  <CardHeader>
                    <CardTitle>Expenses by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategoryBreakdown
                      data={expenseData}
                      total={expense}
                      currency={settings.baseCurrency}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="income">
                {incomeData.length > 0 && (
                  <Card className="mb-4">
                    <CardContent className="pt-4">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={incomeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={90}
                            dataKey="amount"
                            nameKey="name"
                            paddingAngle={2}
                          >
                            {incomeData.map((entry) => (
                              <Cell key={entry.id} fill={entry.chartColor} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [
                              `${value.toFixed(2)} ${settings.baseCurrency}`,
                              'Amount',
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
                <Card>
                  <CardHeader>
                    <CardTitle>Income by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategoryBreakdown
                      data={incomeData}
                      total={income}
                      currency={settings.baseCurrency}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trend">
                <Card>
                  <CardHeader>
                    <CardTitle>Last 6 Months</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={trendData} barCategoryGap="30%">
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} width={50} />
                        <Tooltip
                          formatter={(value) => [
                            `${value.toFixed(2)} ${settings.baseCurrency}`,
                          ]}
                        />
                        <Legend />
                        <Bar dataKey="Income" fill="#12B880" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Expenses" fill="#F53D3D" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="balance">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Balance — Last 12 Months</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={balanceOverTime} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="balanceTotalGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#5C3DF5" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#5C3DF5" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 11 }} width={55} />
                        <Tooltip
                          formatter={(value) => [
                            `${value.toFixed(2)} ${settings.baseCurrency}`,
                            'Balance',
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="Balance"
                          stroke="#5C3DF5"
                          strokeWidth={2}
                          fill="url(#balanceTotalGrad)"
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
    </div>
  );
}
