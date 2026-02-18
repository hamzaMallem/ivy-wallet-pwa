import { createSelector } from '@reduxjs/toolkit';
import { selectPeriodTransactions } from './statsSelectors';

const selectBudgets = (state) => state.budgets.items;

export const selectBudgetsWithProgress = createSelector(
  [selectBudgets, selectPeriodTransactions],
  (budgets, transactions) => {
    return budgets.map((budget) => {
      const spent = transactions
        .filter((t) => {
          if (t.type !== 'EXPENSE') return false;
          if (
            budget.categoryIds?.length > 0 &&
            !budget.categoryIds.includes(t.categoryId)
          ) {
            return false;
          }
          if (
            budget.accountIds?.length > 0 &&
            !budget.accountIds.includes(t.accountId)
          ) {
            return false;
          }
          return true;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        ...budget,
        spent,
        remaining: budget.amount - spent,
        progress: budget.amount > 0 ? spent / budget.amount : 0,
      };
    });
  }
);
