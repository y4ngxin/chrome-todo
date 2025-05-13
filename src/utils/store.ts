import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux';
import todosReducer from './slices/todosSlice';
import listsReducer from './slices/listsSlice';
import uiReducer from './slices/uiSlice';
import tagsReducer from './slices/tagsSlice';
import syncStorageMiddleware from './middleware/syncStorage';
import offlineMiddleware from './middleware/offlineMiddleware';

// 创建reducer对象
const rootReducer = {
  todos: todosReducer,
  lists: listsReducer,
  ui: uiReducer,
  tags: tagsReducer
};

// 配置store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(syncStorageMiddleware, offlineMiddleware),
});

// 导出类型
export type RootState = ReturnType<typeof store.getState>;
export type AppState = RootState;
export type AppDispatch = typeof store.dispatch;

// 自定义hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store; 