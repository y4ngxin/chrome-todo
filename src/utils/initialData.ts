import { v4 as uuidv4 } from 'uuid';
import { Todo } from './slices/todosSlice';
import { TodoList } from './slices/listsSlice';

// 默认列表
export const defaultLists: TodoList[] = [
  {
    id: 'default',
    name: '默认列表',
    icon: '📋',
    color: '#0078d7',
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
  {
    id: 'work',
    name: '工作',
    icon: '💼',
    color: '#107C10',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'personal',
    name: '个人',
    icon: '🏠',
    color: '#A4262C',
    createdAt: new Date().toISOString(),
  },
];

// 示例列表
export const sampleLists: TodoList[] = [
  {
    id: 'work',
    name: '工作',
    color: '#0078d7',
    icon: '💼',
    createdAt: new Date().toISOString()
  },
  {
    id: 'personal',
    name: '个人',
    color: '#107c41',
    icon: '🏠',
    createdAt: new Date().toISOString()
  },
  {
    id: 'shopping',
    name: '购物',
    color: '#ff8c00',
    icon: '🛒',
    createdAt: new Date().toISOString()
  },
];

// 示例待办事项
export const sampleTodos: Todo[] = [
  {
    id: uuidv4(),
    title: '完成ChromeToDo基础功能',
    completed: false,
    createdAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    listId: 'work',
    isImportant: true,
    isMyDay: true,
    priority: 'high',
    tags: ['开发', '项目', '紧急'],
    steps: [
      {
        id: uuidv4(),
        title: '创建任务组件',
        completed: true,
      },
      {
        id: uuidv4(),
        title: '实现待办事项列表',
        completed: false,
      },
      {
        id: uuidv4(),
        title: '添加任务表单',
        completed: false,
      },
    ],
  },
  {
    id: uuidv4(),
    title: '购物清单',
    completed: false,
    createdAt: new Date().toISOString(),
    listId: 'personal',
    isImportant: false,
    isMyDay: false,
    priority: 'medium',
    tags: ['购物', '家庭'],
    steps: [
      {
        id: uuidv4(),
        title: '牛奶',
        completed: false,
      },
      {
        id: uuidv4(),
        title: '面包',
        completed: false,
      },
      {
        id: uuidv4(),
        title: '水果',
        completed: false,
      },
    ],
  },
  {
    id: uuidv4(),
    title: '阅读React文档',
    completed: false,
    createdAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    listId: 'work',
    isImportant: true,
    isMyDay: false,
    priority: 'medium',
    tags: ['学习', '技术'],
  },
  {
    id: uuidv4(),
    title: '锻炼30分钟',
    completed: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    listId: 'personal',
    isImportant: false,
    isMyDay: true,
    priority: 'low',
    tags: ['健康', '日常'],
  },
]; 