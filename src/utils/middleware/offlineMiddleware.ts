import { Middleware } from 'redux';
import { getNetworkStatus, saveOfflineAction } from '../offlineSupport';
import { AppState } from '../store';
import { setNetworkStatus, markNeedsSync } from '../slices/uiSlice';

// 需要在离线时延迟处理的操作类型列表
const OFFLINE_QUEUE_ACTIONS = [
  'todos/addTodo',
  'todos/removeTodo',
  'todos/updateTodo',
  'todos/toggleTodoCompleted',
  'todos/toggleTodoImportant',
  'todos/toggleMyDay',
  'todos/updateTodoSteps',
  'todos/clearCompleted',
  'lists/addList',
  'lists/removeList',
  'lists/updateList',
];

// 总是在本地处理的操作，不需要同步的操作
const LOCAL_ONLY_ACTIONS = [
  'ui/',
  'app/',
  'navigation/',
];

/**
 * 离线支持中间件
 * 
 * - 跟踪网络连接状态
 * - 在离线时将操作保存到队列
 * - 允许在线/离线时的不同操作处理
 */
export const offlineMiddleware: Middleware<{}, AppState> = store => next => async action => {
  // 忽略非对象操作
  if (typeof action !== 'object' || action === null) {
    return next(action);
  }
  
  // 获取当前网络状态
  const networkStatus = getNetworkStatus();
  
  // 处理网络状态变更操作
  if (action.type === 'ui/setNetworkStatus') {
    return next(action);
  }
  
  // 更新应用程序的网络状态以匹配实际状态
  const currentNetworkStatus = store.getState().ui.networkStatus;
  if (networkStatus !== currentNetworkStatus) {
    store.dispatch(setNetworkStatus(networkStatus));
  }
  
  // 检查是否是需要在离线时队列的操作
  const shouldQueue = OFFLINE_QUEUE_ACTIONS.some(type => action.type === type);
  
  // 检查是否是本地专用操作
  const isLocalOnly = LOCAL_ONLY_ACTIONS.some(prefix => action.type.startsWith(prefix));
  
  // 如果不是本地专用操作且需要在离线时队列，且当前处于离线状态
  if (shouldQueue && !isLocalOnly && networkStatus === 'offline') {
    try {
      // 保存到离线队列
      await saveOfflineAction({
        type: action.type,
        payload: action.payload,
      });
      
      // 标记需要同步
      store.dispatch(markNeedsSync());
      
      // 仍然在本地应用操作，以便离线时UI可以正常工作
      return next(action);
    } catch (error) {
      console.error('无法将操作保存到离线队列', error);
      // 即使出错，仍尝试在本地应用操作
      return next(action);
    }
  }
  
  // 对于在线状态或不需要队列的操作，正常处理
  return next(action);
};

export default offlineMiddleware; 