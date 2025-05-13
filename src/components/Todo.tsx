import React, { useState } from 'react';
import styled from 'styled-components';
import { useAppDispatch } from '../utils/store';
import { Todo as TodoType, toggleCompleted, toggleImportant, toggleMyDay, removeTodo } from '../utils/slices/todosSlice';
import { format, parseISO, isToday, isThisWeek, isBefore } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { HiOutlineStar, HiStar, HiOutlineTrash, HiOutlineSun, HiSun, HiOutlineCalendar } from 'react-icons/hi';

const TodoContainer = styled.div<{ completed: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 8px;
  background-color: ${props => props.theme.cardBackground};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  opacity: ${props => props.completed ? 0.7 : 1};
  
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

const TodoMetadata = styled.div`
  display: flex;
  font-size: 12px;
  color: ${props => props.theme.textMuted};
  margin-top: 4px;
  gap: 8px;
  align-items: center;
`;

const TodoDueDate = styled.span<{ isOverdue: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${props => props.isOverdue ? props.theme.errorColor : props.theme.textMuted};
`;

const TodoActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${props => props.theme.textMuted};
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme.hoverBackground};
  }
`;

interface TodoProps {
  todo: TodoType;
}

const Todo: React.FC<TodoProps> = ({ todo }) => {
  const dispatch = useAppDispatch();
  const [isHovered, setIsHovered] = useState(false);
  
  const handleToggleCompleted = () => {
    dispatch(toggleCompleted(todo.id));
  };
  
  const handleToggleImportant = () => {
    dispatch(toggleImportant(todo.id));
  };
  
  const handleToggleMyDay = () => {
    dispatch(toggleMyDay(todo.id));
  };
  
  const handleRemove = () => {
    dispatch(removeTodo(todo.id));
  };
  
  // 格式化截止日期
  const formatDueDate = () => {
    if (!todo.dueDate) return null;
    
    const date = parseISO(todo.dueDate);
    const now = new Date();
    const isOverdue = isBefore(date, now) && !isToday(date);
    
    let dateStr: string;
    if (isToday(date)) {
      dateStr = '今天';
    } else if (isThisWeek(date, { weekStartsOn: 1 })) {
      dateStr = format(date, 'EEEE', { locale: zhCN });
    } else {
      dateStr = format(date, 'yyyy年MM月dd日', { locale: zhCN });
    }
    
    return (
      <TodoDueDate isOverdue={isOverdue}>
        <HiOutlineCalendar size={14} />
        {dateStr}
      </TodoDueDate>
    );
  };
  
  return (
    <TodoContainer 
      completed={todo.completed}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Checkbox 
        checked={todo.completed} 
        onClick={handleToggleCompleted}
      />
      <TodoContent>
        <TodoTitle completed={todo.completed}>{todo.title}</TodoTitle>
        <TodoMetadata>
          {formatDueDate()}
        </TodoMetadata>
      </TodoContent>
      <TodoActions>
        <ActionButton onClick={handleToggleMyDay}>
          {todo.isMyDay ? <HiSun size={18} color="#debd16" /> : <HiOutlineSun size={18} />}
        </ActionButton>
        <ActionButton onClick={handleToggleImportant}>
          {todo.isImportant ? <HiStar size={18} color="#debd16" /> : <HiOutlineStar size={18} />}
        </ActionButton>
        {isHovered && (
          <ActionButton onClick={handleRemove}>
            <HiOutlineTrash size={18} />
          </ActionButton>
        )}
      </TodoActions>
    </TodoContainer>
  );
};

export default Todo; 