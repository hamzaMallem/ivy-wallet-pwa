import Dexie from 'dexie';

export const db = new Dexie('IvyWallet');

db.version(1).stores({
  accounts: '&id, name, orderNum',
  categories: '&id, name, orderNum',
  transactions: '&id, accountId, type, categoryId, dateTime, *tags',
  budgets: '&id, name',
  plannedPayments: '&id, accountId, type, startDate',
  loans: '&id, name, type, accountId',
  loanRecords: '&id, loanId, dateTime',
  tags: '&id, name, orderNum',
  exchangeRates: '[baseCurrency+currency], baseCurrency, currency',
  settings: '&id',
});

// Version 2: Add recurring transaction auto-creation support
db.version(2)
  .stores({
    accounts: '&id, name, orderNum',
    categories: '&id, name, orderNum',
    transactions: '&id, accountId, type, categoryId, dateTime, plannedPaymentId, *tags',
    budgets: '&id, name',
    plannedPayments: '&id, accountId, type, startDate',
    loans: '&id, name, type, accountId',
    loanRecords: '&id, loanId, dateTime',
    tags: '&id, name, orderNum',
    exchangeRates: '[baseCurrency+currency], baseCurrency, currency',
    settings: '&id',
    recurringHistory: '&id, plannedPaymentId, scheduledDate, createdDate',
  })
  .upgrade((tx) => {
    // Migrate existing recurring payments to have autoCreateEnabled flag
    return tx
      .table('plannedPayments')
      .toCollection()
      .modify((payment) => {
        if (!payment.oneTime) {
          payment.autoCreateEnabled = true;
          payment.lastProcessedDate = null;
        }
      });
  });
