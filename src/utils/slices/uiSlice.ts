import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as storageService from '../storage';
import { startOfWeek, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  sidebarWidth: 'normal' | 'collapsed';
  currentView: 'myDay' | 'important' | 'planned' | 'list' | 'week';
  backgroundImage?: string;
  weekViewDate: string; // ISO格式的日期字符串，用于确定当前显示的周
}

const initialState: UIState = {
  theme: 'light',
  sidebarOpen: true,
  sidebarWidth: 'normal',
  currentView: 'myDay',
  weekViewDate: format(new Date(), 'yyyy-MM-dd') // 默认为今天
};

// 异步 Thunks
export const fetchSettings = createAsyncThunk(
  'ui/fetchSettings',
  async () => {
    const settings = await storageService.getSettings();
    return settings;
  }
);

export const saveSettings = createAsyncThunk(
  'ui/saveSettings',
  async (settings: { theme: 'light' | 'dark'; sidebarWidth: 'normal' | 'collapsed' }) => {
    await storageService.setSettings(settings);
    return settings;
  }
);

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleSidebarWidth: (state) => {
      state.sidebarWidth = state.sidebarWidth === 'normal' ? 'collapsed' : 'normal';
    },
    setSidebarWidth: (state, action: PayloadAction<'normal' | 'collapsed'>) => {
      state.sidebarWidth = action.payload;
    },
    setCurrentView: (state, action: PayloadAction<UIState['currentView']>) => {
      state.currentView = action.payload;
    },
    setBackgroundImage: (state, action: PayloadAction<string | undefined>) => {
      state.backgroundImage = action.payload;
    },
    // 新增的周视图相关操作
    setWeekViewDate: (state, action: PayloadAction<string>) => {
      state.weekViewDate = action.payload;
    },
    nextWeek: (state) => {
      // 将当前周视图日期加7天
      const currentDate = new Date(state.weekViewDate);
      currentDate.setDate(currentDate.getDate() + 7);
      state.weekViewDate = format(currentDate, 'yyyy-MM-dd');
    },
    previousWeek: (state) => {
      // 将当前周视图日期减7天
      const currentDate = new Date(state.weekViewDate);
      currentDate.setDate(currentDate.getDate() - 7);
      state.weekViewDate = format(currentDate, 'yyyy-MM-dd');
    },
    goToCurrentWeek: (state) => {
      // 回到当前周
      state.weekViewDate = format(new Date(), 'yyyy-MM-dd');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.fulfilled, (state, action) => {
        if (action.payload) {
          state.theme = action.payload.theme;
          state.sidebarWidth = action.payload.sidebarWidth;
        }
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        // 保存成功后不需要更新状态
      });
  },
});

export const { 
  toggleTheme, 
  setTheme, 
  toggleSidebar, 
  toggleSidebarWidth,
  setSidebarWidth,
  setCurrentView,
  setBackgroundImage,
  setWeekViewDate,
  nextWeek,
  previousWeek,
  goToCurrentWeek
} = uiSlice.actions;

export default uiSlice.reducer; 