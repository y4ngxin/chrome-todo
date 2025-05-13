import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch, AppState } from '../utils/store';
import { addTodo } from '../utils/slices/todosSlice';
import { format, addDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useSelector } from 'react-redux';
import { 
  HiOutlineFlag, 
  HiOutlineSun, 
  HiOutlineStar,
  HiOutlineCalendar,
  HiOutlineClipboardList,
  HiOutlineChevronDown
} from 'react-icons/hi';
import { TodoList } from '../utils/slices/listsSlice';

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  padding: 16px;
  background-color: ${props => props.theme.cardBackground};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  transition: all 0.2s ease;
  
  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 16px;
  }
`;

const InputGroup = styled.div`
  display: flex;
  margin-bottom: 12px;
  position: relative;
  
  @media (max-width: 480px) {
    margin-bottom: 10px;
  }
`;

const Input = styled.input`
  flex-grow: 1;
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 4px;
  padding: 10px 12px;
  font-size: 14px;
  background-color: ${props => props.theme.inputBackground};
  color: ${props => props.theme.textColor};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primaryColor};
    box-shadow: 0 0 0 2px ${props => props.theme.primaryColorLight};
  }
  
  &::placeholder {
    color: ${props => props.theme.textMuted};
  }
  
  @media (max-width: 480px) {
    padding: 8px 10px;
    font-size: 13px;
  }
`;

const AddButton = styled.button`
  background-color: ${props => props.theme.primaryColor};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-left: 8px;
  
  &:hover {
    background-color: ${props => props.theme.primaryColorDark};
  }
  
  &:disabled {
    background-color: ${props => props.theme.disabledColor};
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 13px;
    margin-left: 6px;
  }
`;

const OptionRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
  
  @media (max-width: 480px) {
    margin-top: 6px;
    gap: 4px;
  }
`;

const OptionButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: ${props => props.active ? `${props.theme.primaryColorLight}` : 'transparent'};
  border: 1px solid ${props => props.active ? props.theme.primaryColor : props.theme.borderColor};
  color: ${props => props.active ? props.theme.primaryColor : props.theme.textMuted};
  font-size: 13px;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active ? props.theme.primaryColorLight : props.theme.backgroundHover};
    border-color: ${props => props.active ? props.theme.primaryColor : props.theme.primaryColorLight};
  }
  
  svg {
    font-size: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 5px 7px;
    font-size: 12px;
    
    span {
      display: none;
    }
    
    svg {
      font-size: 16px;
    }
  }
  
  @media (min-width: 481px) and (max-width: 768px) {
    span {
      display: block;
    }
  }
`;

const FormField = styled.div`
  margin-bottom: 10px;
  width: 100%;
`;

const DatePickerContainer = styled.div`
  margin-top: 12px;
  background-color: ${props => props.theme.backgroundSecondary || '#f9f9f9'};
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  
  @media (max-width: 480px) {
    padding: 10px;
    margin-top: 10px;
  }
`;

const DateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  
  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const DateLabel = styled.label`
  color: ${props => props.theme.textColor};
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const DateInput = styled.input`
  padding: 6px 8px;
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 4px;
  background-color: ${props => props.theme.inputBackground};
  color: ${props => props.theme.textColor};
  font-size: 14px;
  flex: 0 0 auto;
  width: 130px;
  
  &:focus {
    border-color: ${props => props.theme.primaryColor};
    outline: none;
  }
  
  @media (max-width: 480px) {
    width: 110px;
    font-size: 13px;
    padding: 5px 6px;
  }
`;

const DateShortcuts = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
  
  @media (max-width: 480px) {
    margin-top: 6px;
    gap: 4px;
  }
`;

const DateShortcutButton = styled.button`
  background-color: transparent;
  color: ${props => props.theme.textColor};
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.theme.hoverBackground};
    border-color: ${props => props.theme.primaryColor};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primaryColor};
  }
  
  @media (max-width: 480px) {
    padding: 3px 6px;
    font-size: 11px;
  }
`;

// 优先级选择组件样式
const PriorityOptions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
  background-color: ${props => props.theme.backgroundSecondary || '#f9f9f9'};
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  
  @media (max-width: 480px) {
    gap: 6px;
    padding: 10px;
    margin-top: 10px;
  }
`;

interface PriorityButtonProps {
  active: boolean;
  priority: 'low' | 'medium' | 'high';
}

const PriorityButton = styled.button<PriorityButtonProps>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid ${props => {
    if (props.active) {
      switch(props.priority) {
        case 'high': return props.theme.errorColor;
        case 'medium': return props.theme.warningColor;
        case 'low': return props.theme.infoColor;
        default: return props.theme.borderColor;
      }
    } else {
      return props.theme.borderColor;
    }
  }};
  background-color: ${props => {
    if (props.active) {
      switch(props.priority) {
        case 'high': return props.theme.errorColorLight;
        case 'medium': return props.theme.warningColorLight;
        case 'low': return props.theme.infoColorLight;
        default: return 'transparent';
      }
    } else {
      return 'transparent';
    }
  }};
  color: ${props => {
    if (props.active) {
      switch(props.priority) {
        case 'high': return props.theme.errorColor;
        case 'medium': return props.theme.warningColor;
        case 'low': return props.theme.infoColor;
        default: return props.theme.textColor;
      }
    } else {
      return props.theme.textMuted;
    }
  }};
  cursor: pointer;
  font-size: 13px;
  font-weight: ${props => props.active ? '500' : 'normal'};
  
  &:hover {
    background-color: ${props => {
      switch(props.priority) {
        case 'high': return props.theme.errorColorLight;
        case 'medium': return props.theme.warningColorLight;
        case 'low': return props.theme.infoColorLight;
        default: return props.theme.backgroundHover;
      }
    }};
  }
  
  @media (max-width: 480px) {
    padding: 5px 10px;
    font-size: 12px;
  }
`;

// 列表选择器组件样式
const ListSelectorContainer = styled.div`
  margin-top: 12px;
  background-color: ${props => props.theme.backgroundSecondary || '#f9f9f9'};
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  
  @media (max-width: 480px) {
    padding: 10px;
    margin-top: 10px;
  }
`;

const ListSelectorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  @media (max-width: 480px) {
    margin-bottom: 6px;
  }
`;

const ListLabel = styled.label`
  color: ${props => props.theme.textColor};
  font-size: 14px;
  font-weight: 500;
  
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const ListSelect = styled.div`
  position: relative;
  width: 100%;
`;

const ListSelectButton = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 8px 12px;
  background-color: ${props => props.theme.inputBackground};
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 4px;
  color: ${props => props.theme.textColor};
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  
  &:hover {
    border-color: ${props => props.theme.primaryColor};
  }
  
  @media (max-width: 480px) {
    padding: 6px 10px;
    font-size: 13px;
  }
`;

const ListDropdown = styled.div<{isOpen: boolean}>`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background-color: ${props => props.theme.cardBackground};
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: ${props => props.isOpen ? 'block' : 'none'};
  margin-top: 4px;
`;

const ListOption = styled.div<{isSelected: boolean}>`
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: ${props => props.isSelected ? props.theme.primaryColorLight : 'transparent'};
  color: ${props => props.isSelected ? props.theme.primaryColor : props.theme.textColor};
  
  &:hover {
    background-color: ${props => props.isSelected ? props.theme.primaryColorLight : props.theme.hoverBackground};
  }
  
  @media (max-width: 480px) {
    padding: 7px 10px;
  }
`;

const ListIcon = styled.span`
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ListName = styled.span`
  font-size: 14px;
  
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

interface AddTodoFormProps {
  listId?: string;
}

const AddTodoForm: React.FC<AddTodoFormProps> = ({ listId }) => {
  const dispatch = useAppDispatch();
  const lists = useSelector((state: AppState) => state.lists.items);
  const activeListId = useSelector((state: AppState) => state.lists.activeListId);
  const currentView = useSelector((state: AppState) => state.ui.currentView);
  
  const [title, setTitle] = useState('');
  const [isMyDay, setIsMyDay] = useState(true);
  const [isImportant, setIsImportant] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | undefined>(undefined);
  const [showPriorityOptions, setShowPriorityOptions] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [showListSelector, setShowListSelector] = useState(false);
  const [showListDropdown, setShowListDropdown] = useState(false);
  
  const listDropdownRef = useRef<HTMLDivElement>(null);
  const listButtonRef = useRef<HTMLButtonElement>(null);
  
  // 根据当前视图自动设置一些属性
  useEffect(() => {
    // 如果当前视图是"我的一天"，则自动设置isMyDay为true
    if (currentView === 'myDay') {
      setIsMyDay(true);
    }
    
    // 如果当前视图是"重要"，则自动设置isImportant为true
    if (currentView === 'important') {
      setIsImportant(true);
    }
    
    // 设置默认选中的列表
    const initialListId = listId || activeListId || 'default';
    setSelectedListId(initialListId);
  }, [currentView, listId, activeListId]);
  
  // 监听点击事件，点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        listDropdownRef.current && 
        listButtonRef.current && 
        !listDropdownRef.current.contains(event.target as Node) &&
        !listButtonRef.current.contains(event.target as Node)
      ) {
        setShowListDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    const now = new Date();
    const targetListId = selectedListId || listId || activeListId || 'default';
    
    const newTodo = {
      id: uuidv4(),
      title: title.trim(),
      completed: false,
      createdAt: now.toISOString(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      listId: targetListId,
      isImportant,
      isMyDay,
      priority,
      notes: '',
      tags: [] as string[],
      steps: [] as any[]
    };
    
    dispatch(addTodo(newTodo));
    
    // 重置表单
    setTitle('');
    // 如果当前视图是特定类型，则不重置对应的状态
    if (currentView !== 'myDay') {
      setIsMyDay(true);
    }
    if (currentView !== 'important') {
      setIsImportant(false);
    }
    setDueDate('');
    setShowDatePicker(false);
    setPriority(undefined);
    setShowPriorityOptions(false);
    setShowListSelector(false);
  };
  
  // 处理优先级设置
  const handleSetPriority = (newPriority: 'low' | 'medium' | 'high') => {
    setPriority(prev => prev === newPriority ? undefined : newPriority);
  };
  
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
  
  // 获取选中列表的名称和图标
  const getSelectedListInfo = () => {
    const list = lists.find((l: TodoList) => l.id === selectedListId);
    return {
      name: list?.name || '默认列表',
      icon: list?.icon || '📋'
    };
  };
  
  // 切换列表选择器
  const toggleListSelector = () => {
    setShowListSelector(!showListSelector);
    
    // 如果显示列表选择器，则隐藏其他选项
    if (!showListSelector) {
      setShowDatePicker(false);
      setShowPriorityOptions(false);
    }
  };
  
  // 切换列表下拉框
  const toggleListDropdown = () => {
    setShowListDropdown(!showListDropdown);
  };
  
  // 选择列表
  const handleSelectList = (listId: string) => {
    setSelectedListId(listId);
    setShowListDropdown(false);
  };
  
  const selectedListInfo = getSelectedListInfo();
  
  return (
    <FormContainer onSubmit={handleSubmit}>
      <InputGroup>
        <Input
          type="text"
          placeholder="添加任务"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <AddButton type="submit" disabled={!title.trim()}>
          添加
        </AddButton>
      </InputGroup>
      
      <OptionRow>
        <OptionButton
          type="button"
          active={isMyDay}
          onClick={() => setIsMyDay(!isMyDay)}
        >
          <HiOutlineSun size={16} />
          <span>我的一天</span>
        </OptionButton>
        
        <OptionButton
          type="button"
          active={isImportant}
          onClick={() => setIsImportant(!isImportant)}
        >
          <HiOutlineStar size={16} />
          <span>重要</span>
        </OptionButton>
        
        <OptionButton
          type="button"
          active={showDatePicker}
          onClick={() => {
            setShowDatePicker(!showDatePicker);
            setShowPriorityOptions(false);
            setShowListSelector(false);
          }}
        >
          <HiOutlineCalendar size={16} />
          <span>日期</span>
        </OptionButton>
        
        <OptionButton
          type="button"
          active={showPriorityOptions}
          onClick={() => {
            setShowPriorityOptions(!showPriorityOptions);
            setShowDatePicker(false);
            setShowListSelector(false);
          }}
        >
          <HiOutlineFlag size={16} />
          <span>优先级</span>
        </OptionButton>
        
        <OptionButton
          type="button"
          active={showListSelector}
          onClick={() => {
            toggleListSelector();
          }}
        >
          <HiOutlineClipboardList size={16} />
          <span>列表</span>
        </OptionButton>
      </OptionRow>
      
      {showDatePicker && (
        <DatePickerContainer>
          <DateRow>
            <DateLabel>截止日期:</DateLabel>
            <DateInput
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
          </DateRow>
          <DateShortcuts>
            <DateShortcutButton 
              type="button" 
              onClick={() => handleDateShortcut('today')}
            >
              今天
            </DateShortcutButton>
            <DateShortcutButton 
              type="button" 
              onClick={() => handleDateShortcut('tomorrow')}
            >
              明天
            </DateShortcutButton>
            <DateShortcutButton 
              type="button" 
              onClick={() => handleDateShortcut('nextWeek')}
            >
              下周
            </DateShortcutButton>
            <DateShortcutButton 
              type="button" 
              onClick={() => handleDateShortcut('nextWeekend')}
            >
              周末
            </DateShortcutButton>
            <DateShortcutButton 
              type="button" 
              onClick={() => handleDateShortcut('clear')}
            >
              清除
            </DateShortcutButton>
          </DateShortcuts>
        </DatePickerContainer>
      )}
      
      {showPriorityOptions && (
        <PriorityOptions>
          <PriorityButton 
            type="button"
            priority="low"
            active={priority === 'low'}
            onClick={() => handleSetPriority('low')}
          >
            <HiOutlineFlag size={16} />
            低
          </PriorityButton>
          <PriorityButton 
            type="button"
            priority="medium"
            active={priority === 'medium'}
            onClick={() => handleSetPriority('medium')}
          >
            <HiOutlineFlag size={16} />
            中
          </PriorityButton>
          <PriorityButton 
            type="button"
            priority="high"
            active={priority === 'high'}
            onClick={() => handleSetPriority('high')}
          >
            <HiOutlineFlag size={16} />
            高
          </PriorityButton>
        </PriorityOptions>
      )}
      
      {showListSelector && (
        <ListSelectorContainer>
          <ListSelectorHeader>
            <ListLabel>选择列表:</ListLabel>
          </ListSelectorHeader>
          <ListSelect>
            <ListSelectButton 
              ref={listButtonRef}
              type="button" 
              onClick={toggleListDropdown}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ListIcon>{selectedListInfo.icon}</ListIcon>
                <ListName>{selectedListInfo.name}</ListName>
              </div>
              <HiOutlineChevronDown />
            </ListSelectButton>
            
            <ListDropdown ref={listDropdownRef} isOpen={showListDropdown}>
              {lists.map((list: TodoList) => (
                <ListOption 
                  key={list.id}
                  isSelected={selectedListId === list.id}
                  onClick={() => handleSelectList(list.id)}
                >
                  <ListIcon>{list.icon || '📋'}</ListIcon>
                  <ListName>{list.name}</ListName>
                </ListOption>
              ))}
            </ListDropdown>
          </ListSelect>
        </ListSelectorContainer>
      )}
    </FormContainer>
  );
};

export default AddTodoForm; 