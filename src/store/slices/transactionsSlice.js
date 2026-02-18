import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as txRepo from '@/db/repositories/transactionRepository';

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  () => txRepo.getAllTransactions()
);

export const fetchTransactionsByDateRange = createAsyncThunk(
  'transactions/fetchByDateRange',
  ({ from, to }) => txRepo.getByDateRange(from, to)
);

export const addTransaction = createAsyncThunk(
  'transactions/add',
  async (transaction, { dispatch }) => {
    await txRepo.createTransaction(transaction);
    dispatch(fetchTransactions());
  }
);

export const editTransaction = createAsyncThunk(
  'transactions/edit',
  async ({ id, changes }, { dispatch }) => {
    await txRepo.updateTransaction(id, changes);
    dispatch(fetchTransactions());
  }
);

export const removeTransaction = createAsyncThunk(
  'transactions/remove',
  async (id, { dispatch }) => {
    await txRepo.deleteTransaction(id);
    dispatch(fetchTransactions());
  }
);

export const searchTransactions = createAsyncThunk(
  'transactions/search',
  (query) => txRepo.searchTransactions(query)
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState: { items: [], searchResults: [], status: 'idle' },
  reducers: {
    clearSearch: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(fetchTransactionsByDateRange.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(searchTransactions.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      });
  },
});

export const { clearSearch } = transactionsSlice.actions;
export default transactionsSlice.reducer;
