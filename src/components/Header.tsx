import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { AppState, useAppDispatch } from '../utils/store';
import { toggleTheme } from '../utils/slices/uiSlice';
import { HiSun, HiMoon, HiCalendar } from 'react-icons/hi';
import NetworkStatus from './NetworkStatus';

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

const TitleArea = styled.div`
  display: flex;
  align-items: center;
`;

const Title = styled.h2`
  flex-grow: 1;
  font-size: 24px;
  margin: 0;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
`;

const ThemeToggleButton = styled.button`
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

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme, currentView } = useSelector((state: AppState) => state.ui);
  const activeListId = useSelector((state: AppState) => state.lists.activeListId);
  const lists = useSelector((state: AppState) => state.lists.items);
  
  // 获取当前显示的标题
  const getTitle = () => {
    if (currentView === 'myDay') {
      return '我的一天';
    }
    
    if (currentView === 'important') {
      return '重要';
    }
    
    if (currentView === 'planned') {
      return '计划内';
    }
    
    if (currentView === 'week') {
      return '周视图';
    }
    
    if (currentView === 'list' && activeListId) {
      const activeList = lists.find(list => list.id === activeListId);
      return activeList?.name || '任务列表';
    }
    
    return '任务列表';
  };
  
  // 获取当前图标
  const getIcon = () => {
    if (currentView === 'week') {
      return <HiCalendar size={24} />;
    }
    
    // 其他视图图标保持不变
    return null;
  };
  
  // 切换主题
  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };
  
  return (
    <HeaderContainer>
      <TitleArea>
        <Title>{getTitle()}</Title>
        {getIcon()}
      </TitleArea>
      <RightSection>
        <NetworkStatus />
        <ThemeToggleButton onClick={handleToggleTheme}>
          {theme === 'light' ? <HiMoon size={20} /> : <HiSun size={20} />}
        </ThemeToggleButton>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header; 