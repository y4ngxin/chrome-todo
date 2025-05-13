import React, { useState } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch, AppState } from '../utils/store';
import { addTodo } from '../utils/slices/todosSlice';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useSelector } from 'react-redux';

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  padding: 16px;
  background-color: ${props => props.theme.cardBackground};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const InputGroup = styled.div`
  display: flex;
  margin-bottom: 12px;
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
  
  &:hover {
    background-color: ${props => props.theme.primaryColorDark};
  }
  
  &:disabled {
    background-color: ${props => props.theme.disabledColor};
    cursor: not-allowed;
  }
`;

const OptionRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
`;

const OptionButton = styled.button<{ active?: boolean }>`
  background-color: transparent;
  border: none;
  color: ${props => props.active ? props.theme.primaryColor : props.theme.textMuted};
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme.backgroundHover};
  }
`;

const FormField = styled.div`
  margin-bottom: 10px;
  width: 100%;
`;

const DatePickerContainer = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
`;

const DateLabel = styled.label`
  margin-bottom: 4px;
  color: ${props => props.theme.textMuted};
  font-size: 14px;
`;

const DateInput = styled.input`
  padding: 8px;
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 4px;
  background-color: ${props => props.theme.inputBackground};
  color: ${props => props.theme.textColor};
  font-size: 14px;
  
  &:focus {
    border-color: ${props => props.theme.primaryColor};
    outline: none;
  }
`;

interface AddTodoFormProps {
  listId?: string;
}

const AddTodoForm: React.FC<AddTodoFormProps> = ({ listId }) => {
  const dispatch = useAppDispatch();
  const lists = useSelector((state: AppState) => state.lists.items);
  const activeListId = useSelector((state: AppState) => state.lists.activeListId);
  
  const [title, setTitle] = useState('');
  const [isMyDay, setIsMyDay] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    const now = new Date();
    const targetListId = listId || activeListId || 'default';
    
    const newTodo = {
      id: uuidv4(),
      title: title.trim(),
      completed: false,
      createdAt: now.toISOString(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      listId: targetListId,
      isImportant,
      isMyDay,
    };
    
    dispatch(addTodo(newTodo));
    
    // 重置表单
    setTitle('');
    setIsMyDay(false);
    setIsImportant(false);
    setDueDate('');
    setShowDatePicker(false);
  };
  
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
        <div>
          <OptionButton
            type="button"
            active={isMyDay}
            onClick={() => setIsMyDay(!isMyDay)}
          >
            我的一天
          </OptionButton>
          
          <OptionButton
            type="button"
            active={isImportant}
            onClick={() => setIsImportant(!isImportant)}
          >
            重要
          </OptionButton>
          
          <OptionButton
            type="button"
            active={showDatePicker}
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            日期
          </OptionButton>
        </div>
      </OptionRow>
      
      {showDatePicker && (
        <DatePickerContainer>
          <DateLabel>截止日期</DateLabel>
          <DateInput
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={format(new Date(), 'yyyy-MM-dd')}
          />
        </DatePickerContainer>
      )}
    </FormContainer>
  );
};

export default AddTodoForm; 