import { Middleware } from 'redux';
import * as storageService from '../storage';

/**
 * 同步存储中间件
 * 
 * 这个中间件监听特定的Redux动作，并将状态同步到Chrome存储
 */
const syncStorageMiddleware: Middleware = store => next => action => {
  // 获取执行前的状态
  const stateBefore = store.getState();
  
  // 执行动作
  const result = next(action);
  
  // 获取执行后的状态
  const stateAfter = store.getState();

  try {
    // 特别处理拖拽排序操作
    if (action.type === 'todos/reorderTodos') {
      console.log('正在同步排序后的待办事项到存储...');
      // 直接使用异步函数确保保存成功
      setTimeout(async () => {
        try {
          await storageService.setTodos(stateAfter.todos.items);
          console.log('排序后的数据同步成功');
        } catch (error) {
          console.error('排序后数据同步失败:', error);
        }
      }, 0);
      return result;
    }
    
    // 根据不同类型的动作，执行相应的存储同步
    if (
      action.type.startsWith('todos/') && 
      !action.type.includes('fetch') &&
      !action.type.includes('save')
    ) {
      // 同步待办事项
      console.log('同步待办事项到存储...', action.type);
      storageService.setTodos(stateAfter.todos.items)
        .catch(err => console.error('同步待办事项失败:', err));
    }
    
    if (
      action.type.startsWith('lists/') &&
      !action.type.includes('fetch') &&
      !action.type.includes('save')
    ) {
      // 同步列表数据
      console.log('同步列表数据到存储...', action.type);
      storageService.setLists(stateAfter.lists.items)
        .catch(err => console.error('同步列表数据失败:', err));
    }
    
    if (
      action.type.startsWith('ui/') &&
      !action.type.includes('fetch') &&
      !action.type.includes('save')
    ) {
      // 同步UI设置
      console.log('同步UI设置到存储...', action.type);
      storageService.setSettings({
        theme: stateAfter.ui.theme,
        sidebarWidth: stateAfter.ui.sidebarWidth,
        currentView: stateAfter.ui.currentView,
        weekViewDate: stateAfter.ui.weekViewDate
      }).catch(err => console.error('同步UI设置失败:', err));
    }
  } catch (error) {
    console.error('同步数据到Chrome存储时出错:', error);
  }

  return result;
};

export default syncStorageMiddleware; 