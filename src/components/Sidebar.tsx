import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { AppState, useAppDispatch } from '../utils/store';
import { setActiveList } from '../utils/slices/listsSlice';
import { toggleSidebarWidth, setSidebarWidth, setCurrentView } from '../utils/slices/uiSlice';
import { TodoList } from '../utils/slices/listsSlice';
import { Tag, addTag, removeTag, updateTag } from '../utils/slices/tagsSlice';
import AddListForm from './AddListForm';
import { v4 as uuidv4 } from 'uuid';
import { 
  HiOutlineCalendar,
  HiSun, 
  HiStar, 
  HiCalendar,
  HiTag,
  HiX,
  HiPencil,
  HiCheck,
  HiPlus,
  HiOutlineMenu,
  HiOutlineViewGrid
} from 'react-icons/hi';

interface SidebarContainerProps {
  isCollapsed: boolean;
}

const SidebarContainer = styled.div<SidebarContainerProps>`
  width: ${props => props.isCollapsed ? '60px' : '240px'};
  min-width: ${props => props.isCollapsed ? '60px' : '200px'};
  height: 100%;
  background-color: ${props => props.theme.sidebarBackground};
  border-right: 1px solid ${props => props.theme.borderColor};
  transition: all 0.3s ease;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  z-index: 2;
  
  /* 响应式调整 */
  @media (max-width: 480px) {
    position: absolute;
    left: ${props => props.isCollapsed ? '-60px' : '0'};
    width: ${props => props.isCollapsed ? '60px' : '85%'};
    min-width: auto;
    box-shadow: ${props => props.isCollapsed ? 'none' : '0 0 15px rgba(0, 0, 0, 0.2)'};
    z-index: 10;
  }
  
  @media (min-width: 481px) and (max-width: 768px) {
    width: ${props => props.isCollapsed ? '50px' : '220px'};
    min-width: ${props => props.isCollapsed ? '50px' : '180px'};
  }
  
  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }
`;

const NavSection = styled.nav`
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  margin-top: 20px;
`;

interface NavItemProps {
  active?: boolean;
  isCollapsed: boolean;
}

const NavItem = styled.div<NavItemProps>`
  display: flex;
  align-items: center;
  padding: ${props => props.isCollapsed ? '12px 0' : '12px 16px'};
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${props => props.active ? props.theme.itemActiveBackground : 'transparent'};
  color: ${props => props.active ? props.theme.textActive : props.theme.textColor};
  justify-content: ${props => props.isCollapsed ? 'center' : 'flex-start'};
  border-radius: ${props => props.isCollapsed ? '0' : '4px'};
  margin: ${props => props.isCollapsed ? '0' : '0 8px'};
  
  &:hover {
    background-color: ${props => props.active ? props.theme.itemActiveBackground : props.theme.hoverBackground};
  }
`;

const NavIcon = styled.span`
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  
  &.collapsed {
    margin-right: 0;
    font-size: 22px;
  }
`;

const NavText = styled.span<{isCollapsed: boolean}>`
  font-size: 14px;
  display: ${props => props.isCollapsed ? 'none' : 'block'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  margin-top: 8px;
`;

const HeaderText = styled.span<{ isCollapsed: boolean }>`
  display: ${props => props.isCollapsed ? 'none' : 'inline'};
  font-size: clamp(0.75rem, 2vw, 0.85rem);
`;

const AddListButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.textMuted};
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    color: ${props => props.theme.primaryColor};
    background-color: ${props => props.theme.backgroundHover};
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
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.theme.primaryColor};
    background-color: ${props => props.theme.backgroundHover};
  }
  
  @media (max-width: 480px) {
    top: 10px;
    right: 10px;
    background-color: ${props => props.theme.backgroundHover};
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
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
  
  @media (max-width: 480px) {
    z-index: 9;
  }
`;

const MobileSidebarToggle = styled.div`
  display: none;
  position: fixed;
  top: 12px;
  left: 12px;
  width: 36px;
  height: 36px;
  background-color: ${props => props.theme.primaryColor};
  color: white;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 8;
  cursor: pointer;
  
  @media (max-width: 480px) {
    display: flex;
  }
`;

const DefaultItems = [
  {
    id: 'myDay',
    name: '我的一天',
    icon: <HiSun size={20} />,
    color: '#058527'
  },
  {
    id: 'important',
    name: '重要',
    icon: <HiStar size={20} />,
    color: '#721d7c'
  },
  {
    id: 'planned',
    name: '计划内',
    icon: <HiCalendar size={20} />,
    color: '#5a32a3'
  },
  {
    id: 'week',
    name: '周视图',
    icon: <HiOutlineViewGrid size={20} />,
    color: '#0062b1'
  }
];

const TagButton = styled.button`
  background: transparent;
  border: none;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: inherit;
  
  &:hover {
    color: ${props => props.theme.primaryColor};
  }
`;

const TagActions = styled.div`
  margin-left: auto;
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${NavItem}:hover & {
    opacity: 1;
  }
`;

const AddTagForm = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;
  padding: 0 ${props => props.className?.includes('collapsed') ? '0' : '16px'};
`;

const TagInput = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 4px;
  background-color: ${props => props.theme.inputBackground};
  color: ${props => props.theme.textColor};
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primaryColor};
  }
`;

const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const lists = useSelector((state: AppState) => state.lists.items);
  const tags = useSelector((state: AppState) => state.tags.items);
  const activeListId = useSelector((state: AppState) => state.lists.activeListId);
  const sidebarWidth = useSelector((state: AppState) => state.ui.sidebarWidth);
  const currentView = useSelector((state: AppState) => state.ui.currentView);
  const isCollapsed = sidebarWidth === 'collapsed';
  
  const [showAddListForm, setShowAddListForm] = useState(false);
  const [showAddTagForm, setShowAddTagForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  const sidebarRef = useRef<HTMLDivElement>(null);
  const newTagInputRef = useRef<HTMLInputElement>(null);
  const editTagInputRef = useRef<HTMLInputElement>(null);
  
  // 监听窗口大小变化，更新窗口宽度状态
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWindowWidth(newWidth);
      
      // 只在窗口小于600px时自动收缩
      if (newWidth < 600 && !isCollapsed) {
        dispatch(setSidebarWidth('collapsed'));
      } else if (newWidth >= 600 && isCollapsed && showMobileSidebar) {
        // 如果从小屏幕变到大屏幕，且侧边栏是展开状态，设置为正常状态
        setShowMobileSidebar(false);
        dispatch(setSidebarWidth('normal'));
      }
    };
    
    // 初始化时检查
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [dispatch, isCollapsed, showMobileSidebar]);
  
  // 处理点击外部关闭表单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAddListForm && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setShowAddListForm(false);
      }
      
      // 在移动设备上点击背景关闭侧边栏
      if (windowWidth <= 480 && !isCollapsed && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        dispatch(setSidebarWidth('collapsed'));
        setShowMobileSidebar(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddListForm, dispatch, windowWidth, isCollapsed]);
  
  // 处理默认导航项点击
  const handleItemClick = (id: string) => {
    // 设置当前视图
    dispatch(setCurrentView(id as any));
    
    // 重置活动列表选择
    if (id !== 'list') {
      dispatch(setActiveList(null));
    }
    
    // 在小屏幕上点击后自动收缩边栏
    if (windowWidth < 600) {
      dispatch(setSidebarWidth('collapsed'));
      setShowMobileSidebar(false);
    }
  };
  
  // 处理列表项点击
  const handleListClick = (listId: string) => {
    // 设置活动列表
    dispatch(setActiveList(listId));
    
    // 设置当前视图为列表
    dispatch(setCurrentView('list'));
    
    // 在小屏幕上点击列表后自动收缩边栏
    if (windowWidth < 600) {
      dispatch(setSidebarWidth('collapsed'));
      setShowMobileSidebar(false);
    }
  };
  
  const handleToggleSidebar = () => {
    if (windowWidth <= 480) {
      // 移动设备上的特殊处理
      if (isCollapsed) {
        dispatch(setSidebarWidth('normal'));
        setShowMobileSidebar(true);
      } else {
        dispatch(setSidebarWidth('collapsed'));
        setShowMobileSidebar(false);
      }
    } else {
      // 桌面设备正常切换
      dispatch(toggleSidebarWidth());
    }
  };
  
  // 处理移动设备上的菜单按钮点击
  const handleMobileMenuClick = () => {
    dispatch(setSidebarWidth('normal'));
    setShowMobileSidebar(true);
  };
  
  const handleAddListClick = () => {
    setShowAddListForm(true);
    
    // 如果侧边栏是收缩状态，点击添加按钮时展开
    if (isCollapsed) {
      dispatch(setSidebarWidth('normal'));
    }
  };
  
  const handleAddTagClick = () => {
    setShowAddTagForm(true);
    // 如果侧边栏是收缩状态，点击添加按钮时展开
    if (isCollapsed) {
      dispatch(setSidebarWidth('normal'));
    }
    
    setTimeout(() => {
      if (newTagInputRef.current) {
        newTagInputRef.current.focus();
      }
    }, 10);
  };
  
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagName.trim()) {
      dispatch(addTag({ 
        name: newTagName.trim(),
        color: generateRandomColor()
      }));
      setNewTagName('');
      setShowAddTagForm(false);
    }
  };
  
  const handleCancelAddTag = () => {
    setNewTagName('');
    setShowAddTagForm(false);
  };
  
  const handleRemoveTag = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(removeTag(tagId));
  };
  
  const handleStartEditTag = (tag: Tag, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTagId(tag.id);
    setEditingTagName(tag.name);
    
    setTimeout(() => {
      if (editTagInputRef.current) {
        editTagInputRef.current.focus();
      }
    }, 10);
  };
  
  const handleSaveEditTag = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingTagName.trim()) {
      dispatch(updateTag({ 
        id: tagId, 
        updates: { name: editingTagName.trim() } 
      }));
    }
    setEditingTagId(null);
    setEditingTagName('');
  };
  
  const handleCancelEditTag = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTagId(null);
    setEditingTagName('');
  };
  
  // 生成随机颜色
  const generateRandomColor = () => {
    const colors = [
      '#E53935', '#D81B60', '#8E24AA', '#5E35B1', 
      '#3949AB', '#1E88E5', '#039BE5', '#00ACC1',
      '#00897B', '#43A047', '#7CB342', '#C0CA33',
      '#FDD835', '#FFB300', '#FB8C00', '#F4511E'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  const handleTagClick = (tagId: string) => {
    dispatch(setCurrentView('tags'));
    dispatch(setActiveList(tagId));
    
    // 在小屏幕上点击后自动收缩边栏
    if (windowWidth < 600) {
      dispatch(setSidebarWidth('collapsed'));
    }
  };
  
  return (
    <>
      {(showAddListForm || (!isCollapsed && windowWidth <= 480)) && 
        <Backdrop onClick={() => {
          setShowAddListForm(false);
          if (windowWidth <= 480) {
            dispatch(setSidebarWidth('collapsed'));
            setShowMobileSidebar(false);
          }
        }} />
      }
      
      {/* 移动设备菜单按钮 */}
      {windowWidth <= 480 && isCollapsed && (
        <MobileSidebarToggle onClick={handleMobileMenuClick}>
          <HiOutlineMenu size={20} />
        </MobileSidebarToggle>
      )}
      
      <SidebarContainer 
        ref={sidebarRef} 
        isCollapsed={isCollapsed}
        style={{
          left: windowWidth <= 480 && isCollapsed && !showMobileSidebar ? '-60px' : '0'
        }}
      >
        <ResizeHandle onClick={handleToggleSidebar} title={isCollapsed ? "展开侧边栏" : "收起侧边栏"}>
          {isCollapsed ? <HiOutlineMenu size={18} /> : <HiX size={18} />}
        </ResizeHandle>
        
        <NavSection>
          <NavItem 
            active={currentView === 'myDay'} 
            onClick={() => handleItemClick('myDay')}
            isCollapsed={isCollapsed}
          >
            <NavIcon className={isCollapsed ? 'collapsed' : ''}>☀️</NavIcon>
            <NavText isCollapsed={isCollapsed}>我的一天</NavText>
          </NavItem>
          <NavItem 
            active={currentView === 'important'}
            onClick={() => handleItemClick('important')}
            isCollapsed={isCollapsed}
          >
            <NavIcon className={isCollapsed ? 'collapsed' : ''}>⭐</NavIcon>
            <NavText isCollapsed={isCollapsed}>重要</NavText>
          </NavItem>
          <NavItem 
            active={currentView === 'planned'}
            onClick={() => handleItemClick('planned')}
            isCollapsed={isCollapsed}
          >
            <NavIcon className={isCollapsed ? 'collapsed' : ''}>📅</NavIcon>
            <NavText isCollapsed={isCollapsed}>计划内</NavText>
          </NavItem>
          <NavItem 
            active={currentView === 'week'}
            onClick={() => handleItemClick('week')}
            isCollapsed={isCollapsed}
          >
            <NavIcon className={isCollapsed ? 'collapsed' : ''}>
              <HiOutlineViewGrid size={20} />
            </NavIcon>
            <NavText isCollapsed={isCollapsed}>周视图</NavText>
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
              active={activeListId === list.id && currentView === 'list'}
              onClick={() => handleListClick(list.id)}
              isCollapsed={isCollapsed}
            >
              <NavIcon className={isCollapsed ? 'collapsed' : ''}>{list.icon || '📋'}</NavIcon>
              <NavText isCollapsed={isCollapsed}>{list.name}</NavText>
            </NavItem>
          ))}
        </NavSection>
        
        <NavSection>
          <ListsHeader isCollapsed={isCollapsed}>
            <HeaderText isCollapsed={isCollapsed}>标签</HeaderText>
            <AddListButton onClick={handleAddTagClick} title="添加新标签">+</AddListButton>
          </ListsHeader>
          
          {tags.map((tag: Tag) => (
            <NavItem 
              key={tag.id}
              active={currentView === 'tags' && tag.id === activeListId}
              onClick={() => handleTagClick(tag.id)}
              isCollapsed={isCollapsed}
            >
              {editingTagId === tag.id ? (
                <>
                  <NavIcon className={isCollapsed ? 'collapsed' : ''}>
                    <HiTag size={20} color={tag.color || '#5f6368'} />
                  </NavIcon>
                  <TagInput 
                    ref={editTagInputRef}
                    value={editingTagName}
                    onChange={e => setEditingTagName(e.target.value)}
                    onClick={e => e.stopPropagation()}
                    style={{ width: isCollapsed ? '0' : 'auto', display: isCollapsed ? 'none' : 'block' }}
                  />
                  {!isCollapsed && (
                    <TagActions onClick={e => e.stopPropagation()}>
                      <TagButton onClick={e => handleSaveEditTag(tag.id, e)} title="保存">
                        <HiCheck size={16} />
                      </TagButton>
                      <TagButton onClick={handleCancelEditTag} title="取消">
                        <HiX size={16} />
                      </TagButton>
                    </TagActions>
                  )}
                </>
              ) : (
                <>
                  <NavIcon className={isCollapsed ? 'collapsed' : ''}>
                    <HiTag size={20} color={tag.color || '#5f6368'} />
                  </NavIcon>
                  <NavText isCollapsed={isCollapsed}>{tag.name}</NavText>
                  {!isCollapsed && (
                    <TagActions>
                      <TagButton onClick={e => handleStartEditTag(tag, e)} title="编辑标签">
                        <HiPencil size={14} />
                      </TagButton>
                      <TagButton onClick={e => handleRemoveTag(tag.id, e)} title="删除标签">
                        <HiX size={14} />
                      </TagButton>
                    </TagActions>
                  )}
                </>
              )}
            </NavItem>
          ))}
          
          {showAddTagForm && !isCollapsed && (
            <AddTagForm className={isCollapsed ? 'collapsed' : ''}>
              <TagInput
                ref={newTagInputRef}
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                placeholder="新标签名称"
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddTag(e);
                  if (e.key === 'Escape') handleCancelAddTag();
                }}
              />
              <TagActions style={{ opacity: 1 }}>
                <TagButton onClick={handleAddTag} title="添加">
                  <HiCheck size={16} />
                </TagButton>
                <TagButton onClick={handleCancelAddTag} title="取消">
                  <HiX size={16} />
                </TagButton>
              </TagActions>
            </AddTagForm>
          )}
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