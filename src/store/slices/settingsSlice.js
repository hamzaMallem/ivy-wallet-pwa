import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as settingsRepo from '@/db/repositories/settingsRepository';

export const fetchSettings = createAsyncThunk(
  'settings/fetch',
  () => settingsRepo.getSettings()
);

export const updateSettings = createAsyncThunk(
  'settings/update',
  async (changes, { dispatch }) => {
    await settingsRepo.updateSettings(changes);
    dispatch(fetchSettings());
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    data: {
      baseCurrency: 'MAD',
      theme: 'light',
      name: '',
      bufferAmount: 0,
      showNotifications: true,
      hideCurrentBalance: false,
      hideIncome: false,
      startDayOfMonth: 1,
      treatTransfersAsIncomeExpense: false,
      onboardingCompleted: false,
    },
    status: 'idle',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSettings.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.data = action.payload;
    });
  },
});

export default settingsSlice.reducer;
