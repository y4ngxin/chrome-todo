/**
 * 离线支持工具
 * 
 * 提供离线状态管理、数据同步和本地存储的工具函数
 */

// 定义网络状态类型
export type NetworkStatus = 'online' | 'offline' | 'reconnecting';

// 离线数据队列接口
export interface OfflineAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  syncStatus: 'pending' | 'synced' | 'failed';
  retryCount: number;
}

// 获取当前网络状态
export const getNetworkStatus = (): NetworkStatus => {
  return navigator.onLine ? 'online' : 'offline';
};

// 监听网络状态变化
export const listenToNetworkChanges = (
  onOnline: () => void,
  onOffline: () => void
): () => void => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  // 返回清理函数
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};

// 保存离线操作到队列
export const saveOfflineAction = async (action: Omit<OfflineAction, 'id' | 'timestamp' | 'syncStatus' | 'retryCount'>): Promise<string> => {
  try {
    // 生成唯一ID
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    
    // 获取现有队列
    const existingQueue = await getOfflineQueue();
    
    // 创建新的操作记录
    const offlineAction: OfflineAction = {
      id,
      ...action,
      timestamp: Date.now(),
      syncStatus: 'pending',
      retryCount: 0
    };
    
    // 添加到队列并保存
    const updatedQueue = [...existingQueue, offlineAction];
    await saveOfflineQueue(updatedQueue);
    
    return id;
  } catch (error) {
    console.error('无法保存离线操作:', error);
    throw error;
  }
};

// 获取离线操作队列
export const getOfflineQueue = async (): Promise<OfflineAction[]> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['offlineQueue'], (result) => {
      resolve(result.offlineQueue || []);
    });
  });
};

// 保存离线操作队列
export const saveOfflineQueue = async (queue: OfflineAction[]): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ offlineQueue: queue }, () => {
      resolve();
    });
  });
};

// 更新离线操作状态
export const updateOfflineAction = async (
  id: string,
  update: Partial<OfflineAction>
): Promise<void> => {
  const queue = await getOfflineQueue();
  const updatedQueue = queue.map((action) => 
    action.id === id ? { ...action, ...update } : action
  );
  
  await saveOfflineQueue(updatedQueue);
};

// 删除已同步的操作
export const removeOfflineAction = async (id: string): Promise<void> => {
  const queue = await getOfflineQueue();
  const updatedQueue = queue.filter((action) => action.id !== id);
  
  await saveOfflineQueue(updatedQueue);
};

// 清理已成功同步的操作
export const cleanupSyncedActions = async (): Promise<void> => {
  const queue = await getOfflineQueue();
  const updatedQueue = queue.filter((action) => action.syncStatus !== 'synced');
  
  await saveOfflineQueue(updatedQueue);
};

// 将所有离线操作标记为失败
export const markAllAsFailed = async (): Promise<void> => {
  const queue = await getOfflineQueue();
  
  if (queue.length === 0) return;
  
  const updatedQueue = queue.map((action) => ({
    ...action,
    syncStatus: 'failed' as const
  }));
  
  await saveOfflineQueue(updatedQueue);
};

// 创建本地存储备份
export const createStorageBackup = async (): Promise<void> => {
  // 获取所有存储数据
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (data) => {
      // 过滤掉offlineQueue字段，避免循环
      const { offlineQueue, ...restData } = data;
      
      // 保存数据备份
      chrome.storage.local.set({ 
        storageBackup: {
          ...restData,
          backupTimestamp: Date.now()
        }
      }, () => {
        resolve();
      });
    });
  });
};

// 从备份恢复数据
export const restoreFromBackup = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['storageBackup'], (result) => {
      if (!result.storageBackup) {
        resolve(false);
        return;
      }
      
      const { backupTimestamp, ...backupData } = result.storageBackup;
      
      // 检查备份是否太旧（超过7天）
      const isBackupTooOld = Date.now() - backupTimestamp > 7 * 24 * 60 * 60 * 1000;
      
      if (isBackupTooOld) {
        resolve(false);
        return;
      }
      
      // 恢复数据
      chrome.storage.local.set(backupData, () => {
        resolve(true);
      });
    });
  });
};

// 检查存储健康状态
export const checkStorageHealth = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['todos', 'lists', 'settings'], (result) => {
      const hasTodos = Array.isArray(result.todos);
      const hasLists = Array.isArray(result.lists);
      const hasSettings = typeof result.settings === 'object' && result.settings !== null;
      
      resolve(hasTodos && hasLists && hasSettings);
    });
  });
};

// 优化存储空间
export const optimizeStorage = async (): Promise<void> => {
  // 清理过期的备份
  chrome.storage.local.get(['storageBackup'], (result) => {
    if (result.storageBackup && result.storageBackup.backupTimestamp) {
      const isBackupTooOld = Date.now() - result.storageBackup.backupTimestamp > 14 * 24 * 60 * 60 * 1000;
      
      if (isBackupTooOld) {
        chrome.storage.local.remove(['storageBackup']);
      }
    }
  });
  
  // 清理已同步的操作
  await cleanupSyncedActions();
}; 