import React from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from '../utils/store';
import Todo from './Todo';
import { Todo as TodoType } from '../utils/slices/todosSlice';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { reorderTodos } from '../utils/slices/todosSlice';

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

const DroppableList = styled.div`
  min-height: 5px;
`;

interface TodoListProps {
  listId?: string;  // 当前显示的列表ID，如果为空则显示所有
  filter?: 'all' | 'completed' | 'active' | 'important' | 'myDay';  // 过滤条件
  onTodoClick?: (todoId: string) => void; // 点击任务的回调函数
  customTodos?: TodoType[]; // 自定义待办事项列表，用于外部筛选
}

const TodoList: React.FC<TodoListProps> = ({ 
  listId, 
  filter = 'all', 
  onTodoClick,
  customTodos 
}) => {
  const dispatch = useDispatch();
  const todos = useSelector((state: AppState) => state.todos.items);
  const currentView = useSelector((state: AppState) => state.ui.currentView);
  
  // 如果提供了自定义待办事项列表，则使用它
  const todosToFilter = customTodos || todos;
  
  // 根据当前视图和过滤条件筛选待办事项
  const filteredTodos = customTodos ? todosToFilter : todosToFilter.filter((todo: TodoType) => {
    // 特殊视图处理
    if (listId === 'myDay') {
      return todo.isMyDay;
    }
    
    if (listId === 'important') {
      return todo.isImportant;
    }
    
    if (listId === 'planned') {
      return !!todo.dueDate;
    }
    
    // 如果是自定义列表
    if (listId && !['myDay', 'important', 'planned', 'week'].includes(listId)) {
      return todo.listId === listId;
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
    // 如果有截止日期，按照截止日期排序
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    
    // 如果只有一个有截止日期，有截止日期的排前面
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    
    // 否则按创建时间排序，最新的在前面
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  // 处理拖拽结束事件
  const handleDragEnd = (result: DropResult) => {
    // 如果拖拽到了列表外或没有移动位置，则不做任何处理
    if (!result.destination) {
      return;
    }
    
    // 如果起始位置和目标位置相同，也不做处理
    if (result.destination.index === result.source.index) {
      return;
    }
    
    // 派发重新排序的action
    dispatch(reorderTodos({
      sourceIndex: result.source.index,
      destinationIndex: result.destination.index,
      listId: listId || currentView // 当前列表ID或视图ID
    }));
  };
  
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
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="todo-list">
          {(provided: DroppableProvided) => (
            <DroppableList
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {sortedTodos.map((todo: TodoType, index) => (
                <Draggable key={todo.id} draggableId={todo.id} index={index}>
                  {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        opacity: snapshot.isDragging ? 0.8 : 1
                      }}
                    >
                      <Todo 
                        todo={todo} 
                        onClick={() => {
                          onTodoClick && onTodoClick(todo.id);
                        }}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </DroppableList>
          )}
        </Droppable>
      </DragDropContext>
    </TodoListContainer>
  );
};

export default TodoList; 