import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as ppRepo from '@/db/repositories/plannedPaymentRepository';

export const fetchPlannedPayments = createAsyncThunk(
  'plannedPayments/fetchAll',
  () => ppRepo.getAllPlannedPayments()
);

export const addPlannedPayment = createAsyncThunk(
  'plannedPayments/add',
  async (payment, { dispatch }) => {
    await ppRepo.createPlannedPayment(payment);
    dispatch(fetchPlannedPayments());
  }
);

export const editPlannedPayment = createAsyncThunk(
  'plannedPayments/edit',
  async ({ id, changes }, { dispatch }) => {
    await ppRepo.updatePlannedPayment(id, changes);
    dispatch(fetchPlannedPayments());
  }
);

export const removePlannedPayment = createAsyncThunk(
  'plannedPayments/remove',
  async (id, { dispatch }) => {
    await ppRepo.deletePlannedPayment(id);
    dispatch(fetchPlannedPayments());
  }
);

const plannedPaymentsSlice = createSlice({
  name: 'plannedPayments',
  initialState: { items: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchPlannedPayments.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.items = action.payload;
    });
  },
});

export default plannedPaymentsSlice.reducer;
