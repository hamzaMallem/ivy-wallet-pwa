import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { processRecurringTransactions } from '@/services/recurringTransactionService';
import * as historyRepo from '@/db/repositories/recurringHistoryRepository';
import { fetchTransactions } from './transactionsSlice';

/**
 * Process recurring payments and create due transactions
 */
export const processRecurring = createAsyncThunk(
  'recurring/process',
  async (_, { dispatch }) => {
    const created = await processRecurringTransactions();

    // Refresh transactions to show newly created ones
    if (created.length > 0) {
      dispatch(fetchTransactions());
    }

    return created;
  }
);

/**
 * Fetch all recurring history records
 */
export const fetchRecurringHistory = createAsyncThunk(
  'recurring/fetchHistory',
  () => historyRepo.getAllRecurringHistory()
);

const recurringSlice = createSlice({
  name: 'recurring',
  initialState: {
    lastProcessed: null,
    recentlyCreated: [],
    processing: false,
    history: [],
    status: 'idle',
  },
  reducers: {
    clearRecentlyCreated: (state) => {
      state.recentlyCreated = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(processRecurring.pending, (state) => {
        state.processing = true;
      })
      .addCase(processRecurring.fulfilled, (state, action) => {
        state.processing = false;
        state.lastProcessed = new Date().toISOString();
        state.recentlyCreated = action.payload;
      })
      .addCase(processRecurring.rejected, (state, action) => {
        state.processing = false;
        console.error('Failed to process recurring transactions:', action.error);
      })
      .addCase(fetchRecurringHistory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRecurringHistory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.history = action.payload;
      })
      .addCase(fetchRecurringHistory.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export const { clearRecentlyCreated } = recurringSlice.actions;
export default recurringSlice.reducer;
