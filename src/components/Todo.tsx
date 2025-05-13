import React, { useState } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { Todo as TodoType, toggleCompleted, toggleImportant, removeTodo, updateTodo } from '../utils/slices/todosSlice';

const TodoContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 8px;
  background-color: ${props => props.theme.cardBackground};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  }
`;

const CheckboxContainer = styled.div`
  margin-right: 12px;
`;

const Checkbox = styled.div<{ checked: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${props => props.checked ? props.theme.primaryColor : props.theme.borderColor};
  background-color: ${props => props.checked ? props.theme.primaryColor : 'transparent'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &::after {
    content: '✓';
    color: white;
    font-size: 12px;
    display: ${props => props.checked ? 'block' : 'none'};
  }
`;

const TodoContent = styled.div`
  flex-grow: 1;
`;

const TodoTitle = styled.div<{ completed: boolean }>`
  font-size: 16px;
  margin-bottom: 4px;
  text-decoration: ${props => props.completed ? 'line-through' : 'none'};
  color: ${props => props.completed ? props.theme.textMuted : props.theme.textColor};
`;

const TodoDetails = styled.div`
  font-size: 12px;
  color: ${props => props.theme.textMuted};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${props => props.theme.textMuted};
  font-size: 16px;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${props => props.theme.primaryColor};
  }
`;

const ImportantButton = styled(ActionButton)<{ isImportant: boolean }>`
  color: ${props => props.isImportant ? '#FFD700' : props.theme.textMuted};
  
  &:hover {
    color: #FFD700;
  }
`;

interface TodoProps {
  todo: TodoType;
}

const Todo: React.FC<TodoProps> = ({ todo }) => {
  const dispatch = useDispatch();
  const [isHovered, setIsHovered] = useState(false);
  
  const handleToggleCompleted = () => {
    dispatch(toggleCompleted(todo.id));
  };
  
  const handleToggleImportant = () => {
    dispatch(toggleImportant(todo.id));
  };
  
  const handleRemove = () => {
    dispatch(removeTodo(todo.id));
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };
  
  return (
    <TodoContainer 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CheckboxContainer>
        <Checkbox 
          checked={todo.completed} 
          onClick={handleToggleCompleted}
        />
      </CheckboxContainer>
      <TodoContent>
        <TodoTitle completed={todo.completed}>{todo.title}</TodoTitle>
        {(todo.dueDate || todo.listId) && (
          <TodoDetails>
            {todo.dueDate && `截止日期: ${formatDate(todo.dueDate)}`}
            {todo.dueDate && todo.listId && ' · '}
            {todo.listId && `列表: ${todo.listId}`}
          </TodoDetails>
        )}
      </TodoContent>
      <ActionButtons>
        <ImportantButton 
          isImportant={todo.isImportant}
          onClick={handleToggleImportant}
        >
          ★
        </ImportantButton>
        {isHovered && (
          <ActionButton onClick={handleRemove}>
            🗑️
          </ActionButton>
        )}
      </ActionButtons>
    </TodoContainer>
  );
};

export default Todo; 