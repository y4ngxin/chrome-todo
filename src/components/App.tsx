import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled, { ThemeProvider } from 'styled-components';
import { AppState, useAppDispatch } from '../utils/store';
import { lightTheme, darkTheme, GlobalStyle } from '../styles/theme';
import { fetchTodos } from '../utils/slices/todosSlice';
import { fetchLists } from '../utils/slices/listsSlice';
import { fetchSettings } from '../utils/slices/uiSlice';
import AddTodoForm from './AddTodoForm';
import TodoList from './TodoList';
import Sidebar from './Sidebar';
import Header from './Header';

interface AppContainerProps {
  sidebarWidth: string;
}

const AppContainer = styled.div<AppContainerProps>`
  display: flex;
  width: 800px;
  height: 600px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 840px) {
    width: 100%;
    height: 100%;
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
  const { theme, sidebarWidth } = useSelector((state: AppState) => state.ui);
  const activeListId = useSelector((state: AppState) => state.lists.activeListId);
  const todosStatus = useSelector((state: AppState) => state.todos.status);
  const listsStatus = useSelector((state: AppState) => state.lists.status);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  
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

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyle />
      <AppContainer sidebarWidth={sidebarWidth}>
        <Sidebar />
        <MainContent>
          <Header />
          <Content>
            <AddTodoForm listId={activeListId || undefined} />
            <TodoList listId={activeListId || undefined} />
          </Content>
        </MainContent>
      </AppContainer>
    </ThemeProvider>
  );
};

export default App; 