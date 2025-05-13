import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { useAppDispatch, AppState } from '../utils/store';
import { useSelector } from 'react-redux';
import { Todo, TodoStep, updateTodo, addStep, removeStep, toggleStepCompleted, toggleMyDay, toggleImportant, toggleCompleted, removeTodo } from '../utils/slices/todosSlice';
import { format, parseISO, isValid, addDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';
import type { Tag } from '../utils/slices/tagsSlice';
import { 
  HiOutlineStar, 
  HiStar, 
  HiOutlineSun, 
  HiSun, 
  HiCalendar,
  HiX, 
  HiCheck,
  HiPlus, 
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineFlag,
  HiOutlineExclamation,
  HiOutlineExclamationCircle,
  HiSelector
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
  
  /* 响应式适配 */
  @media (min-width: 769px) and (max-width: 1024px) {
    width: 40%;
  }
  
  @media (min-width: 1025px) {
    width: 400px;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    box-shadow: none;
  }
`;

// 详情头部
const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.borderColor};
  
  @media (max-width: 480px) {
    padding: 14px 12px;
  }
`;

// 关闭按钮
const CloseButton = styled.button`
  background: transparent;
  border: none;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: ${props => props.theme.textMuted};
  cursor: pointer;
  padding: 0;
  
  &:hover {
    background-color: ${props => props.theme.hoverBackground};
    color: ${props => props.theme.textColor};
  }
  
  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
  }
`;

// 详情标题
const DetailTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

// 内容区域
const DetailContent = styled.div`
  flex-grow: 1;
  padding: 16px;
  overflow-y: auto;
  
  @media (max-width: 480px) {
    padding: 12px;
  }
`;

// 表单部分
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  @media (max-width: 480px) {
    gap: 12px;
  }
`;

// 任务标题输入
const TitleInput = styled.input`
  font-size: 18px;
  font-weight: 500;
  border: none;
  border-bottom: 1px solid ${props => props.theme.borderColor};
  padding: 8px 0;
  background-color: transparent;
  color: ${props => props.theme.textColor};
  width: 100%;
  
  &:focus {
    outline: none;
    border-bottom-color: ${props => props.theme.primaryColor};
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
    padding: 6px 0;
  }
`;

// 任务操作按钮组
const ActionButtonsGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: wrap;
  
  @media (max-width: 480px) {
    justify-content: space-between;
    margin-top: 12px;
  }
`;

// 操作按钮
const ActionButton = styled.button<{active?: boolean}>`
  background-color: ${props => props.active ? props.theme.primaryColor : 'transparent'};
  color: ${props => props.active ? props.theme.textOnPrimary : props.theme.textColor};
  border: 1px solid ${props => props.active ? props.theme.primaryColor : props.theme.borderColor};
  padding: 8px 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active ? props.theme.primaryColorHover : props.theme.hoverBackground};
  }
  
  @media (max-width: 480px) {
    padding: 6px 10px;
    font-size: 0.9rem;
    flex: 1 0 calc(50% - 8px);
  }
`;

// 备注容器
const NotesContainer = styled.div`
  margin-top: 24px;
  
  @media (max-width: 480px) {
    margin-top: 16px;
  }
`;

// 备注标题
const NotesTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

// 备注内容输入
const NotesInput = styled.textarea`
  width: 100%;
  min-height: 120px;
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 4px;
  padding: 8px;
  background-color: ${props => props.theme.inputBackground || 'transparent'};
  color: ${props => props.theme.textColor};
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primaryColor};
  }
  
  @media (max-width: 480px) {
    min-height: 100px;
  }
`;

// 删除按钮
const DeleteButton = styled.button`
  background-color: ${props => props.theme.errorColor};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => `${props.theme.errorColor}dd`};
  }
  
  @media (max-width: 480px) {
    margin-top: 20px;
    padding: 10px 16px;
    width: 100%;
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
  const todo = todos.find((t: Todo) => t.id === todoId);
  const isOpen = !!todoId;
  
  // 状态管理
  const [title, setTitle] = useState(todo?.title || '');
  const [notes, setNotes] = useState(todo?.notes || '');
  const [dueDate, setDueDate] = useState(todo?.dueDate ? todo.dueDate.split('T')[0] : '');
  const [isMyDay, setIsMyDay] = useState(todo?.isMyDay || false);
  const [isImportant, setIsImportant] = useState(todo?.isImportant || false);
  const [steps, setSteps] = useState<TodoStep[]>(todo?.steps || []);
  const [newStepText, setNewStepText] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | undefined>(todo?.priority);
  const [tags, setTags] = useState<string[]>(todo?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [showTagsList, setShowTagsList] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [completed, setCompleted] = useState(todo?.completed || false);
  
  const allTags = useSelector((state: AppState) => state.tags.items);
  
  // 新步骤输入框引用，用于自动聚焦
  const newStepInputRef = useRef<HTMLInputElement>(null);

  // 防止过于频繁的保存，只在状态稳定后保存
  const [shouldSave, setShouldSave] = useState(false);
  
  // 保存更改到Redux - 确保useCallback在条件判断前调用
  const saveChanges = useCallback(() => {
    if (!todo || !shouldSave) return;
    
    try {
      // 创建安全的更新对象，确保所有必需字段存在
      const updates: Partial<Todo> = {
        title: title || "无标题任务",
        isMyDay,
        isImportant,
        priority,
        tags,
        notes,
        steps: steps || []
      };
      
      // 只有当dueDate有值时才添加到更新对象中
      if (dueDate) {
        updates.dueDate = new Date(dueDate).toISOString();
      }
      
      // 使用updateTodo action更新任务
      dispatch(updateTodo({ 
        id: todo.id, 
        updates 
      }));
      
      // 重置保存标志
      setShouldSave(false);
    } catch (error) {
      console.error('Error saving todo:', error);
    }
  }, [dispatch, todo, title, isMyDay, isImportant, dueDate, notes, steps, priority, tags, shouldSave]);
  
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
        const newPriority = todo.priority || undefined;
        const newTags = Array.isArray(todo.tags) ? todo.tags : [];
        
        if (title !== newTitle) setTitle(newTitle);
        if (isMyDay !== newIsMyDay) setIsMyDay(newIsMyDay);
        if (isImportant !== newIsImportant) setIsImportant(newIsImportant);
        if (dueDate !== newDueDate) setDueDate(newDueDate);
        if (notes !== newNotes) setNotes(newNotes);
        // 深度比较会很昂贵，所以简单赋值
        setSteps(newSteps);
        if (priority !== newPriority) setPriority(newPriority);
        if (tags !== newTags) setTags(newTags);
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
  }, [title, isMyDay, isImportant, dueDate, notes, steps, priority, tags, todo, saveChanges]);
  
  // 如果没有todo，显示空详情页
  if (!todo) {
    return <EmptyDetail isOpen={isOpen} onClose={onClose} />;
  }
  
  // 切换"我的一天"状态
  const handleToggleMyDay = () => {
    setIsMyDay(!isMyDay);
    if (todo) {
      dispatch(toggleMyDay(todo.id));
    }
  };
  
  // 切换重要状态
  const handleToggleImportant = () => {
    setIsImportant(!isImportant);
    if (todo) {
      dispatch(toggleImportant(todo.id));
    }
  };
  
  // 切换完成状态
  const handleToggleCompleted = () => {
    setCompleted(!completed);
    if (todo) {
      dispatch(toggleCompleted(todo.id));
    }
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
  
  // 设置优先级
  const handleSetPriority = (newPriority: 'low' | 'medium' | 'high') => {
    setPriority(prev => prev === newPriority ? undefined : newPriority);
  };
  
  // 添加标签
  const handleAddTag = () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) return;
    
    setTags([...tags, newTag.trim()]);
    setNewTag('');
  };
  
  // 从已有标签中选择
  const handleSelectTag = (tagName: string) => {
    if (!tagName || tags.includes(tagName)) return;
    
    setTags([...tags, tagName]);
    setShowTagsList(false);
    setNewTag('');
  };
  
  // 切换标签列表显示
  const toggleTagsList = () => {
    setShowTagsList(!showTagsList);
  };
  
  // 删除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // 按Enter键添加标签
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      setShowTagsList(false);
    }
  };
  
  // 按Enter键添加步骤
  const handleStepKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddStep();
    }
  };
  
  // 处理日期快捷选项
  const handleDateShortcut = (shortcut: 'today' | 'tomorrow' | 'nextWeek' | 'nextWeekend' | 'clear') => {
    switch (shortcut) {
      case 'today':
        setDueDate(format(new Date(), 'yyyy-MM-dd'));
        break;
      case 'tomorrow':
        setDueDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
        break;
      case 'nextWeek':
        setDueDate(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
        break;
      case 'nextWeekend':
        // 获取下一个周六
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 是周日，6 是周六
        const daysUntilSaturday = dayOfWeek === 6 ? 7 : 6 - dayOfWeek;
        setDueDate(format(addDays(today, daysUntilSaturday), 'yyyy-MM-dd'));
        break;
      case 'clear':
        setDueDate('');
        break;
    }
  };
  
  const handleDelete = () => {
    dispatch(removeTodo(todo.id));
    onClose();
  };
  
  return (
    <DetailContainer isOpen={isOpen}>
      <DetailHeader>
        <DetailTitle>任务详情</DetailTitle>
        <CloseButton onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}>
          <HiX size={24} />
        </CloseButton>
      </DetailHeader>
      
      <DetailContent>
        <Form>
          <TitleInput 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入任务标题"
          />
          
          <ActionButtonsGroup>
            <ActionButton 
              active={isMyDay}
              onClick={handleToggleMyDay}
            >
              {isMyDay ? <HiSun size={18} /> : <HiOutlineSun size={18} />}
              我的一天
            </ActionButton>
            
            <ActionButton 
              active={isImportant}
              onClick={handleToggleImportant}
            >
              {isImportant ? <HiStar size={18} /> : <HiOutlineStar size={18} />}
              重要
            </ActionButton>
            
            <ActionButton 
              active={!!dueDate}
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              <HiCalendar size={18} />
              {dueDate ? format(parseISO(dueDate), 'yyyy-MM-dd') : '截止日期'}
            </ActionButton>
            
            <ActionButton 
              active={completed}
              onClick={handleToggleCompleted}
            >
              <HiCheck size={18} />
              {completed ? '已完成' : '完成'}
            </ActionButton>
          </ActionButtonsGroup>
          
          {/* 日期选择区域 */}
          {showDatePicker && (
            <div>
              <input 
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ marginBottom: '8px', width: '100%' }}
              />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => handleDateShortcut('today')}>今天</button>
                <button type="button" onClick={() => handleDateShortcut('tomorrow')}>明天</button>
                <button type="button" onClick={() => handleDateShortcut('nextWeek')}>下周</button>
                <button type="button" onClick={() => handleDateShortcut('clear')}>清除</button>
              </div>
            </div>
          )}
          
          {/* 优先级选择 */}
          <div>
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>优先级</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button"
                onClick={() => handleSetPriority('low')}
                style={{ 
                  background: priority === 'low' ? '#e3f1fa' : 'transparent',
                  color: priority === 'low' ? '#0078d4' : 'inherit',
                  border: '1px solid #ccc',
                  padding: '6px 12px',
                  borderRadius: '4px'
                }}
              >
                <HiOutlineFlag size={16} style={{ marginRight: '4px' }} />
                低
              </button>
              <button 
                type="button"
                onClick={() => handleSetPriority('medium')}
                style={{ 
                  background: priority === 'medium' ? '#fff5cc' : 'transparent',
                  color: priority === 'medium' ? '#805b00' : 'inherit',
                  border: '1px solid #ccc',
                  padding: '6px 12px',
                  borderRadius: '4px'
                }}
              >
                <HiOutlineExclamation size={16} style={{ marginRight: '4px' }} />
                中
              </button>
              <button 
                type="button"
                onClick={() => handleSetPriority('high')}
                style={{ 
                  background: priority === 'high' ? '#fde7e9' : 'transparent',
                  color: priority === 'high' ? '#c42b1c' : 'inherit',
                  border: '1px solid #ccc',
                  padding: '6px 12px',
                  borderRadius: '4px'
                }}
              >
                <HiOutlineExclamationCircle size={16} style={{ marginRight: '4px' }} />
                高
              </button>
            </div>
          </div>
          
          {/* 步骤区域 */}
          <div>
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>步骤</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {Array.isArray(steps) && steps.map(step => 
                step && step.id ? (
                  <li key={step.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '8px 0',
                    borderBottom: '1px solid #eee'
                  }}>
                    <div 
                      onClick={() => handleToggleStep(step.id)}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: `2px solid ${step.completed ? '#0078d4' : '#ccc'}`,
                        backgroundColor: step.completed ? '#0078d4' : 'transparent',
                        marginRight: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      {step.completed && <HiCheck size={12} color="white" />}
                    </div>
                    <input 
                      value={step.title || ''}
                      onChange={(e) => handleUpdateStepTitle(step.id, e.target.value)}
                      style={{
                        flex: 1,
                        border: 'none',
                        background: 'transparent',
                        textDecoration: step.completed ? 'line-through' : 'none',
                        color: step.completed ? '#666' : 'inherit'
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveStep(step.id);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#666',
                        padding: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <HiOutlineTrash size={16} />
                    </button>
                  </li>
                ) : null
              )}
            </ul>
            
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '12px' }}>
              <div style={{ 
                width: '18px', 
                height: '18px', 
                marginRight: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <HiPlus size={16} color="#666" />
              </div>
              <input
                value={newStepText}
                onChange={(e) => setNewStepText(e.target.value)}
                placeholder="添加步骤"
                onKeyDown={handleKeyDown}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent'
                }}
              />
            </div>
          </div>
          
          <NotesContainer>
            <NotesTitle>备注</NotesTitle>
            <NotesInput
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="添加备注..."
            />
          </NotesContainer>
          
          <DeleteButton onClick={handleDelete}>
            <HiOutlineTrash size={18} />
            删除任务
          </DeleteButton>
        </Form>
      </DetailContent>
    </DetailContainer>
  );
};

// 使用React.memo包裹组件，避免不必要的重新渲染
export default React.memo(TodoDetail); 