import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as categoryRepo from '@/db/repositories/categoryRepository';

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  () => categoryRepo.getAllCategories()
);

export const addCategory = createAsyncThunk(
  'categories/add',
  async (category, { dispatch }) => {
    await categoryRepo.createCategory(category);
    dispatch(fetchCategories());
  }
);

export const editCategory = createAsyncThunk(
  'categories/edit',
  async ({ id, changes }, { dispatch }) => {
    await categoryRepo.updateCategory(id, changes);
    dispatch(fetchCategories());
  }
);

export const removeCategory = createAsyncThunk(
  'categories/remove',
  async (id, { dispatch }) => {
    await categoryRepo.deleteCategory(id);
    dispatch(fetchCategories());
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: { items: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default categoriesSlice.reducer;
