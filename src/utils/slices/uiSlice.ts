import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as storageService from '../storage';
import { startOfWeek, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { NetworkStatus, getNetworkStatus } from '../offlineSupport';

// 番茄钟相关类型
export interface PomodoroSettings {
  workDuration: number; // 工作时长（分钟）
  shortBreakDuration: number; // 短休息时长（分钟）
  longBreakDuration: number; // 长休息时长（分钟）
  longBreakInterval: number; // 几个工作周期后进行长休息
  autoStartBreaks: boolean; // 是否自动开始休息
  autoStartPomodoros: boolean; // 是否自动开始下一个番茄钟
  alarmSound: string; // 提醒声音
  alarmVolume: number; // 提醒音量
}

export interface PomodoroState {
  isActive: boolean; // 是否正在计时
  mode: 'work' | 'shortBreak' | 'longBreak'; // 当前模式
  timeLeft: number; // 剩余时间（秒）
  totalTime: number; // 总时间（秒）
  completedPomodoros: number; // 已完成的番茄钟数量
  startTime: number | null; // 开始时间戳
  settings: PomodoroSettings; // 设置
  currentTodoId: string | null; // 当前关联的任务ID
}

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  sidebarWidth: 'normal' | 'collapsed';
  currentView: 'myDay' | 'important' | 'planned' | 'list' | 'week';
  backgroundImage?: string;
  weekViewDate: string; // ISO格式的日期字符串，用于确定当前显示的周
  pomodoro: PomodoroState; // 番茄钟状态
  networkStatus: NetworkStatus; // 网络状态
  syncStatus: 'synced' | 'syncing' | 'error'; // 同步状态
  needsSync: boolean; // 是否需要同步
  lastSynced: number | null; // 上次同步时间
}

// 默认番茄钟设置
const defaultPomodoroSettings: PomodoroSettings = {
  workDuration: 25, // 默认25分钟工作
  shortBreakDuration: 5, // 默认5分钟短休息
  longBreakDuration: 15, // 默认15分钟长休息
  longBreakInterval: 4, // 默认每4个番茄钟后进行长休息
  autoStartBreaks: false, // 默认不自动开始休息
  autoStartPomodoros: false, // 默认不自动开始下一个番茄钟
  alarmSound: 'default', // 默认提醒声音
  alarmVolume: 80 // 默认音量
};

const initialState: UIState = {
  theme: 'light',
  sidebarOpen: true,
  sidebarWidth: 'normal',
  currentView: 'myDay',
  weekViewDate: format(new Date(), 'yyyy-MM-dd'), // 默认为今天
  pomodoro: {
    isActive: false,
    mode: 'work',
    timeLeft: defaultPomodoroSettings.workDuration * 60, // 转换为秒
    totalTime: defaultPomodoroSettings.workDuration * 60, // 转换为秒
    completedPomodoros: 0,
    startTime: null,
    settings: defaultPomodoroSettings,
    currentTodoId: null
  },
  networkStatus: getNetworkStatus(), // 初始化为当前网络状态
  syncStatus: 'synced',
  needsSync: false,
  lastSynced: null
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
  async (settings: { 
    theme: 'light' | 'dark'; 
    sidebarWidth: 'normal' | 'collapsed';
    pomodoroSettings?: PomodoroSettings
  }) => {
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
    },
    
    // 番茄钟相关操作
    startPomodoro: (state, action: PayloadAction<string | null>) => {
      // 开始一个番茄钟，可以关联到特定任务
      state.pomodoro.isActive = true;
      state.pomodoro.startTime = Date.now();
      state.pomodoro.currentTodoId = action.payload;
    },
    pausePomodoro: (state) => {
      // 暂停番茄钟
      state.pomodoro.isActive = false;
    },
    resumePomodoro: (state) => {
      // 恢复番茄钟
      state.pomodoro.isActive = true;
      state.pomodoro.startTime = Date.now();
    },
    resetPomodoro: (state) => {
      // 重置番茄钟
      const duration = state.pomodoro.mode === 'work'
        ? state.pomodoro.settings.workDuration
        : state.pomodoro.mode === 'shortBreak'
          ? state.pomodoro.settings.shortBreakDuration
          : state.pomodoro.settings.longBreakDuration;
      
      state.pomodoro.isActive = false;
      state.pomodoro.timeLeft = duration * 60;
      state.pomodoro.totalTime = duration * 60;
      state.pomodoro.startTime = null;
    },
    updateTimeLeft: (state, action: PayloadAction<number>) => {
      // 更新剩余时间（秒）
      state.pomodoro.timeLeft = action.payload;
    },
    completePomodoro: (state) => {
      // 完成一个番茄钟
      state.pomodoro.completedPomodoros += 1;
      state.pomodoro.isActive = false;
      
      // 确定下一个模式
      if (state.pomodoro.mode === 'work') {
        // 如果刚完成工作周期，检查是否应该进入长休息
        const shouldTakeLongBreak = 
          state.pomodoro.completedPomodoros % state.pomodoro.settings.longBreakInterval === 0;
        
        state.pomodoro.mode = shouldTakeLongBreak ? 'longBreak' : 'shortBreak';
        state.pomodoro.timeLeft = shouldTakeLongBreak 
          ? state.pomodoro.settings.longBreakDuration * 60 
          : state.pomodoro.settings.shortBreakDuration * 60;
        state.pomodoro.totalTime = state.pomodoro.timeLeft;
      } else {
        // 如果刚完成休息周期，回到工作模式
        state.pomodoro.mode = 'work';
        state.pomodoro.timeLeft = state.pomodoro.settings.workDuration * 60;
        state.pomodoro.totalTime = state.pomodoro.timeLeft;
      }
      
      // 自动开始下一个周期（如果设置了）
      if (
        (state.pomodoro.mode === 'work' && state.pomodoro.settings.autoStartPomodoros) ||
        (state.pomodoro.mode !== 'work' && state.pomodoro.settings.autoStartBreaks)
      ) {
        state.pomodoro.isActive = true;
        state.pomodoro.startTime = Date.now();
      }
    },
    setPomodoroSettings: (state, action: PayloadAction<Partial<PomodoroSettings>>) => {
      // 更新番茄钟设置
      state.pomodoro.settings = {
        ...state.pomodoro.settings,
        ...action.payload
      };
      
      // 如果当前没有活动的番茄钟，则更新当前时间
      if (!state.pomodoro.isActive) {
        const duration = state.pomodoro.mode === 'work'
          ? state.pomodoro.settings.workDuration
          : state.pomodoro.mode === 'shortBreak'
            ? state.pomodoro.settings.shortBreakDuration
            : state.pomodoro.settings.longBreakDuration;
        
        state.pomodoro.timeLeft = duration * 60;
        state.pomodoro.totalTime = duration * 60;
      }
    },
    
    // 网络状态相关操作
    setNetworkStatus: (state, action: PayloadAction<NetworkStatus>) => {
      state.networkStatus = action.payload;
      
      // 如果刚刚重新连接到网络，且有未同步的数据，则标记需要同步
      if (action.payload === 'online' && state.networkStatus === 'offline') {
        state.needsSync = true;
      }
    },
    setSyncStatus: (state, action: PayloadAction<UIState['syncStatus']>) => {
      state.syncStatus = action.payload;
      
      // 如果同步成功，更新最后同步时间并重置同步标志
      if (action.payload === 'synced') {
        state.lastSynced = Date.now();
        state.needsSync = false;
      }
    },
    syncComplete: (state) => {
      state.syncStatus = 'synced';
      state.lastSynced = Date.now();
      state.needsSync = false;
    },
    syncFailed: (state) => {
      state.syncStatus = 'error';
      // 保持 needsSync 为 true，以便稍后重试
    },
    markNeedsSync: (state) => {
      state.needsSync = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.fulfilled, (state, action) => {
        if (action.payload) {
          state.theme = action.payload.theme;
          state.sidebarWidth = action.payload.sidebarWidth;
          
          // 如果有番茄钟设置，也更新
          if (action.payload.pomodoroSettings) {
            state.pomodoro.settings = {
              ...state.pomodoro.settings,
              ...action.payload.pomodoroSettings
            };
          }
          
          // 更新视图设置
          if (action.payload.currentView) {
            state.currentView = action.payload.currentView;
          }
          
          if (action.payload.weekViewDate) {
            state.weekViewDate = action.payload.weekViewDate;
          }
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
  goToCurrentWeek,
  // 番茄钟相关操作
  startPomodoro,
  pausePomodoro,
  resumePomodoro,
  resetPomodoro,
  updateTimeLeft,
  completePomodoro,
  setPomodoroSettings,
  // 网络状态相关操作
  setNetworkStatus,
  setSyncStatus,
  syncComplete,
  syncFailed,
  markNeedsSync
} = uiSlice.actions;

export default uiSlice.reducer; 