import { Middleware } from 'redux';
import * as storageService from '../storage';

/**
 * 同步存储中间件
 * 
 * 这个中间件监听特定的Redux动作，并将状态同步到Chrome存储
 */
const syncStorageMiddleware: Middleware = store => next => action => {
  // 先执行动作
  const result = next(action);

  const state = store.getState();

  try {
    // 根据不同类型的动作，执行相应的存储同步
    if (
      action.type.startsWith('todos/') && 
      !action.type.includes('fetch') &&
      !action.type.includes('save')
    ) {
      // 同步待办事项
      storageService.setTodos(state.todos.items);
    }
    
    if (
      action.type.startsWith('lists/') &&
      !action.type.includes('fetch') &&
      !action.type.includes('save')
    ) {
      // 同步列表数据
      storageService.setLists(state.lists.items);
    }
    
    if (
      action.type.startsWith('ui/') &&
      !action.type.includes('fetch') &&
      !action.type.includes('save')
    ) {
      // 同步UI设置
      storageService.setSettings({
        theme: state.ui.theme,
        sidebarWidth: state.ui.sidebarWidth,
        currentView: state.ui.currentView,
        weekViewDate: state.ui.weekViewDate
      });
    }
  } catch (error) {
    console.error('同步数据到Chrome存储时出错:', error);
  }

  return result;
};

export default syncStorageMiddleware; 