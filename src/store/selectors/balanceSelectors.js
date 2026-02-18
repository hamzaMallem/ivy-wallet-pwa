import { createSelector } from '@reduxjs/toolkit';

const selectTransactions = (state) => state.transactions.items;
const selectAccounts = (state) => state.accounts.items;

export const selectTotalBalance = createSelector(
  [selectTransactions, selectAccounts],
  (transactions, accounts) => {
    const balances = {};
    accounts.forEach((a) => {
      balances[a.id] = 0;
    });

    transactions.forEach((t) => {
      if (t.type === 'INCOME') {
        balances[t.accountId] = (balances[t.accountId] || 0) + t.amount;
      } else if (t.type === 'EXPENSE') {
        balances[t.accountId] = (balances[t.accountId] || 0) - t.amount;
      } else if (t.type === 'TRANSFER') {
        balances[t.accountId] = (balances[t.accountId] || 0) - t.amount;
        if (t.toAccountId) {
          balances[t.toAccountId] =
            (balances[t.toAccountId] || 0) + (t.toAmount || t.amount);
        }
      }
    });

    return Object.values(balances).reduce((sum, b) => sum + b, 0);
  }
);

export const selectAccountBalances = createSelector(
  [selectTransactions, selectAccounts],
  (transactions, accounts) => {
    const balances = {};
    accounts.forEach((a) => {
      balances[a.id] = 0;
    });

    transactions.forEach((t) => {
      if (t.type === 'INCOME') {
        balances[t.accountId] = (balances[t.accountId] || 0) + t.amount;
      } else if (t.type === 'EXPENSE') {
        balances[t.accountId] = (balances[t.accountId] || 0) - t.amount;
      } else if (t.type === 'TRANSFER') {
        balances[t.accountId] = (balances[t.accountId] || 0) - t.amount;
        if (t.toAccountId) {
          balances[t.toAccountId] =
            (balances[t.toAccountId] || 0) + (t.toAmount || t.amount);
        }
      }
    });

    return balances;
  }
);
