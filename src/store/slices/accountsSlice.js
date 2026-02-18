import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as accountRepo from '@/db/repositories/accountRepository';

export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAll',
  () => accountRepo.getAllAccounts()
);

export const addAccount = createAsyncThunk(
  'accounts/add',
  async (account, { dispatch }) => {
    await accountRepo.createAccount(account);
    dispatch(fetchAccounts());
  }
);

export const editAccount = createAsyncThunk(
  'accounts/edit',
  async ({ id, changes }, { dispatch }) => {
    await accountRepo.updateAccount(id, changes);
    dispatch(fetchAccounts());
  }
);

export const removeAccount = createAsyncThunk(
  'accounts/remove',
  async (id, { dispatch }) => {
    await accountRepo.deleteAccount(id);
    dispatch(fetchAccounts());
  }
);

export const reorderAccounts = createAsyncThunk(
  'accounts/reorder',
  async (orderedIds, { dispatch }) => {
    await accountRepo.reorderAccounts(orderedIds);
    dispatch(fetchAccounts());
  }
);

const accountsSlice = createSlice({
  name: 'accounts',
  initialState: { items: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default accountsSlice.reducer;
