import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { AppState, useAppDispatch } from '../utils/store';
import { Todo } from '../utils/slices/todosSlice';
import { Tag } from '../utils/slices/tagsSlice';
import TodoList from './TodoList';

const TagsViewContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const TagsViewTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 16px;
  color: ${props => props.theme.textColor};
`;

const TagsView: React.FC<{ onTodoClick?: (todoId: string) => void }> = ({ onTodoClick }) => {
  const dispatch = useAppDispatch();
  const todos = useSelector((state: AppState) => state.todos.items);
  const tags = useSelector((state: AppState) => state.tags.items);
  const activeListId = useSelector((state: AppState) => state.lists.activeListId);
  
  // 根据activeListId过滤待办事项
  const filteredTodos = activeListId
    ? todos.filter((todo: Todo) => {
        if (!todo.tags || todo.tags.length === 0) return false;
        
        // 查找标签ID对应的名称
        const activeTag = tags.find((tag: Tag) => tag.id === activeListId);
        const activeTagName = activeTag ? activeTag.name : null;
        
        // 检查待办事项是否包含选定的标签
        return activeTagName && todo.tags.includes(activeTagName);
      })
    : todos;
  
  // 获取当前活动标签的名称（如果存在）
  const getActiveTagName = () => {
    if (activeListId) {
      const activeTag = tags.find((tag: Tag) => tag.id === activeListId);
      return activeTag ? activeTag.name : '所有任务';
    }
    return '所有任务';
  };
  
  return (
    <TagsViewContainer>
      <TagsViewTitle>
        {activeListId ? `标签: ${getActiveTagName()}` : '所有任务'}
      </TagsViewTitle>
      
      <TodoList 
        customTodos={activeListId ? filteredTodos : undefined}
        onTodoClick={onTodoClick}
      />
    </TagsViewContainer>
  );
};

export default TagsView; 