import { configureStore } from '@reduxjs/toolkit';
import accountsReducer from './slices/accountsSlice';
import categoriesReducer from './slices/categoriesSlice';
import transactionsReducer from './slices/transactionsSlice';
import budgetsReducer from './slices/budgetsSlice';
import plannedPaymentsReducer from './slices/plannedPaymentsSlice';
import loansReducer from './slices/loansSlice';
import loanRecordsReducer from './slices/loanRecordsSlice';
import tagsReducer from './slices/tagsSlice';
import exchangeRatesReducer from './slices/exchangeRatesSlice';
import settingsReducer from './slices/settingsSlice';
import uiReducer from './slices/uiSlice';
import recurringReducer from './slices/recurringSlice';

export const store = configureStore({
  reducer: {
    accounts: accountsReducer,
    categories: categoriesReducer,
    transactions: transactionsReducer,
    budgets: budgetsReducer,
    plannedPayments: plannedPaymentsReducer,
    loans: loansReducer,
    loanRecords: loanRecordsReducer,
    tags: tagsReducer,
    exchangeRates: exchangeRatesReducer,
    settings: settingsReducer,
    ui: uiReducer,
    recurring: recurringReducer,
  },
});
