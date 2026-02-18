import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as rateRepo from '@/db/repositories/exchangeRateRepository';

export const fetchExchangeRates = createAsyncThunk(
  'exchangeRates/fetchAll',
  () => rateRepo.getAllRates()
);

export const setExchangeRate = createAsyncThunk(
  'exchangeRates/set',
  async ({ baseCurrency, currency, rate, manualOverride }, { dispatch }) => {
    await rateRepo.setRate(baseCurrency, currency, rate, manualOverride);
    dispatch(fetchExchangeRates());
  }
);

const exchangeRatesSlice = createSlice({
  name: 'exchangeRates',
  initialState: { items: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchExchangeRates.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.items = action.payload;
    });
  },
});

export default exchangeRatesSlice.reducer;
