import React from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../utils/store';
import { toggleTheme, toggleSidebarWidth } from '../utils/slices/uiSlice';

const HeaderContainer = styled.header`
  padding: 16px;
  background-color: ${props => props.theme.primaryColor};
  color: ${props => props.theme.textOnPrimary};
  display: flex;
  align-items: center;
`;

const MenuButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.textOnPrimary};
  font-size: 20px;
  cursor: pointer;
  padding: 0 10px;
  display: none;
  
  @media (max-width: 600px) {
    display: block;
  }
`;

const HeaderTitle = styled.h1`
  flex-grow: 1;
  font-size: 24px;
  margin: 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.textOnPrimary};
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state: RootState) => state.ui);
  
  const handleToggleSidebar = () => {
    dispatch(toggleSidebarWidth());
  };
  
  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };
  
  return (
    <HeaderContainer>
      <MenuButton onClick={handleToggleSidebar}>☰</MenuButton>
      <HeaderTitle>ChromeToDo</HeaderTitle>
      <ActionButtons>
        <IconButton onClick={handleToggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </IconButton>
      </ActionButtons>
    </HeaderContainer>
  );
};

export default Header; 