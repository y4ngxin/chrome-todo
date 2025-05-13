import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styled, { ThemeProvider } from 'styled-components';
import { AppState, useAppDispatch, store } from '../utils/store';
import { lightTheme, darkTheme, GlobalStyle } from '../styles/theme';
import { fetchTodos } from '../utils/slices/todosSlice';
import { fetchLists } from '../utils/slices/listsSlice';
import { fetchTags } from '../utils/slices/tagsSlice';
import { fetchSettings, setNetworkStatus } from '../utils/slices/uiSlice';
import AddTodoForm from './AddTodoForm';
import TodoList from './TodoList';
import WeekView from './WeekView';
import Sidebar from './Sidebar';
import Header from './Header';
import TodoDetail from './TodoDetail';
import PomodoroTimer from './PomodoroTimer';
import TagsView from './TagsView';
import { listenToNetworkChanges, getNetworkStatus } from '../utils/offlineSupport';
import { setupPeriodicSync, checkAndSync } from '../utils/syncService';
import { AnyAction } from '@reduxjs/toolkit';

interface AppContainerProps {
  sidebarWidth: string;
}

const AppContainer = styled.div<AppContainerProps>`
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.1);
  position: relative;
  
  /* 小屏幕设备 */
  @media (max-width: 480px) {
    width: 100%;
    height: 100vh;
    border: none;
    box-shadow: none;
  }
  
  /* 平板设备 */
  @media (min-width: 481px) and (max-width: 768px) {
    width: 100%;
    height: 100%;
    max-height: 100vh;
  }
  
  /* 中等屏幕 */
  @media (min-width: 769px) and (max-width: 1024px) {
    width: 90%;
    height: 90vh;
    max-width: 900px;
    max-height: 800px;
    margin: auto;
  }
  
  /* 大屏幕 */
  @media (min-width: 1025px) and (max-width: 1200px) {
    width: 80%;
    height: 85vh;
    max-width: 1000px;
    max-height: 800px;
    margin: auto;
  }
  
  /* 超大屏幕 */
  @media (min-width: 1201px) {
    width: 75%;
    height: 80vh;
    max-width: 1200px;
    max-height: 800px;
    margin: auto;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const Content = styled.main`
  flex-grow: 1;
  padding: 16px;
  overflow-y: auto;
  background-color: ${props => props.theme.backgroundColor};
  color: ${props => props.theme.textColor};
  
  /* 响应式内容区域内边距 */
  @media (max-width: 480px) {
    padding: 12px 8px;
  }
  
  @media (min-width: 481px) and (max-width: 768px) {
    padding: 14px 10px;
  }
`;

const LoadingScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: ${props => props.theme.backgroundColor};
  color: ${props => props.theme.textColor};
  
  h2 {
    font-size: clamp(1.2rem, 4vw, 1.8rem);
    margin-bottom: 10px;
  }
  
  p {
    font-size: clamp(0.9rem, 3vw, 1.1rem);
  }
`;

// 番茄钟视图
const PomodoroView = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: clamp(15px, 5vw, 30px);
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const PomodoroTitle = styled.h2`
  font-size: clamp(1.2rem, 4vw, 1.5rem);
  margin-bottom: 20px;
  color: ${props => props.theme.textColor};
`;

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme, sidebarWidth, currentView } = useSelector((state: AppState) => state.ui);
  const activeListId = useSelector((state: AppState) => state.lists.activeListId);
  const todosStatus = useSelector((state: AppState) => state.todos.status);
  const listsStatus = useSelector((state: AppState) => state.lists.status);
  const tagsStatus = useSelector((state: AppState) => state.tags.status);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  
  // 当前查看的任务详情ID
  const [activeTodoId, setActiveTodoId] = useState<string | null>(null);
  
  // 加载数据
  useEffect(() => {
    // 初始化时加载设置
    dispatch(fetchSettings() as unknown as AnyAction);
    
    // 加载待办事项和列表
    if (todosStatus === 'idle') {
      dispatch(fetchTodos() as unknown as AnyAction);
    }
    
    if (listsStatus === 'idle') {
      dispatch(fetchLists() as unknown as AnyAction);
    }
    
    if (tagsStatus === 'idle') {
      dispatch(fetchTags() as unknown as AnyAction);
    }
  }, [dispatch, todosStatus, listsStatus, tagsStatus]);
  
  // 配置网络状态监听
  useEffect(() => {
    // 初始化网络状态
    dispatch(setNetworkStatus(getNetworkStatus()));
    
    // 设置网络状态变化监听
    const handleOnline = () => {
      dispatch(setNetworkStatus('online'));
      checkAndSync(dispatch, () => store.getState());
    };
    
    const handleOffline = () => {
      dispatch(setNetworkStatus('offline'));
    };
    
    const cleanupNetworkListener = listenToNetworkChanges(handleOnline, handleOffline);
    
    // 设置定期同步
    const cleanupPeriodicSync = setupPeriodicSync(
      dispatch,
      () => store.getState(),
      30000 // 30秒同步一次
    );
    
    // 组件卸载时清理
    return () => {
      cleanupNetworkListener();
      cleanupPeriodicSync();
    };
  }, [dispatch]);
  
  // 检查数据是否正在加载
  const isLoading = todosStatus === 'loading' || listsStatus === 'loading' || tagsStatus === 'loading';
  
  // 如果正在加载，显示加载界面
  if (isLoading) {
    return (
      <ThemeProvider theme={currentTheme}>
        <GlobalStyle />
        <LoadingScreen>
          <h2>加载中...</h2>
          <p>正在获取您的待办事项</p>
        </LoadingScreen>
      </ThemeProvider>
    );
  }

  // 处理打开任务详情
  const handleOpenTodoDetail = (todoId: string) => {
    // 防止快速点击导致的问题
    if (activeTodoId === todoId) return;
    
    setActiveTodoId(todoId);
  };
  
  // 处理关闭任务详情
  const handleCloseTodoDetail = () => {
    setActiveTodoId(null);
  };
  
  // 渲染内容区域
  const renderContent = () => {
    if (isLoading) {
      return <LoadingScreen>加载中...</LoadingScreen>;
    }

    // 根据当前视图渲染相应内容
    switch (currentView) {
      case 'week':
        return <WeekView onTodoClick={handleOpenTodoDetail} />;
      case 'pomodoro':
        return (
          <PomodoroView>
            <PomodoroTitle>番茄钟</PomodoroTitle>
            <PomodoroTimer isFullView={true} />
          </PomodoroView>
        );
      case 'tags':
        return <TagsView onTodoClick={handleOpenTodoDetail} />;
      default:
        return (
          <>
            <TodoList 
              listId={currentView === 'list' ? activeListId : currentView}
              onTodoClick={handleOpenTodoDetail}
            />
            <AddTodoForm 
              listId={currentView === 'list' ? activeListId : undefined}
            />
          </>
        );
    }
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyle />
      <AppContainer sidebarWidth={sidebarWidth}>
        <Sidebar />
        <MainContent>
          <Header />
          <Content>
            {renderContent()}
          </Content>
        </MainContent>
        <TodoDetail 
          todoId={activeTodoId} 
          onClose={handleCloseTodoDetail} 
          key={activeTodoId || 'no-todo'} 
        />
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;