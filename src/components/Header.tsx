import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { AppState, useAppDispatch } from '../utils/store';
import { toggleTheme, toggleSidebar, setCurrentView } from '../utils/slices/uiSlice';
import { HiSun, HiMoon, HiCalendar, HiMenu, HiClock } from 'react-icons/hi';
import NetworkStatus from './NetworkStatus';
import { TodoList } from '../utils/slices/listsSlice';

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

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Logo = styled.h1`
  font-size: 24px;
  margin: 0;
`;

const Timer = styled(HiClock)`
  font-size: 20px;
`;

const Moon = styled(HiMoon)`
  font-size: 20px;
`;

const Sun = styled(HiSun)`
  font-size: 20px;
`;

const Menu = styled(HiMenu)`
  font-size: 24px;
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
      const activeList = lists.find((list: TodoList) => list.id === activeListId);
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
  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };
  
  const handlePomodoroClick = () => {
    dispatch(setCurrentView('pomodoro'));
  };
  
  return (
    <HeaderContainer>
      <LeftSection>
        <MenuButton onClick={() => dispatch(toggleSidebar())}>
          <Menu size={24} />
        </MenuButton>
        <Logo>ChromeToDo</Logo>
      </LeftSection>
      <RightSection>
        <IconButton onClick={handlePomodoroClick} title="番茄钟">
          <Timer size={20} />
        </IconButton>
        <IconButton onClick={handleThemeToggle} title="切换主题">
          {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
        </IconButton>
        <NetworkStatus />
      </RightSection>
    </HeaderContainer>
  );
};

export default Header; 