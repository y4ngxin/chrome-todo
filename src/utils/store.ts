import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import todoReducer from './slices/todosSlice';
import listReducer from './slices/listsSlice';
import uiReducer from './slices/uiSlice';
import syncStorageMiddleware from './middleware/syncStorage';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

const reducer = {
  todos: todoReducer,
  lists: listReducer,
  ui: uiReducer,
};

// 创建store
export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(syncStorageMiddleware)
});

// 从store推断类型
export type AppDispatch = typeof store.dispatch;
export type AppState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action<string>
>;

// 使用TypedDispatch而不是普通dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector; 