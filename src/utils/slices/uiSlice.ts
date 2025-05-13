import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as storageService from '../storage';

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  sidebarWidth: 'normal' | 'collapsed';
  currentView: 'myDay' | 'important' | 'planned' | 'list';
  backgroundImage?: string;
}

const initialState: UIState = {
  theme: 'light',
  sidebarOpen: true,
  sidebarWidth: 'normal',
  currentView: 'myDay',
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
  setBackgroundImage
} = uiSlice.actions;

export default uiSlice.reducer; 