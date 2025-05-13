import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { sampleTodos } from '../initialData';
import * as storageService from '../storage';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
  listId: string;
  isImportant: boolean;
  isMyDay: boolean;
  notes?: string;
  steps?: TodoStep[];
  url?: string;
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
    return todos.length > 0 ? todos : sampleTodos;
  }
);

export const saveTodos = createAsyncThunk(
  'todos/saveTodos',
  async (todos: Todo[]) => {
    await storageService.setTodos(todos);
    return todos;
  }
);

export const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addTodo: (state, action: PayloadAction<Todo>) => {
      state.items.push(action.payload);
    },
    removeTodo: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(todo => todo.id !== action.payload);
    },
    toggleCompleted: (state, action: PayloadAction<string>) => {
      const todo = state.items.find(todo => todo.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    toggleImportant: (state, action: PayloadAction<string>) => {
      const todo = state.items.find(todo => todo.id === action.payload);
      if (todo) {
        todo.isImportant = !todo.isImportant;
      }
    },
    toggleMyDay: (state, action: PayloadAction<string>) => {
      const todo = state.items.find(todo => todo.id === action.payload);
      if (todo) {
        todo.isMyDay = !todo.isMyDay;
      }
    },
    updateTodo: (state, action: PayloadAction<Partial<Todo> & { id: string }>) => {
      const index = state.items.findIndex(todo => todo.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
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
  setTodos
} = todosSlice.actions;

export default todosSlice.reducer; 