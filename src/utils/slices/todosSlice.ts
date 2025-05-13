import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { sampleTodos } from '../initialData';
import * as storageService from '../storage';
import { v4 as uuidv4 } from 'uuid';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  isImportant: boolean;
  isMyDay: boolean;
  listId?: string;
  dueDate?: string;
  notes?: string;
  steps?: TodoStep[];
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
}

export interface TodoStep {
  id: string;
  title: string;
  completed: boolean;
}

interface TodosState {
  items: Todo[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TodosState = {
  items: [],
  status: 'idle',
  error: null,
};

// 异步 Thunks
export const fetchTodos = createAsyncThunk(
  'todos/fetchTodos',
  async () => {
    const todos = await storageService.getTodos();
    // console.log('Fetched todos from storage:', todos);
    return todos.length > 0 ? todos : sampleTodos;
  }
);

export const saveTodos = createAsyncThunk(
  'todos/saveTodos',
  async (todos: Todo[]) => {
    // console.log('Saving todos to storage:', todos);
    await storageService.setTodos(todos);
    return todos;
  }
);

export const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addTodo: (state, action: PayloadAction<{ title: string; listId?: string; isImportant?: boolean; isMyDay?: boolean; dueDate?: string; priority?: 'low' | 'medium' | 'high'; }>) => {
      const { title, listId, isImportant = false, isMyDay = false, dueDate, priority } = action.payload;
      const now = new Date().toISOString();
      const newTodo: Todo = {
        id: uuidv4(),
        title,
        completed: false,
        createdAt: now,
        updatedAt: now,
        isImportant,
        isMyDay,
        listId,
        dueDate,
        notes: '',
        steps: [],
        priority
      };
      state.items.unshift(newTodo);
    },
    removeTodo: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(todo => todo.id !== action.payload);
    },
    toggleCompleted: (state, action: PayloadAction<string>) => {
      const todo = state.items.find(todo => todo.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
        todo.updatedAt = new Date().toISOString();
      }
    },
    toggleImportant: (state, action: PayloadAction<string>) => {
      const todo = state.items.find(todo => todo.id === action.payload);
      if (todo) {
        todo.isImportant = !todo.isImportant;
        todo.updatedAt = new Date().toISOString();
      }
    },
    toggleMyDay: (state, action: PayloadAction<string>) => {
      const todo = state.items.find(todo => todo.id === action.payload);
      if (todo) {
        todo.isMyDay = !todo.isMyDay;
        todo.updatedAt = new Date().toISOString();
      }
    },
    updateTodo: (state, action: PayloadAction<{ id: string; updates: Partial<Todo> }>) => {
      const { id, updates } = action.payload;
      const todo = state.items.find(todo => todo.id === id);
      if (todo) {
        Object.assign(todo, { ...updates, updatedAt: new Date().toISOString() });
      }
    },
    addStep: (state, action: PayloadAction<{ todoId: string; step: TodoStep }>) => {
      const todo = state.items.find(todo => todo.id === action.payload.todoId);
      if (todo) {
        if (!todo.steps) {
          todo.steps = [];
        }
        todo.steps.push(action.payload.step);
      }
    },
    removeStep: (state, action: PayloadAction<{ todoId: string; stepId: string }>) => {
      const todo = state.items.find(todo => todo.id === action.payload.todoId);
      if (todo && todo.steps) {
        todo.steps = todo.steps.filter(step => step.id !== action.payload.stepId);
      }
    },
    toggleStepCompleted: (state, action: PayloadAction<{ todoId: string; stepId: string }>) => {
      const todo = state.items.find(todo => todo.id === action.payload.todoId);
      if (todo && todo.steps) {
        const step = todo.steps.find(step => step.id === action.payload.stepId);
        if (step) {
          step.completed = !step.completed;
        }
      }
    },
    setTodos: (state, action: PayloadAction<Todo[]>) => {
      state.items = action.payload;
    },
    clearCompleted: (state, action: PayloadAction<string | undefined>) => {
      const listId = action.payload;
      if (listId) {
        state.items = state.items.filter(todo => !todo.completed || todo.listId !== listId);
      } else {
        state.items = state.items.filter(todo => !todo.completed);
      }
    },
    updateTodoSteps: (state, action: PayloadAction<{ todoId: string; steps: TodoStep[] }>) => {
      const { todoId, steps } = action.payload;
      const todo = state.items.find(todo => todo.id === todoId);
      if (todo) {
        todo.steps = steps;
        todo.updatedAt = new Date().toISOString();
      }
    },
    reorderTodos: (state, action: PayloadAction<{
      sourceIndex: number;
      destinationIndex: number;
      listId?: string;
      sourceDayId?: string;
      destinationDayId?: string;
      todoId?: string;  // 当需要更新dueDate时使用
      newDueDate?: string; // 新的截止日期
    }>) => {
      const { 
        sourceIndex, 
        destinationIndex, 
        listId, 
        sourceDayId, 
        destinationDayId,
        todoId,
        newDueDate
      } = action.payload;
      
      // 处理跨天拖拽的情况
      if (sourceDayId !== destinationDayId && sourceDayId && destinationDayId && todoId && newDueDate) {
        // 找到要更新的任务
        const todoToUpdate = state.items.find(todo => todo.id === todoId);
        if (todoToUpdate) {
          // 更新截止日期
          todoToUpdate.dueDate = newDueDate;
          todoToUpdate.updatedAt = new Date().toISOString();
          return; // 直接返回，不需要重新排序
        }
      }
      
      // 处理周视图中的排序
      if (listId === 'week' && sourceDayId && destinationDayId) {
        // 处理同一天内的排序
        if (sourceDayId === destinationDayId) {
          // 获取该天的所有任务
          let dayTodos = state.items.filter(todo => {
            if (!todo.dueDate) return false;
            const todoDate = todo.dueDate.split('T')[0];
            return todoDate === sourceDayId;
          });
          
          // 重新排序
          const [removed] = dayTodos.splice(sourceIndex, 1);
          dayTodos.splice(destinationIndex, 0, removed);
          
          // 更新状态
          state.items = state.items.map(todo => {
            if (!todo.dueDate || todo.dueDate.split('T')[0] !== sourceDayId) {
              return todo;
            }
            
            // 查找任务在排序后的位置
            const sortedTodo = dayTodos.find(t => t.id === todo.id);
            return sortedTodo || todo;
          });
          
          return;
        }
      }
      
      // 根据listId筛选出相关的待办事项
      let relevantTodos: Todo[] = [];
      
      if (listId === 'myDay') {
        relevantTodos = state.items.filter(todo => todo.isMyDay);
      } else if (listId === 'important') {
        relevantTodos = state.items.filter(todo => todo.isImportant);
      } else if (listId === 'planned') {
        relevantTodos = state.items.filter(todo => !!todo.dueDate);
      } else if (listId && !['myDay', 'important', 'planned', 'week'].includes(listId)) {
        relevantTodos = state.items.filter(todo => todo.listId === listId);
      } else {
        relevantTodos = [...state.items];
      }
      
      // 重新排序
      const [removed] = relevantTodos.splice(sourceIndex, 1);
      relevantTodos.splice(destinationIndex, 0, removed);
      
      // 如果是针对特定listId的排序，需要更新原始items数组
      if (listId) {
        let updatedItems = [...state.items];
        
        // 根据listId移除并重新插入相关的项目
        if (listId === 'myDay') {
          updatedItems = updatedItems.filter(todo => !todo.isMyDay);
          relevantTodos.forEach(todo => {
            const index = updatedItems.findIndex(t => t.id === todo.id);
            if (index === -1) {
              updatedItems.push(todo);
            }
          });
        } else if (listId === 'important') {
          updatedItems = updatedItems.filter(todo => !todo.isImportant);
          relevantTodos.forEach(todo => {
            const index = updatedItems.findIndex(t => t.id === todo.id);
            if (index === -1) {
              updatedItems.push(todo);
            }
          });
        } else if (listId === 'planned') {
          updatedItems = updatedItems.filter(todo => !todo.dueDate);
          relevantTodos.forEach(todo => {
            const index = updatedItems.findIndex(t => t.id === todo.id);
            if (index === -1) {
              updatedItems.push(todo);
            }
          });
        } else if (!['myDay', 'important', 'planned', 'week'].includes(listId)) {
          updatedItems = updatedItems.filter(todo => todo.listId !== listId);
          updatedItems = [...updatedItems, ...relevantTodos];
        }
        
        state.items = updatedItems;
      } else {
        // 如果是全局排序，直接替换items数组
        state.items = relevantTodos;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || '获取待办事项失败';
      })
      .addCase(saveTodos.fulfilled, (state, action) => {
        // 保存成功后不需要更新状态
      });
  },
});

export const { 
  addTodo, 
  removeTodo, 
  toggleCompleted, 
  toggleImportant, 
  toggleMyDay,
  updateTodo,
  addStep,
  removeStep,
  toggleStepCompleted,
  setTodos,
  clearCompleted,
  updateTodoSteps,
  reorderTodos
} = todosSlice.actions;

export default todosSlice.reducer; 