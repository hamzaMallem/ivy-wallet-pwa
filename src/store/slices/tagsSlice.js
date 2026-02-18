import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as tagRepo from '@/db/repositories/tagRepository';

export const fetchTags = createAsyncThunk(
  'tags/fetchAll',
  () => tagRepo.getAllTags()
);

export const addTag = createAsyncThunk(
  'tags/add',
  async (tag, { dispatch }) => {
    await tagRepo.createTag(tag);
    dispatch(fetchTags());
  }
);

export const editTag = createAsyncThunk(
  'tags/edit',
  async ({ id, changes }, { dispatch }) => {
    await tagRepo.updateTag(id, changes);
    dispatch(fetchTags());
  }
);

export const removeTag = createAsyncThunk(
  'tags/remove',
  async (id, { dispatch }) => {
    await tagRepo.deleteTag(id);
    dispatch(fetchTags());
  }
);

const tagsSlice = createSlice({
  name: 'tags',
  initialState: { items: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTags.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.items = action.payload;
    });
  },
});

export default tagsSlice.reducer;
