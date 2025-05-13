import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../utils/store';
import { setActiveList } from '../utils/slices/listsSlice';
import { toggleSidebarWidth, setSidebarWidth } from '../utils/slices/uiSlice';
import { TodoList } from '../utils/slices/listsSlice';
import AddListForm from './AddListForm';

interface SidebarContainerProps {
  isCollapsed: boolean;
}

const SidebarContainer = styled.div<SidebarContainerProps>`
  width: ${props => props.isCollapsed ? '60px' : '240px'};
  height: 100%;
  background-color: ${props => props.theme.sidebarBackground};
  color: ${props => props.theme.textColor};
  overflow-y: auto;
  border-right: 1px solid ${props => props.theme.borderColor};
  transition: width 0.3s ease;
  position: relative;
  flex-shrink: 0;
`;

const NavSection = styled.div`
  padding: 16px 0;
  border-bottom: 1px solid ${props => props.theme.borderColor};
`;

interface NavItemProps {
  active?: boolean;
  isCollapsed: boolean;
}

const NavItem = styled.div<NavItemProps>`
  display: flex;
  align-items: center;
  padding: 10px ${props => props.isCollapsed ? '0' : '16px'};
  justify-content: ${props => props.isCollapsed ? 'center' : 'flex-start'};
  cursor: pointer;
  font-size: 14px;
  color: ${props => props.active ? props.theme.primaryColor : props.theme.textColor};
  background-color: ${props => props.active ? props.theme.activeItemBackground : 'transparent'};
  
  &:hover {
    background-color: ${props => props.theme.hoverBackground};
  }
`;

const NavIcon = styled.span`
  margin-right: ${props => props.className?.includes('collapsed') ? '0' : '12px'};
  font-size: 16px;
`;

const NavText = styled.span<{ isCollapsed: boolean }>`
  display: ${props => props.isCollapsed ? 'none' : 'inline'};
`;

interface ListsHeaderProps {
  isCollapsed: boolean;
}

const ListsHeader = styled.div<ListsHeaderProps>`
  display: flex;
  justify-content: ${props => props.isCollapsed ? 'center' : 'space-between'};
  align-items: center;
  padding: 10px ${props => props.isCollapsed ? '0' : '16px'};
  font-weight: 500;
  font-size: 14px;
`;

const HeaderText = styled.span<{ isCollapsed: boolean }>`
  display: ${props => props.isCollapsed ? 'none' : 'inline'};
`;

const AddListButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.textMuted};
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  
  &:hover {
    color: ${props => props.theme.primaryColor};
  }
`;

const ResizeHandle = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  color: ${props => props.theme.textMuted};
  font-size: 16px;
  z-index: 10;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    color: ${props => props.theme.primaryColor};
    background-color: ${props => props.theme.backgroundHover};
  }
`;

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 5;
`;

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const lists = useSelector((state: RootState) => state.lists.items);
  const activeListId = useSelector((state: RootState) => state.lists.activeListId);
  const sidebarWidth = useSelector((state: RootState) => state.ui.sidebarWidth);
  const isCollapsed = sidebarWidth === 'collapsed';
  
  const [showAddListForm, setShowAddListForm] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // 监听窗口大小变化，更新窗口宽度状态
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      
      // 只在窗口小于600px时自动收缩
      if (window.innerWidth < 600) {
        dispatch(setSidebarWidth('collapsed'));
      }
    };
    
    // 初始化时检查
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [dispatch]);
  
  // 处理点击外部关闭表单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAddListForm && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setShowAddListForm(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddListForm]);
  
  const handleListClick = (listId: string) => {
    dispatch(setActiveList(listId));
    
    // 在小屏幕上点击列表后自动收缩边栏
    if (window.innerWidth < 600) {
      dispatch(setSidebarWidth('collapsed'));
    }
  };
  
  const handleToggleSidebar = () => {
    dispatch(toggleSidebarWidth());
  };
  
  const handleAddListClick = () => {
    setShowAddListForm(true);
    
    // 如果侧边栏是收缩状态，点击添加按钮时展开
    if (isCollapsed) {
      dispatch(setSidebarWidth('normal'));
    }
  };
  
  return (
    <>
      {showAddListForm && <Backdrop onClick={() => setShowAddListForm(false)} />}
      
      <SidebarContainer ref={sidebarRef} isCollapsed={isCollapsed}>
        <ResizeHandle onClick={handleToggleSidebar} title={isCollapsed ? "展开侧边栏" : "收起侧边栏"}>
          {isCollapsed ? '→' : '←'}
        </ResizeHandle>
        
        <NavSection>
          <NavItem 
            active={activeListId === 'my-day'} 
            onClick={() => handleListClick('my-day')}
            isCollapsed={isCollapsed}
          >
            <NavIcon className={isCollapsed ? 'collapsed' : ''}>☀️</NavIcon>
            <NavText isCollapsed={isCollapsed}>我的一天</NavText>
          </NavItem>
          <NavItem 
            active={activeListId === 'important'}
            onClick={() => handleListClick('important')}
            isCollapsed={isCollapsed}
          >
            <NavIcon className={isCollapsed ? 'collapsed' : ''}>⭐</NavIcon>
            <NavText isCollapsed={isCollapsed}>重要</NavText>
          </NavItem>
          <NavItem 
            active={activeListId === 'planned'}
            onClick={() => handleListClick('planned')}
            isCollapsed={isCollapsed}
          >
            <NavIcon className={isCollapsed ? 'collapsed' : ''}>📅</NavIcon>
            <NavText isCollapsed={isCollapsed}>计划内</NavText>
          </NavItem>
          <NavItem 
            active={!activeListId || activeListId === 'all'}
            onClick={() => handleListClick('all')}
            isCollapsed={isCollapsed}
          >
            <NavIcon className={isCollapsed ? 'collapsed' : ''}>📝</NavIcon>
            <NavText isCollapsed={isCollapsed}>所有任务</NavText>
          </NavItem>
        </NavSection>
        
        <NavSection>
          <ListsHeader isCollapsed={isCollapsed}>
            <HeaderText isCollapsed={isCollapsed}>我的列表</HeaderText>
            <AddListButton onClick={handleAddListClick} title="添加新列表">+</AddListButton>
          </ListsHeader>
          
          {lists.map((list: TodoList) => (
            <NavItem 
              key={list.id}
              active={activeListId === list.id}
              onClick={() => handleListClick(list.id)}
              isCollapsed={isCollapsed}
            >
              <NavIcon className={isCollapsed ? 'collapsed' : ''}>{list.icon || '📋'}</NavIcon>
              <NavText isCollapsed={isCollapsed}>{list.name}</NavText>
            </NavItem>
          ))}
        </NavSection>
        
        {showAddListForm && (
          <AddListForm 
            onClose={() => setShowAddListForm(false)}
            isCollapsed={isCollapsed}
          />
        )}
      </SidebarContainer>
    </>
  );
};

export default Sidebar; 