import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { defaultLists } from '../initialData';
import * as storageService from '../storage';

export interface TodoList {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  createdAt: string;
  isDefault?: boolean;
}

interface ListsState {
  items: TodoList[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  activeListId: string | null;
}

const initialState: ListsState = {
  items: [],
  status: 'idle',
  error: null,
  activeListId: null,
};

// 异步 Thunks
export const fetchLists = createAsyncThunk(
  'lists/fetchLists',
  async () => {
    const lists = await storageService.getLists();
    return lists.length > 0 ? lists : defaultLists;
  }
);

export const saveLists = createAsyncThunk(
  'lists/saveLists',
  async (lists: TodoList[]) => {
    await storageService.setLists(lists);
    return lists;
  }
);

export const listsSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {
    addList: (state, action: PayloadAction<TodoList>) => {
      state.items.push(action.payload);
    },
    removeList: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(list => list.id !== action.payload);
    },
    updateList: (state, action: PayloadAction<Partial<TodoList> & { id: string }>) => {
      const index = state.items.findIndex(list => list.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
    setActiveList: (state, action: PayloadAction<string>) => {
      state.activeListId = action.payload;
    },
    setLists: (state, action: PayloadAction<TodoList[]>) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLists.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLists.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchLists.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || '获取列表失败';
      })
      .addCase(saveLists.fulfilled, (state, action) => {
        // 保存成功后不需要更新状态
      });
  },
});

export const { addList, removeList, updateList, setActiveList, setLists } = listsSlice.actions;

export default listsSlice.reducer; 