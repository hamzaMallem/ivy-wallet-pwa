import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as loanRepo from '@/db/repositories/loanRepository';

export const fetchLoans = createAsyncThunk(
  'loans/fetchAll',
  () => loanRepo.getAllLoans()
);

export const addLoan = createAsyncThunk(
  'loans/add',
  async (loan, { dispatch }) => {
    await loanRepo.createLoan(loan);
    dispatch(fetchLoans());
  }
);

export const editLoan = createAsyncThunk(
  'loans/edit',
  async ({ id, changes }, { dispatch }) => {
    await loanRepo.updateLoan(id, changes);
    dispatch(fetchLoans());
  }
);

export const removeLoan = createAsyncThunk(
  'loans/remove',
  async (id, { dispatch }) => {
    await loanRepo.deleteLoan(id);
    dispatch(fetchLoans());
  }
);

const loansSlice = createSlice({
  name: 'loans',
  initialState: { items: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchLoans.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.items = action.payload;
    });
  },
});

export default loansSlice.reducer;
