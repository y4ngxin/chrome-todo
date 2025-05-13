import { 
  getOfflineQueue, 
  removeOfflineAction, 
  updateOfflineAction, 
  cleanupSyncedActions,
  getNetworkStatus
} from './offlineSupport';
import { OfflineAction } from './offlineSupport';

/**
 * 同步服务
 * 
 * 处理离线操作队列的同步
 */

// 同步操作的最大重试次数
const MAX_RETRY_COUNT = 3;

// 同步所有离线操作
export const syncOfflineActions = async (
  dispatch: (action: any) => void
): Promise<boolean> => {
  // 检查网络状态
  if (getNetworkStatus() !== 'online') {
    console.log('网络离线，无法同步');
    return false;
  }
  
  try {
    // 获取离线操作队列
    const queue = await getOfflineQueue();
    
    if (queue.length === 0) {
      // 没有需要同步的操作
      dispatch({ type: 'ui/syncComplete' });
      return true;
    }
    
    console.log(`发现 ${queue.length} 个操作需要同步`);
    
    // 先按时间戳排序
    const sortedQueue = [...queue].sort((a, b) => a.timestamp - b.timestamp);
    
    // 逐个处理队列中的操作
    for (const action of sortedQueue) {
      try {
        if (action.syncStatus === 'synced') {
          // 已同步的操作跳过
          continue;
        }
        
        if (action.syncStatus === 'failed' && action.retryCount >= MAX_RETRY_COUNT) {
          // 已达到最大重试次数，标记失败并跳过
          console.warn(`操作 ${action.id} 已达到最大重试次数，跳过`);
          continue;
        }
        
        // 重新派发操作到Store
        dispatch({
          type: action.type,
          payload: action.payload,
          meta: { fromSync: true } // 标记此操作来自同步，防止中间件将其再次加入队列
        });
        
        // 标记为已同步
        await updateOfflineAction(action.id, {
          syncStatus: 'synced'
        });
        
      } catch (error) {
        console.error(`同步操作 ${action.id} 失败:`, error);
        
        // 更新失败状态和重试计数
        await updateOfflineAction(action.id, {
          syncStatus: 'failed',
          retryCount: action.retryCount + 1
        });
      }
    }
    
    // 清理已同步的操作
    await cleanupSyncedActions();
    
    // 检查是否还有未同步的操作
    const remainingQueue = await getOfflineQueue();
    const hasFailedSyncs = remainingQueue.some(action => action.syncStatus === 'failed');
    
    if (hasFailedSyncs) {
      dispatch({ type: 'ui/syncFailed' });
      return false;
    } else {
      dispatch({ type: 'ui/syncComplete' });
      return true;
    }
    
  } catch (error) {
    console.error('同步过程中出错:', error);
    dispatch({ type: 'ui/syncFailed' });
    return false;
  }
};

// 检查并同步（如果需要）
export const checkAndSync = async (
  dispatch: (action: any) => void,
  getState: () => { ui: { needsSync: boolean, networkStatus: string } }
): Promise<void> => {
  const state = getState();
  
  // 如果需要同步且当前在线
  if (state.ui.needsSync && state.ui.networkStatus === 'online') {
    await syncOfflineActions(dispatch);
  }
};

// 设置定期同步
export const setupPeriodicSync = (
  dispatch: (action: any) => void,
  getState: () => { ui: { needsSync: boolean, networkStatus: string } },
  interval = 30000
): () => void => {
  const intervalId = setInterval(() => checkAndSync(dispatch, getState), interval);
  
  // 返回清理函数
  return () => clearInterval(intervalId);
}; 