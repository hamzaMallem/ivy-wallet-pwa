import { createSelector } from '@reduxjs/toolkit';
import { getDaysInMonth } from 'date-fns';

const selectTransactions = (state) => state.transactions.items;
const selectTimePeriod = (state) => state.ui.timePeriod;
const selectStartDay = (state) => state.settings.data.startDayOfMonth ?? 1;
const selectTreatTransfers = (state) =>
  state.settings.data.treatTransfersAsIncomeExpense ?? false;

/**
 * Returns the [start, end] Date range for the given period and start-day setting.
 * When startDay=1, this matches the calendar month exactly.
 * When startDay=15, "February 2026" means Feb 15 → Mar 14 23:59:59.
 */
function getPeriodBounds(year, month, startDay) {
  const day = Math.max(1, Math.min(28, startDay));
  if (day === 1) {
    const start = new Date(year, month, 1, 0, 0, 0, 0);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999); // last day of month
    return { start, end };
  }
  const start = new Date(year, month, day, 0, 0, 0, 0);
  // End is one day before startDay of the following month
  const nextMonthMaxDay = getDaysInMonth(new Date(year, month + 1));
  const endDay = Math.min(day - 1, nextMonthMaxDay);
  const end = new Date(year, month + 1, endDay, 23, 59, 59, 999);
  return { start, end };
}

export const selectPeriodTransactions = createSelector(
  [selectTransactions, selectTimePeriod, selectStartDay],
  (transactions, period, startDay) => {
    const { start, end } = getPeriodBounds(period.year, period.month, startDay);
    return transactions.filter((t) => {
      if (!t.dateTime) return false;
      const date = new Date(t.dateTime);
      return date >= start && date <= end;
    });
  }
);

export const selectPeriodIncome = createSelector(
  [selectPeriodTransactions, selectTreatTransfers],
  (transactions, treatTransfers) =>
    transactions
      .filter(
        (t) =>
          t.type === 'INCOME' ||
          (treatTransfers && t.type === 'TRANSFER' && t.toAccountId)
      )
      .reduce((sum, t) => {
        if (t.type === 'TRANSFER') return sum + (t.toAmount ?? t.amount);
        return sum + t.amount;
      }, 0)
);

export const selectPeriodExpense = createSelector(
  [selectPeriodTransactions, selectTreatTransfers],
  (transactions, treatTransfers) =>
    transactions
      .filter(
        (t) => t.type === 'EXPENSE' || (treatTransfers && t.type === 'TRANSFER')
      )
      .reduce((sum, t) => sum + t.amount, 0)
);

export const selectExpensesByCategory = createSelector(
  [selectPeriodTransactions],
  (transactions) => {
    const byCategory = {};
    transactions
      .filter((t) => t.type === 'EXPENSE')
      .forEach((t) => {
        const catId = t.categoryId || 'uncategorized';
        byCategory[catId] = (byCategory[catId] || 0) + t.amount;
      });
    return byCategory;
  }
);

export const selectIncomeByCategory = createSelector(
  [selectPeriodTransactions],
  (transactions) => {
    const byCategory = {};
    transactions
      .filter((t) => t.type === 'INCOME')
      .forEach((t) => {
        const catId = t.categoryId || 'uncategorized';
        byCategory[catId] = (byCategory[catId] || 0) + t.amount;
      });
    return byCategory;
  }
);
