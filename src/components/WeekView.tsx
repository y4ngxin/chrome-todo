import React from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from '../utils/store';
import { nextWeek, previousWeek, goToCurrentWeek } from '../utils/slices/uiSlice';
import { format, addDays, startOfWeek, parseISO, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Todo } from '../utils/slices/todosSlice';
import { HiChevronLeft, HiChevronRight, HiCalendar, HiOutlineViewGrid } from 'react-icons/hi';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { reorderTodos, saveTodos } from '../utils/slices/todosSlice';
import { store } from '../utils/store';
import * as storageService from '../utils/storage';

interface WeekViewProps {
  onTodoClick?: (todoId: string) => void;
  date?: Date;
}

const WeekViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0;
  width: 100%;
  height: 100%;
`;

const WeekHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: clamp(8px, 2vh, 16px);
  flex-wrap: wrap;
  
  @media (max-width: 480px) {
    margin-bottom: 10px;
  }
`;

const WeekTitle = styled.h2`
  margin: 0;
  font-size: clamp(1rem, 4vw, 1.2rem);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
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
  gap: clamp(4px, 1vw, 8px);
  height: calc(100% - 50px);
  overflow-y: auto;
  
  /* 根据设备尺寸调整布局 */
  /* 手机竖屏 */
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    grid-auto-rows: minmax(120px, auto);
  }
  
  /* 手机横屏或小型平板 */
  @media (min-width: 481px) and (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: minmax(150px, 1fr);
  }
  
  /* 中型平板 */
  @media (min-width: 769px) and (max-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: minmax(150px, 1fr);
  }
  
  /* 大屏设备 */
  @media (min-width: 1025px) {
    grid-template-columns: repeat(7, 1fr);
    grid-auto-rows: minmax(150px, 1fr);
  }
  
  /* 低高度设备的高度调整 */
  @media (max-height: 600px) {
    grid-auto-rows: minmax(100px, auto);
  }
`;

const DayColumn = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100px;
  height: 100%;
  background-color: ${props => props.theme.cardBackground};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 480px) {
    margin-bottom: 8px;
  }
`;

const WeekDayHeader = styled.div<{ isToday: boolean }>`
  background-color: ${props => props.isToday ? props.theme.primaryColor : props.theme.headerBackground};
  color: ${props => props.isToday ? props.theme.textOnPrimary : props.theme.textColor};
  padding: clamp(6px, 1.5vw, 8px);
  text-align: center;
  font-weight: 500;
  font-size: clamp(0.8rem, 2.5vw, 0.95rem);
`;

const DayContent = styled.div`
  flex-grow: 1;
  padding: 8px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }
  
  /* 针对不同屏幕尺寸调整最大高度 */
  @media (max-width: 480px) {
    max-height: 200px;
  }
  
  @media (min-width: 481px) and (max-width: 768px) {
    max-height: 250px;
  }
  
  @media (min-width: 769px) {
    max-height: 300px;
  }
`;

const TodoItem = styled.div<{ completed: boolean }>`
  padding: clamp(6px, 1.5vw, 8px);
  margin-bottom: 8px;
  background-color: ${props => props.theme.backgroundColor};
  border-radius: 4px;
  border-left: 3px solid ${props => props.completed ? props.theme.successColor : props.theme.primaryColor};
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
  cursor: pointer;
  text-decoration: ${props => props.completed ? 'line-through' : 'none'};
  color: ${props => props.completed ? props.theme.textMuted : props.theme.textColor};
  word-break: break-word;
  
  &:hover {
    background-color: ${props => props.theme.hoverBackground};
  }
`;

const EmptyDayMessage = styled.div`
  color: ${props => props.theme.textMuted};
  text-align: center;
  padding: clamp(8px, 2vw, 16px) clamp(4px, 1vw, 8px);
  font-size: clamp(0.7rem, 2vw, 0.85rem);
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
    
    console.log(`开始周视图排序操作，从${sourceDayIso}到${destinationDayIso}`);
    
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
    
    // 手动强制保存至存储
    try {
      // 在状态更新后，通过Promise确保正确的保存顺序
      Promise.resolve().then(() => {
        const currentTodos = store.getState().todos.items;
        console.log(`正在手动保存周视图排序结果，共${currentTodos.length}个任务`);
        
        // 直接调用存储服务保存结果
        storageService.setTodos(currentTodos)
          .then(() => console.log('周视图排序结果保存成功'))
          .catch(error => console.error('周视图排序结果保存失败', error));
      });
    } catch (error) {
      console.error('保存周视图排序结果时出错:', error);
    }
  };
  
  return (
    <WeekViewContainer>
      <WeekHeader>
        <WeekTitle>
          <HiOutlineViewGrid size={20} />
          周视图
        </WeekTitle>
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