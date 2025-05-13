import React from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from '../utils/store';
import { nextWeek, previousWeek, goToCurrentWeek } from '../utils/slices/uiSlice';
import { format, addDays, startOfWeek, parseISO, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Todo } from '../utils/slices/todosSlice';
import { HiChevronLeft, HiChevronRight, HiCalendar } from 'react-icons/hi';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { reorderTodos } from '../utils/slices/todosSlice';

interface WeekViewProps {
  onTodoClick?: (todoId: string) => void;
  date?: Date;
}

const WeekViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0;
`;

const WeekHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const WeekTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
`;

const WeekControls = styled.div`
  display: flex;
  gap: 8px;
`;

const WeekButton = styled.button`
  background: transparent;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.textColor};
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.theme.hoverBackground};
  }
`;

const WeekGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(1, 1fr);
  }
`;

const DayColumn = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 120px;
  background-color: ${props => props.theme.cardBackground};
  border-radius: 8px;
  overflow: hidden;
`;

const WeekDayHeader = styled.div<{ isToday: boolean }>`
  background-color: ${props => props.isToday ? props.theme.primaryColor : props.theme.headerBackground};
  color: ${props => props.isToday ? props.theme.textOnPrimary : props.theme.textColor};
  padding: 8px;
  text-align: center;
  font-weight: 500;
`;

const DayContent = styled.div`
  flex-grow: 1;
  padding: 8px;
  overflow-y: auto;
  max-height: 300px;
`;

const TodoItem = styled.div<{ completed: boolean }>`
  padding: 8px;
  margin-bottom: 8px;
  background-color: ${props => props.theme.backgroundColor};
  border-radius: 4px;
  border-left: 3px solid ${props => props.completed ? props.theme.successColor : props.theme.primaryColor};
  font-size: 14px;
  cursor: pointer;
  text-decoration: ${props => props.completed ? 'line-through' : 'none'};
  color: ${props => props.completed ? props.theme.textMuted : props.theme.textColor};
  
  &:hover {
    background-color: ${props => props.theme.hoverBackground};
  }
`;

const EmptyDayMessage = styled.div`
  color: ${props => props.theme.textMuted};
  text-align: center;
  padding: 16px 8px;
  font-size: 13px;
`;

const WeekView: React.FC<WeekViewProps> = ({ onTodoClick }) => {
  const dispatch = useDispatch();
  const weekViewDate = useSelector((state: AppState) => state.ui.weekViewDate);
  const todos = useSelector((state: AppState) => state.todos.items);
  
  // 计算一周的日期
  const weekStart = startOfWeek(parseISO(weekViewDate), { locale: zhCN });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // 处理下一周
  const handleNextWeek = () => {
    dispatch(nextWeek());
  };
  
  // 处理上一周
  const handlePreviousWeek = () => {
    dispatch(previousWeek());
  };
  
  // 回到当前周
  const handleCurrentWeek = () => {
    dispatch(goToCurrentWeek());
  };
  
  // 格式化日期显示
  const formatDayHeader = (date: Date) => {
    const dayName = format(date, 'E', { locale: zhCN });
    const dayNumber = format(date, 'd');
    return `${dayName} ${dayNumber}`;
  };
  
  // 判断是否是今天
  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDay(date, today);
  };
  
  // 获取指定日期的待办事项
  const getTodosForDay = (date: Date): Todo[] => {
    return todos.filter((todo: Todo) => {
      if (!todo.dueDate) return false;
      return isSameDay(parseISO(todo.dueDate), date);
    });
  };
  
  // 处理拖拽结束事件
  const handleDragEnd = (result: DropResult) => {
    // 如果拖拽到了列表外，则不做任何处理
    if (!result.destination) {
      return;
    }
    
    // 获取源日期和目标日期
    const [sourceDayIndex] = result.source.droppableId.split('-');
    const [destinationDayIndex] = result.destination.droppableId.split('-');
    
    // 获取源日期和目标日期的 ISO 字符串
    const sourceDay = weekDays[parseInt(sourceDayIndex)];
    const destinationDay = weekDays[parseInt(destinationDayIndex)];
    const sourceDayIso = sourceDay.toISOString().split('T')[0];
    const destinationDayIso = destinationDay.toISOString().split('T')[0];
    
    // 获取源日期的待办事项
    const sourceDayTodos = getTodosForDay(sourceDay);
    const todo = sourceDayTodos[result.source.index];
    
    // 如果是同一天内的排序
    if (sourceDayIndex === destinationDayIndex) {
      dispatch(reorderTodos({
        sourceIndex: result.source.index,
        destinationIndex: result.destination.index,
        listId: 'week',
        sourceDayId: sourceDayIso,
        destinationDayId: destinationDayIso
      }));
    } else {
      // 跨天拖拽，更新任务的截止日期
      if (todo) {
        // 构建新的截止日期，保留原始时间部分
        let newDueDate = destinationDayIso;
        if (todo.dueDate && todo.dueDate.includes('T')) {
          const timePart = todo.dueDate.split('T')[1];
          newDueDate += `T${timePart}`;
        } else {
          newDueDate += `T00:00:00.000Z`;
        }
        
        dispatch(reorderTodos({
          sourceIndex: result.source.index,
          destinationIndex: result.destination.index,
          listId: 'week',
          sourceDayId: sourceDayIso,
          destinationDayId: destinationDayIso,
          todoId: todo.id,
          newDueDate
        }));
      }
    }
  };
  
  return (
    <WeekViewContainer>
      <WeekHeader>
        <WeekTitle>周视图</WeekTitle>
        <WeekControls>
          <WeekButton onClick={handlePreviousWeek} title="上一周">
            <HiChevronLeft size={20} />
          </WeekButton>
          <WeekButton onClick={handleCurrentWeek} title="回到本周">
            <HiCalendar size={18} />
          </WeekButton>
          <WeekButton onClick={handleNextWeek} title="下一周">
            <HiChevronRight size={20} />
          </WeekButton>
        </WeekControls>
      </WeekHeader>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <WeekGrid>
          {weekDays.map((day, dayIndex) => {
            const dayTodos = getTodosForDay(day);
            const todayClass = isToday(day) ? 'today' : '';
            
            return (
              <DayColumn key={dayIndex}>
                <WeekDayHeader isToday={isToday(day)}>
                  {formatDayHeader(day)}
                </WeekDayHeader>
                
                <Droppable droppableId={`${dayIndex}-drop`}>
                  {(provided: DroppableProvided) => (
                    <DayContent
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {dayTodos.length === 0 ? (
                        <EmptyDayMessage>无待办事项</EmptyDayMessage>
                      ) : (
                        dayTodos.map((todo: Todo, todoIndex: number) => (
                          <Draggable
                            key={todo.id}
                            draggableId={todo.id}
                            index={todoIndex}
                          >
                            {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                              <TodoItem
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                completed={todo.completed}
                                style={{
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.7 : 1
                                }}
                                onClick={() => onTodoClick && onTodoClick(todo.id)}
                              >
                                {todo.title}
                              </TodoItem>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </DayContent>
                  )}
                </Droppable>
              </DayColumn>
            );
          })}
        </WeekGrid>
      </DragDropContext>
    </WeekViewContainer>
  );
};

export default WeekView; 