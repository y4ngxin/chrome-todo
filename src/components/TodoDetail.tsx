import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { useAppDispatch, AppState } from '../utils/store';
import { useSelector } from 'react-redux';
import { Todo, TodoStep, updateTodo, addStep, removeStep, toggleStepCompleted } from '../utils/slices/todosSlice';
import { format, parseISO, isValid } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';
import { 
  HiOutlineStar, 
  HiStar, 
  HiOutlineSun, 
  HiSun, 
  HiCalendar,
  HiX, 
  HiCheck,
  HiPlus, 
  HiOutlineTrash
} from 'react-icons/hi';

// 主容器
const DetailContainer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 380px;
  height: 100vh;
  background-color: ${props => props.theme.cardBackground};
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transform: translateX(${props => props.isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
  overflow: hidden;
  will-change: transform;
  
  @media (min-width: 800px) {
    width: 450px;
  }
  
  @media (min-width: 1200px) {
    width: 500px;
  }
  
  @media (max-width: 460px) {
    width: 100%;
  }
`;

// 详情头部
const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.borderColor};
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.textMuted};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 4px;
  
  &:hover {
    background-color: ${props => props.theme.hoverBackground};
    color: ${props => props.theme.textColor};
  }
`;

// 详情内容
const DetailContent = styled.div`
  flex-grow: 1;
  padding: 16px;
  overflow-y: auto;
`;

// 任务标题
const TitleSection = styled.div`
  margin-bottom: 20px;
`;

const TodoTitle = styled.input`
  font-size: 1.5rem;
  font-weight: 600;
  width: 100%;
  border: none;
  background: transparent;
  color: ${props => props.theme.textColor};
  padding: 8px 0;
  
  &:focus {
    outline: none;
    border-bottom: 2px solid ${props => props.theme.primaryColor};
  }
`;

// 操作按钮
const ActionSection = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  margin-bottom: 20px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  border: none;
  background-color: ${props => props.theme.buttonBackground};
  color: ${props => props.theme.buttonText};
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.theme.buttonHoverBackground};
  }
  
  &.active {
    color: ${props => props.theme.primaryColor};
    background-color: ${props => props.theme.primaryColorLight};
  }
`;

// 日期选择器
const DateSection = styled.div`
  margin-bottom: 20px;
`;

const DateLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  color: ${props => props.theme.textMuted};
  font-size: 14px;
`;

const DateInput = styled.input`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 4px;
  background-color: ${props => props.theme.inputBackground};
  color: ${props => props.theme.textColor};
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primaryColor};
  }
`;

// 备注部分
const NotesSection = styled.div`
  margin-bottom: 20px;
`;

const NotesLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  color: ${props => props.theme.textMuted};
  font-size: 14px;
`;

const NotesTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 4px;
  background-color: ${props => props.theme.inputBackground};
  color: ${props => props.theme.textColor};
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primaryColor};
  }
`;

// 步骤部分
const StepsSection = styled.div`
  margin-bottom: 20px;
`;

const StepsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const StepsLabel = styled.label`
  color: ${props => props.theme.textMuted};
  font-size: 14px;
`;

const AddStepButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.textColor};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  
  &:hover {
    color: ${props => props.theme.primaryColor};
  }
`;

const StepsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const StepItem = styled.li`
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid ${props => props.theme.borderColor};
  
  &:last-child {
    border-bottom: none;
  }
`;

const StepCheckbox = styled.div<{ checked: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid ${props => props.checked ? props.theme.primaryColor : props.theme.borderColor};
  background-color: ${props => props.checked ? props.theme.primaryColor : 'transparent'};
  margin-right: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    color: white;
    display: ${props => props.checked ? 'block' : 'none'};
  }
`;

const StepInput = styled.input<{ completed: boolean }>`
  flex-grow: 1;
  border: none;
  background: transparent;
  color: ${props => props.completed ? props.theme.textMuted : props.theme.textColor};
  text-decoration: ${props => props.completed ? 'line-through' : 'none'};
  
  &:focus {
    outline: none;
  }
`;

const RemoveStepButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.textMuted};
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${StepItem}:hover & {
    opacity: 1;
  }
  
  &:hover {
    color: ${props => props.theme.errorColor};
  }
`;

// 添加新步骤的输入框
const NewStepInput = styled.div`
  display: flex;
  align-items: center;
  margin-top: 12px;
  padding: 8px 0;
`;

const StepPlusIcon = styled.div`
  width: 18px;
  height: 18px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.textMuted};
`;

const NewStepField = styled.input`
  flex-grow: 1;
  border: none;
  background: transparent;
  color: ${props => props.theme.textColor};
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: ${props => props.theme.textMuted};
  }
`;

interface TodoDetailProps {
  todoId: string | null;
  onClose: () => void;
}

// 渲染空的详情组件
const EmptyDetail: React.FC<{isOpen: boolean; onClose: () => void}> = ({ isOpen, onClose }) => {
  return (
    <DetailContainer isOpen={isOpen}>
      <DetailHeader>
        <div />
        <CloseButton onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}>
          <HiX size={24} />
        </CloseButton>
      </DetailHeader>
      <DetailContent>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          任务详情加载中...
        </div>
      </DetailContent>
    </DetailContainer>
  );
};

const TodoDetail: React.FC<TodoDetailProps> = ({ todoId, onClose }) => {
  const dispatch = useAppDispatch();
  const todos = useSelector((state: AppState) => state.todos.items);
  const todo = todos.find(t => t.id === todoId);
  const isOpen = !!todoId;
  
  // 本地状态，编辑时使用
  const [title, setTitle] = useState('');
  const [isMyDay, setIsMyDay] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [steps, setSteps] = useState<TodoStep[]>([]);
  const [newStepText, setNewStepText] = useState('');
  
  // 新步骤输入框引用，用于自动聚焦
  const newStepInputRef = useRef<HTMLInputElement>(null);

  // 防止过于频繁的保存，只在状态稳定后保存
  const [shouldSave, setShouldSave] = useState(false);
  
  // 保存更改到Redux - 确保useCallback在条件判断前调用
  const saveChanges = useCallback(() => {
    if (!todo || !shouldSave) return;
    
    try {
      // 创建安全的更新对象，确保所有必需字段存在
      const safeUpdate = {
        id: todo.id,
        title: title || "无标题任务",
        isMyDay: isMyDay || false,
        isImportant: isImportant || false,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        notes: notes || undefined,
        steps: steps || [],
        // 不要更新这些字段，防止循环更新
        // completed: todo.completed,
        // listId: todo.listId,
        // createdAt: todo.createdAt
      };
      
      dispatch(updateTodo(safeUpdate));
      // 移除过多的日志
      // console.log('Saved changes for todo:', safeUpdate);
      
      // 重置保存标志
      setShouldSave(false);
    } catch (error) {
      console.error('Error saving todo:', error);
    }
  }, [dispatch, todo, title, isMyDay, isImportant, dueDate, notes, steps, shouldSave]);
  
  // 当todo变化时更新本地状态
  useEffect(() => {
    try {
      if (todo) {
        // 防止不必要的状态更新，只在数据变化时更新
        const newTitle = todo.title || '';
        const newIsMyDay = todo.isMyDay || false;
        const newIsImportant = todo.isImportant || false;
        const newDueDate = todo.dueDate && isValid(parseISO(todo.dueDate)) 
          ? format(parseISO(todo.dueDate), 'yyyy-MM-dd') 
          : '';
        const newNotes = todo.notes || '';
        const newSteps = Array.isArray(todo.steps) ? todo.steps : [];
        
        if (title !== newTitle) setTitle(newTitle);
        if (isMyDay !== newIsMyDay) setIsMyDay(newIsMyDay);
        if (isImportant !== newIsImportant) setIsImportant(newIsImportant);
        if (dueDate !== newDueDate) setDueDate(newDueDate);
        if (notes !== newNotes) setNotes(newNotes);
        // 深度比较会很昂贵，所以简单赋值
        setSteps(newSteps);
      }
    } catch (error) {
      console.error('Error updating local state from todo:', error);
    }
  }, [todo]);

  // 使用防抖保存，减少保存频率
  useEffect(() => {
    if (!todo) return;
    
    // 标记需要保存
    setShouldSave(true);
    
    // 延迟500ms保存，减少频繁更新
    const timerId = setTimeout(() => {
      saveChanges();
    }, 500);
    
    return () => clearTimeout(timerId);
  }, [title, isMyDay, isImportant, dueDate, notes, steps, todo, saveChanges]);
  
  // 如果没有todo，显示空详情页
  if (!todo) {
    return <EmptyDetail isOpen={isOpen} onClose={onClose} />;
  }
  
  // 切换"我的一天"状态
  const handleToggleMyDay = () => {
    setIsMyDay(prev => !prev);
  };
  
  // 切换重要状态
  const handleToggleImportant = () => {
    setIsImportant(prev => !prev);
  };
  
  // 添加新步骤
  const handleAddStep = () => {
    if (!newStepText.trim() || !todo) return;
    
    try {
      const newStep: TodoStep = {
        id: uuidv4(),
        title: newStepText.trim(),
        completed: false
      };
      
      const safeSteps = Array.isArray(steps) ? [...steps, newStep] : [newStep];
      
      dispatch(addStep({ todoId: todo.id, step: newStep }));
      setSteps(safeSteps);
      setNewStepText('');
      
      // 添加后保持输入框焦点
      if (newStepInputRef.current) {
        newStepInputRef.current.focus();
      }
    } catch (error) {
      console.error('Error adding step:', error);
    }
  };
  
  // 处理键盘事件（回车添加新步骤）
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddStep();
    }
  };
  
  // 删除步骤
  const handleRemoveStep = (stepId: string) => {
    if (!todo) return;
    
    try {
      dispatch(removeStep({ todoId: todo.id, stepId }));
      setSteps(steps.filter(step => step && step.id !== stepId));
    } catch (error) {
      console.error('Error removing step:', error);
    }
  };
  
  // 切换步骤完成状态
  const handleToggleStep = (stepId: string) => {
    if (!todo) return;
    
    try {
      dispatch(toggleStepCompleted({ todoId: todo.id, stepId }));
      setSteps(steps.map(step => 
        step && step.id === stepId 
          ? { ...step, completed: !step.completed } 
          : step
      ));
    } catch (error) {
      console.error('Error toggling step:', error);
    }
  };
  
  // 更新步骤标题
  const handleUpdateStepTitle = (stepId: string, newTitle: string) => {
    if (!todo) return;
    
    try {
      setSteps(steps.map(step => 
        step && step.id === stepId 
          ? { ...step, title: newTitle } 
          : step
      ));
    } catch (error) {
      console.error('Error updating step title:', error);
    }
  };
  
  return (
    <DetailContainer isOpen={isOpen}>
      <DetailHeader>
        <div />
        <CloseButton onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}>
          <HiX size={24} />
        </CloseButton>
      </DetailHeader>
      
      <DetailContent>
        <TitleSection>
          <TodoTitle 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="任务标题"
          />
        </TitleSection>
        
        <ActionSection>
          <ActionButton 
            className={isMyDay ? 'active' : ''}
            onClick={handleToggleMyDay}
          >
            {isMyDay ? <HiSun size={18} /> : <HiOutlineSun size={18} />}
            我的一天
          </ActionButton>
          
          <ActionButton 
            className={isImportant ? 'active' : ''}
            onClick={handleToggleImportant}
          >
            {isImportant ? <HiStar size={18} /> : <HiOutlineStar size={18} />}
            重要
          </ActionButton>
        </ActionSection>
        
        <DateSection>
          <DateLabel>截止日期</DateLabel>
          <DateInput 
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </DateSection>
        
        <StepsSection>
          <StepsHeader>
            <StepsLabel>步骤</StepsLabel>
          </StepsHeader>
          
          <StepsList>
            {Array.isArray(steps) && steps.map(step => 
              step && step.id ? (
                <StepItem key={step.id}>
                  <StepCheckbox 
                    checked={step.completed || false}
                    onClick={() => handleToggleStep(step.id)}
                  >
                    <HiCheck size={12} />
                  </StepCheckbox>
                  <StepInput 
                    value={step.title || ''}
                    onChange={(e) => handleUpdateStepTitle(step.id, e.target.value)}
                    completed={step.completed || false}
                  />
                  <RemoveStepButton onClick={() => handleRemoveStep(step.id)}>
                    <HiOutlineTrash size={16} />
                  </RemoveStepButton>
                </StepItem>
              ) : null
            )}
          </StepsList>
          
          <NewStepInput>
            <StepPlusIcon>
              <HiPlus size={16} />
            </StepPlusIcon>
            <NewStepField 
              ref={newStepInputRef}
              value={newStepText}
              onChange={(e) => setNewStepText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="添加步骤"
            />
            {newStepText.trim() && (
              <AddStepButton onClick={handleAddStep}>
                添加
              </AddStepButton>
            )}
          </NewStepInput>
        </StepsSection>
        
        <NotesSection>
          <NotesLabel>备注</NotesLabel>
          <NotesTextarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="添加备注..."
          />
        </NotesSection>
      </DetailContent>
    </DetailContainer>
  );
};

// 使用React.memo包裹组件，避免不必要的重新渲染
export default React.memo(TodoDetail); 