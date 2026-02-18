import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as lrRepo from '@/db/repositories/loanRecordRepository';

export const fetchLoanRecords = createAsyncThunk(
  'loanRecords/fetchAll',
  () => lrRepo.getAllLoanRecords()
);

export const fetchLoanRecordsByLoanId = createAsyncThunk(
  'loanRecords/fetchByLoanId',
  (loanId) => lrRepo.getByLoanId(loanId)
);

export const addLoanRecord = createAsyncThunk(
  'loanRecords/add',
  async (record, { dispatch }) => {
    await lrRepo.createLoanRecord(record);
    dispatch(fetchLoanRecords());
  }
);

export const editLoanRecord = createAsyncThunk(
  'loanRecords/edit',
  async ({ id, changes }, { dispatch }) => {
    await lrRepo.updateLoanRecord(id, changes);
    dispatch(fetchLoanRecords());
  }
);

export const removeLoanRecord = createAsyncThunk(
  'loanRecords/remove',
  async (id, { dispatch }) => {
    await lrRepo.deleteLoanRecord(id);
    dispatch(fetchLoanRecords());
  }
);

const loanRecordsSlice = createSlice({
  name: 'loanRecords',
  initialState: { items: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchLoanRecords.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.items = action.payload;
    });
  },
});

export default loanRecordsSlice.reducer;
