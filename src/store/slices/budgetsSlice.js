import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as budgetRepo from '@/db/repositories/budgetRepository';

export const fetchBudgets = createAsyncThunk(
  'budgets/fetchAll',
  () => budgetRepo.getAllBudgets()
);

export const addBudget = createAsyncThunk(
  'budgets/add',
  async (budget, { dispatch }) => {
    await budgetRepo.createBudget(budget);
    dispatch(fetchBudgets());
  }
);

export const editBudget = createAsyncThunk(
  'budgets/edit',
  async ({ id, changes }, { dispatch }) => {
    await budgetRepo.updateBudget(id, changes);
    dispatch(fetchBudgets());
  }
);

export const removeBudget = createAsyncThunk(
  'budgets/remove',
  async (id, { dispatch }) => {
    await budgetRepo.deleteBudget(id);
    dispatch(fetchBudgets());
  }
);

const budgetsSlice = createSlice({
  name: 'budgets',
  initialState: { items: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      });
  },
});

export default budgetsSlice.reducer;
