import React, { useState } from 'react';
import styled from 'styled-components';
import { useAppDispatch } from '../utils/store';
import { Todo as TodoType, toggleCompleted, toggleImportant, toggleMyDay, removeTodo } from '../utils/slices/todosSlice';
import { format, parseISO, isToday, isThisWeek, isBefore } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { 
  HiOutlineStar, 
  HiStar, 
  HiOutlineTrash, 
  HiOutlineSun, 
  HiSun, 
  HiOutlineCalendar,
  HiOutlineFlag,
  HiOutlineExclamation,
  HiOutlineExclamationCircle
} from 'react-icons/hi';

interface TodoContainerProps {
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
}

const TodoContainer = styled.div<TodoContainerProps>`
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 8px;
  background-color: ${props => props.theme.cardBackground};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  opacity: ${props => props.completed ? 0.7 : 1};
  border-left: ${props => {
    if (!props.completed && props.priority) {
      switch(props.priority) {
        case 'high': return `4px solid ${props.theme.errorColor}`;
        case 'medium': return `4px solid ${props.theme.warningColor}`;
        case 'low': return `4px solid ${props.theme.infoColor}`;
        default: return 'none';
      }
    }
    return 'none';
  }};
  
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
  cursor: pointer;
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
  flex-wrap: wrap;
`;

const TodoDueDate = styled.span<{ isOverdue: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${props => props.isOverdue ? props.theme.errorColor : props.theme.textMuted};
`;

const TodoPriority = styled.span<{ priority: 'low' | 'medium' | 'high' }>`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${props => {
    switch(props.priority) {
      case 'high': return props.theme.errorColor;
      case 'medium': return props.theme.warningColor;
      case 'low': return props.theme.infoColor;
      default: return props.theme.textMuted;
    }
  }};
`;

const TodoTag = styled.span`
  display: inline-flex;
  align-items: center;
  background-color: ${props => props.theme.tagBackground};
  color: ${props => props.theme.tagText};
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-right: 4px;
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
  onClick?: (todoId: string) => void;
}

const Todo: React.FC<TodoProps> = ({ todo, onClick }) => {
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
  
  // 获取优先级图标
  const getPriorityIcon = () => {
    if (!todo.priority) return null;
    
    switch(todo.priority) {
      case 'high':
        return <HiOutlineExclamationCircle size={16} />;
      case 'medium':
        return <HiOutlineExclamation size={16} />;
      case 'low':
        return <HiOutlineFlag size={16} />;
      default:
        return null;
    }
  };
  
  // 格式化优先级
  const formatPriority = () => {
    if (!todo.priority) return null;
    
    const priorityText = {
      high: '高优先级',
      medium: '中优先级',
      low: '低优先级'
    };
    
    return (
      <TodoPriority priority={todo.priority}>
        {getPriorityIcon()}
        {priorityText[todo.priority]}
      </TodoPriority>
    );
  };
  
  // 格式化标签
  const formatTags = () => {
    if (!todo.tags || todo.tags.length === 0) return null;
    
    return (
      <>
        {todo.tags.map((tag, index) => (
          <TodoTag key={index}>{tag}</TodoTag>
        ))}
      </>
    );
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
  
  // 处理点击内容区域
  const handleContentClick = (e: React.MouseEvent) => {
    // 阻止事件冒泡，以免触发整个容器的点击事件
    e.stopPropagation();
    if (onClick) onClick(todo.id);
  };
  
  // 阻止按钮点击传播
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  return (
    <TodoContainer 
      completed={todo.completed}
      priority={todo.priority}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick && onClick(todo.id)}
    >
      <Checkbox 
        checked={todo.completed} 
        onClick={(e) => {
          e.stopPropagation();
          handleToggleCompleted();
        }}
      />
      <TodoContent onClick={handleContentClick}>
        <TodoTitle completed={todo.completed}>{todo.title}</TodoTitle>
        <TodoMetadata>
          {formatDueDate()}
          {formatPriority()}
          {formatTags()}
        </TodoMetadata>
      </TodoContent>
      <TodoActions onClick={handleButtonClick}>
        <ActionButton onClick={(e) => {
          e.stopPropagation();
          handleToggleMyDay();
        }}>
          {todo.isMyDay ? <HiSun size={18} color="#debd16" /> : <HiOutlineSun size={18} />}
        </ActionButton>
        <ActionButton onClick={(e) => {
          e.stopPropagation();
          handleToggleImportant();
        }}>
          {todo.isImportant ? <HiStar size={18} color="#debd16" /> : <HiOutlineStar size={18} />}
        </ActionButton>
        {isHovered && (
          <ActionButton onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}>
            <HiOutlineTrash size={18} />
          </ActionButton>
        )}
      </TodoActions>
    </TodoContainer>
  );
};

export default Todo; 