import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styled, { ThemeProvider } from 'styled-components';
import { AppState, useAppDispatch } from '../utils/store';
import { lightTheme, darkTheme, GlobalStyle } from '../styles/theme';
import { fetchTodos } from '../utils/slices/todosSlice';
import { fetchLists } from '../utils/slices/listsSlice';
import { fetchSettings } from '../utils/slices/uiSlice';
import AddTodoForm from './AddTodoForm';
import TodoList from './TodoList';
import WeekView from './WeekView';
import Sidebar from './Sidebar';
import Header from './Header';
import TodoDetail from './TodoDetail';
import PomodoroTimer from './PomodoroTimer';

interface AppContainerProps {
  sidebarWidth: string;
}

const AppContainer = styled.div<AppContainerProps>`
  display: flex;
  width: 372px;
  height: 653px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.1);
  
  @media (min-width: 800px) {
    width: 800px;
    height: 700px;
  }
  
  @media (min-width: 1200px) {
    width: 1000px;
    height: 800px;
  }
  
  @media (max-width: 372px) {
    width: 100%;
    height: 100%;
    border: none;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;
  overflow: hidden;
`;

const Content = styled.main`
  flex-grow: 1;
  padding: 16px;
  overflow-y: auto;
  background-color: ${props => props.theme.backgroundColor};
  color: ${props => props.theme.textColor};
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
`;

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme, sidebarWidth, currentView } = useSelector((state: AppState) => state.ui);
  const activeListId = useSelector((state: AppState) => state.lists.activeListId);
  const todosStatus = useSelector((state: AppState) => state.todos.status);
  const listsStatus = useSelector((state: AppState) => state.lists.status);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  
  // 当前查看的任务详情ID
  const [activeTodoId, setActiveTodoId] = useState<string | null>(null);
  
  // 加载数据
  useEffect(() => {
    // 初始化时加载设置
    dispatch(fetchSettings());
    
    // 加载待办事项和列表
    if (todosStatus === 'idle') {
      dispatch(fetchTodos());
    }
    
    if (listsStatus === 'idle') {
      dispatch(fetchLists());
    }
  }, [dispatch, todosStatus, listsStatus]);
  
  // 检查数据是否正在加载
  const isLoading = todosStatus === 'loading' || listsStatus === 'loading';
  
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
  
  // 根据当前视图显示不同内容
  const renderContent = () => {
    if (currentView === 'week') {
      return <WeekView onTodoClick={handleOpenTodoDetail} />;
    }
    
    return (
      <>
        <AddTodoForm listId={activeListId || undefined} />
        <TodoList 
          listId={activeListId || currentView} 
          onTodoClick={handleOpenTodoDetail}
        />
      </>
    );
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyle />
      <AppContainer sidebarWidth={sidebarWidth}>
        <Sidebar />
        <MainContent>
          <Header />
          <Content>
            <PomodoroTimer />
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