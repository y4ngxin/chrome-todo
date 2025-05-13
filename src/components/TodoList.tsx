import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from '../utils/store';
import Todo from './Todo';
import { Todo as TodoType } from '../utils/slices/todosSlice';

const TodoListContainer = styled.div`
  margin-top: 16px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  color: ${props => props.theme.textMuted};
  
  svg {
    margin-bottom: 16px;
    width: 48px;
    height: 48px;
  }
`;

const EmptyStateText = styled.p`
  font-size: 16px;
  text-align: center;
`;

interface TodoListProps {
  listId?: string;  // 当前显示的列表ID，如果为空则显示所有
  filter?: 'all' | 'completed' | 'active' | 'important' | 'myDay';  // 过滤条件
}

const TodoList: React.FC<TodoListProps> = ({ listId, filter = 'all' }) => {
  const todos = useSelector((state: RootState) => state.todos.items);
  
  // 根据当前列表和过滤条件筛选待办事项
  const filteredTodos = todos.filter((todo: TodoType) => {
    // 如果指定了列表ID，则只显示该列表下的待办事项
    if (listId && todo.listId !== listId) {
      return false;
    }
    
    // 根据过滤条件筛选
    switch (filter) {
      case 'completed':
        return todo.completed;
      case 'active':
        return !todo.completed;
      case 'important':
        return todo.isImportant;
      case 'myDay':
        return todo.isMyDay;
      default:
        return true;
    }
  });
  
  // 按创建时间排序，最新的在前面
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  // 如果没有待办事项，显示空状态
  if (sortedTodos.length === 0) {
    return (
      <EmptyState>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM15.88 8.29L10 14.17L8.12 12.29C7.73 11.9 7.1 11.9 6.71 12.29C6.32 12.68 6.32 13.31 6.71 13.7L9.3 16.29C9.69 16.68 10.32 16.68 10.71 16.29L17.3 9.7C17.69 9.31 17.69 8.68 17.3 8.29C16.91 7.9 16.27 7.9 15.88 8.29Z" fill="currentColor"/>
        </svg>
        <EmptyStateText>没有待办事项</EmptyStateText>
      </EmptyState>
    );
  }
  
  return (
    <TodoListContainer>
      {sortedTodos.map((todo: TodoType) => (
        <Todo key={todo.id} todo={todo} />
      ))}
    </TodoListContainer>
  );
};

export default TodoList; 