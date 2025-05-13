import React, { useState } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { addList } from '../utils/slices/listsSlice';

interface AddListFormProps {
  onClose: () => void;
  isCollapsed: boolean;
}

interface FormContainerProps {
  isCollapsed: boolean;
}

const FormContainer = styled.div<FormContainerProps>`
  position: absolute;
  left: ${props => props.isCollapsed ? '60px' : '240px'};
  top: 50px;
  width: 250px;
  background-color: ${props => props.theme.cardBackground};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  z-index: 100;
`;

const FormTitle = styled.h3`
  font-size: 16px;
  margin-bottom: 16px;
  color: ${props => props.theme.textColor};
`;

const FormInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 4px;
  font-size: 14px;
  background-color: ${props => props.theme.inputBackground};
  color: ${props => props.theme.textColor};
  margin-bottom: 16px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primaryColor};
    box-shadow: 0 0 0 2px ${props => props.theme.primaryColorLight};
  }
`;

const IconSelector = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const IconOption = styled.div<{ isSelected: boolean }>`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${props => props.isSelected ? props.theme.primaryColorLight : props.theme.backgroundHover};
  
  &:hover {
    background-color: ${props => props.isSelected ? props.theme.primaryColorLight : props.theme.activeItemBackground};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const CancelButton = styled(Button)`
  background-color: transparent;
  color: ${props => props.theme.textMuted};
  
  &:hover {
    background-color: ${props => props.theme.backgroundHover};
  }
`;

const SaveButton = styled(Button)<{ disabled: boolean }>`
  background-color: ${props => props.disabled ? props.theme.disabledColor : props.theme.primaryColor};
  color: white;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  
  &:hover {
    background-color: ${props => props.disabled ? props.theme.disabledColor : props.theme.primaryColorDark};
  }
`;

const iconsOptions = [
  '📋', '📝', '📑', '📔', '📚', '📒', '📃',
  '🏠', '💼', '🛒', '🎯', '🎬', '🎮', '💡',
  '🎓', '🏆', '🚗', '✈️', '🔔', '❤️', '⭐'
];

const AddListForm: React.FC<AddListFormProps> = ({ onClose, isCollapsed }) => {
  const dispatch = useDispatch();
  const [listName, setListName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📋');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!listName.trim()) return;
    
    const newList = {
      id: uuidv4(),
      name: listName.trim(),
      icon: selectedIcon,
      color: '#0078d7',
      createdAt: new Date().toISOString(),
    };
    
    dispatch(addList(newList));
    onClose();
  };
  
  return (
    <FormContainer isCollapsed={isCollapsed}>
      <FormTitle>新建列表</FormTitle>
      <form onSubmit={handleSubmit}>
        <FormInput
          type="text"
          placeholder="列表名称"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          autoFocus
        />
        
        <IconSelector>
          {iconsOptions.map((icon) => (
            <IconOption
              key={icon}
              isSelected={selectedIcon === icon}
              onClick={() => setSelectedIcon(icon)}
            >
              {icon}
            </IconOption>
          ))}
        </IconSelector>
        
        <ButtonGroup>
          <CancelButton type="button" onClick={onClose}>
            取消
          </CancelButton>
          <SaveButton
            type="submit"
            disabled={!listName.trim()}
          >
            保存
          </SaveButton>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
};

export default AddListForm; 