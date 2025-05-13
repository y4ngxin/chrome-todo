import { Todo } from './slices/todosSlice';
import { TodoList } from './slices/listsSlice';
import { PomodoroSettings } from './slices/uiSlice';
import { Tag } from './slices/tagsSlice';

// 存储键名
export const STORAGE_KEYS = {
  TODOS: 'todos',
  LISTS: 'lists',
  SETTINGS: 'settings',
  TAGS: 'tags'
} as const;

// 存储接口
export interface StorageData {
  [STORAGE_KEYS.TODOS]?: Todo[];
  [STORAGE_KEYS.LISTS]?: TodoList[];
  [STORAGE_KEYS.SETTINGS]?: UISettings;
  [STORAGE_KEYS.TAGS]?: Tag[];
}

// UI设置类型
export interface UISettings {
  theme: 'light' | 'dark';
  sidebarWidth: 'normal' | 'collapsed';
  currentView?: 'myDay' | 'important' | 'planned' | 'list' | 'week' | 'pomodoro' | 'tags';
  weekViewDate?: string;
  pomodoroSettings?: PomodoroSettings;
}

// 获取所有存储数据
export const getAllData = (): Promise<StorageData> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (result) => {
      resolve(result as StorageData);
    });
  });
};

// 获取特定键的数据
export const getData = <T>(key: string): Promise<T | undefined> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key] as T);
    });
  });
};

// 设置数据
export const setData = <T>(key: string, data: T): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: data }, () => {
      resolve();
    });
  });
};

// 获取待办事项列表
export const getTodos = (): Promise<Todo[]> => {
  return getData<Todo[]>(STORAGE_KEYS.TODOS).then((todos) => todos || []);
};

// 保存待办事项列表
export const setTodos = (todos: Todo[]): Promise<void> => {
  console.log(`开始保存${todos.length}个待办事项到Chrome存储`);
  return new Promise((resolve, reject) => {
    try {
      // 深拷贝避免引用问题
      const todosCopy = JSON.parse(JSON.stringify(todos));
      chrome.storage.local.set({ [STORAGE_KEYS.TODOS]: todosCopy }, () => {
        if (chrome.runtime.lastError) {
          console.error('保存待办事项时出错:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
          return;
        }
        console.log('待办事项保存成功');
        resolve();
      });
    } catch (error) {
      console.error('准备待办事项数据保存时出错:', error);
      reject(error);
    }
  });
};

// 获取列表
export const getLists = (): Promise<TodoList[]> => {
  return getData<TodoList[]>(STORAGE_KEYS.LISTS).then((lists) => lists || []);
};

// 保存列表
export const setLists = (lists: TodoList[]): Promise<void> => {
  return setData(STORAGE_KEYS.LISTS, lists);
};

// 获取设置
export const getSettings = (): Promise<UISettings | undefined> => {
  return getData(STORAGE_KEYS.SETTINGS);
};

// 保存设置
export const setSettings = (settings: UISettings): Promise<void> => {
  return setData(STORAGE_KEYS.SETTINGS, settings);
};

// 获取标签
export const getTags = (): Promise<Tag[]> => {
  return getData<Tag[]>(STORAGE_KEYS.TAGS).then((tags) => tags || []);
};

// 保存标签
export const setTags = (tags: Tag[]): Promise<void> => {
  return setData(STORAGE_KEYS.TAGS, tags);
}; 