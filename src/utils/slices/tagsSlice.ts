import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as storageService from '../storage';
import { v4 as uuidv4 } from 'uuid';

export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt?: string;
}

interface TagsState {
  items: Tag[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TagsState = {
  items: [],
  status: 'idle',
  error: null,
};

// 异步 Thunks
export const fetchTags = createAsyncThunk(
  'tags/fetchTags',
  async () => {
    const tags = await storageService.getTags();
    return tags;
  }
);

export const saveTags = createAsyncThunk(
  'tags/saveTags',
  async (tags: Tag[]) => {
    await storageService.setTags(tags);
    return tags;
  }
);

export const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    addTag: (state, action: PayloadAction<{ name: string; color?: string }>) => {
      const { name, color } = action.payload;
      const now = new Date().toISOString();
      // 检查是否已存在同名标签
      if (!state.items.some(tag => tag.name.toLowerCase() === name.toLowerCase())) {
        const newTag: Tag = {
          id: uuidv4(),
          name,
          color,
          createdAt: now,
          updatedAt: now
        };
        state.items.push(newTag);
      }
    },
    removeTag: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(tag => tag.id !== action.payload);
    },
    updateTag: (state, action: PayloadAction<{ id: string; updates: Partial<Tag> }>) => {
      const { id, updates } = action.payload;
      const tag = state.items.find(tag => tag.id === id);
      if (tag) {
        Object.assign(tag, { ...updates, updatedAt: new Date().toISOString() });
      }
    },
    setTags: (state, action: PayloadAction<Tag[]>) => {
      state.items = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTags.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || '获取标签失败';
      })
      .addCase(saveTags.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(saveTags.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(saveTags.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || '保存标签失败';
      });
  }
});

export const { addTag, removeTag, updateTag, setTags } = tagsSlice.actions;

export default tagsSlice.reducer; 