import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { AppState, useAppDispatch } from '../utils/store';
import { 
  format, 
  startOfWeek,
  endOfWeek, 
  eachDayOfInterval, 
  isToday,
  parseISO,
  isSameDay
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { nextWeek, previousWeek, goToCurrentWeek } from '../utils/slices/uiSlice';
import { Todo } from '../utils/slices/todosSlice';

const WeekViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const WeekHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid ${props => props.theme.borderColor};
`;

const WeekTitle = styled.h2`
  margin: 0;
  font-size: 1.2rem;
`;

const WeekNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NavButton = styled.button`
  background: ${props => props.theme.buttonBackground};
  color: ${props => props.theme.buttonText};
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  
  &:hover {
    background: ${props => props.theme.buttonHoverBackground};
  }
`;

const WeekGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  flex-grow: 1;
  overflow-y: auto;
  height: calc(100% - 50px);
`;

const WeekDayHeader = styled.div<{ isToday: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid ${props => props.theme.borderColor};
  background-color: ${props => props.isToday ? props.theme.todayHighlight : 'transparent'};
  
  .day-name {
    font-weight: ${props => props.isToday ? 'bold' : 'normal'};
    font-size: 0.9rem;
  }
  
  .day-number {
    font-size: 1.2rem;
    font-weight: ${props => props.isToday ? 'bold' : 'normal'};
  }
`;

const DayColumn = styled.div<{ isToday: boolean }>`
  min-height: 100%;
  border-right: 1px solid ${props => props.theme.borderColor};
  background-color: ${props => props.isToday ? props.theme.todayBackground : 'transparent'};

  &:last-child {
    border-right: none;
  }
`;

const TodoItem = styled.div<{ completed: boolean }>`
  padding: 8px;
  margin: 8px;
  border-radius: 4px;
  background-color: ${props => props.theme.todoBackground};
  border-left: 3px solid ${props => props.completed ? props.theme.completedColor : props.theme.accentColor};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  opacity: ${props => props.completed ? 0.7 : 1};
  text-decoration: ${props => props.completed ? 'line-through' : 'none'};
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.theme.todoHoverBackground};
  }
`;

const EmptyDayMessage = styled.div`
  color: ${props => props.theme.textColorLight};
  text-align: center;
  padding: 16px 8px;
  font-size: 0.9rem;
`;

interface WeekViewProps {
  onTodoClick?: (todoId: string) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ onTodoClick }) => {
  const dispatch = useAppDispatch();
  const { weekViewDate } = useSelector((state: AppState) => state.ui);
  const todos = useSelector((state: AppState) => state.todos.items);
  
  // 计算当前显示的周的开始和结束日期
  const currentDate = parseISO(weekViewDate);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // 从周一开始
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  
  // 生成这一周的每一天
  const daysOfWeek = useMemo(() => 
    eachDayOfInterval({ start: weekStart, end: weekEnd }),
    [weekStart, weekEnd]
  );
  
  // 按天对待办事项进行分组
  const todosByDay = useMemo(() => {
    const grouped: { [key: string]: Todo[] } = {};
    
    // 初始化每一天的空数组
    daysOfWeek.forEach(day => {
      grouped[format(day, 'yyyy-MM-dd')] = [];
    });
    
    // 分配待办事项到对应的日期
    todos.forEach(todo => {
      if (todo.dueDate) {
        const dueDate = format(parseISO(todo.dueDate), 'yyyy-MM-dd');
        if (grouped[dueDate]) {
          grouped[dueDate].push(todo);
        }
      }
    });
    
    return grouped;
  }, [todos, daysOfWeek]);
  
  // 处理导航
  const handlePreviousWeek = () => dispatch(previousWeek());
  const handleNextWeek = () => dispatch(nextWeek());
  const handleCurrentWeek = () => dispatch(goToCurrentWeek());
  
  // 格式化周标题
  const weekTitle = `${format(weekStart, 'yyyy年MM月dd日', { locale: zhCN })} - ${format(weekEnd, 'MM月dd日', { locale: zhCN })}`;
  
  return (
    <WeekViewContainer>
      <WeekHeader>
        <WeekTitle>{weekTitle}</WeekTitle>
        <WeekNavigation>
          <NavButton onClick={handlePreviousWeek}>上一周</NavButton>
          <NavButton onClick={handleCurrentWeek}>本周</NavButton>
          <NavButton onClick={handleNextWeek}>下一周</NavButton>
        </WeekNavigation>
      </WeekHeader>
      
      <WeekGrid>
        {daysOfWeek.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayTodos = todosByDay[dateStr] || [];
          const dayIsToday = isToday(day);
          
          return (
            <DayColumn key={dateStr} isToday={dayIsToday}>
              <WeekDayHeader isToday={dayIsToday}>
                <span className="day-name">{format(day, 'EEE', { locale: zhCN })}</span>
                <span className="day-number">{format(day, 'd')}</span>
              </WeekDayHeader>
              
              {dayTodos.length > 0 ? (
                dayTodos.map(todo => (
                  <TodoItem 
                    key={todo.id} 
                    completed={todo.completed}
                    onClick={() => onTodoClick && onTodoClick(todo.id)}
                  >
                    {todo.title}
                  </TodoItem>
                ))
              ) : (
                <EmptyDayMessage>无待办事项</EmptyDayMessage>
              )}
            </DayColumn>
          );
        })}
      </WeekGrid>
    </WeekViewContainer>
  );
};

export default WeekView; 