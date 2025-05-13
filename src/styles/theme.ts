import { createGlobalStyle, DefaultTheme } from 'styled-components';

export interface Theme extends DefaultTheme {
  primaryColor: string;
  primaryColorDark: string;
  primaryColorLight: string;
  backgroundColor: string;
  backgroundHover: string;
  secondaryColor: string;
  textColor: string;
  textColorLight: string;
  textOnPrimary: string;
  textMuted: string;
  borderColor: string;
  shadowColor: string;
  successColor: string;
  successColorLight: string;
  errorColor: string;
  errorColorLight: string;
  warningColor: string;
  warningColorLight: string;
  infoColor: string;
  infoColorLight: string;
  cardBackground: string;
  sidebarBackground: string;
  inputBackground: string;
  activeItemBackground: string;
  hoverBackground: string;
  disabledColor: string;
  
  // 待办事项相关
  todoBackground: string;
  todoHoverBackground: string;
  completedColor: string;
  accentColor: string;
  
  // 按钮相关
  buttonBackground: string;
  buttonText: string;
  buttonHoverBackground: string;
  
  // 周视图相关
  todayHighlight: string;
  todayBackground: string;
  
  // 标签相关
  tagBackground: string;
  tagText: string;
  
  // 切换组件
  toggleBackground: string;
  toggleBackgroundActive: string;
  toggleButton: string;
}

export const lightTheme: Theme = {
  // 基础颜色
  primaryColor: '#0078d7',
  primaryColorDark: '#005a9e',
  primaryColorLight: '#c7e0f4',
  backgroundColor: '#f5f5f5',
  backgroundHover: '#f0f0f0',
  secondaryColor: '#f3f2f1',
  textColor: '#323130',
  textColorLight: '#605e5c',
  textOnPrimary: '#ffffff',
  textMuted: '#605e5c',
  borderColor: '#e1dfdd',
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  
  // 界面元素
  cardBackground: '#ffffff',
  sidebarBackground: '#ffffff',
  inputBackground: '#ffffff',
  activeItemBackground: '#edebe9',
  hoverBackground: '#f3f2f1',
  disabledColor: '#c8c8c8',
  
  // 状态颜色
  successColor: '#107C10',
  successColorLight: '#e7f2ec',
  errorColor: '#A4262C',
  errorColorLight: '#fde7e7',
  warningColor: '#C19C00',
  warningColorLight: '#fff3e0',
  infoColor: '#0078d4',
  infoColorLight: '#e5f1fb',
  
  // 待办事项相关
  todoBackground: '#ffffff',
  todoHoverBackground: '#f5f5f5',
  completedColor: '#107C10',
  accentColor: '#0078d7',
  
  // 按钮相关
  buttonBackground: '#ffffff',
  buttonText: '#323130',
  buttonHoverBackground: '#f3f2f1',
  
  // 周视图相关
  todayHighlight: '#e1f1ff',
  todayBackground: '#f5f9ff',
  
  // 标签相关
  tagBackground: '#eef4fd',
  tagText: '#2564cf',
  
  // 切换组件
  toggleBackground: '#767676',
  toggleBackgroundActive: '#0078d7',
  toggleButton: '#ffffff'
};

export const darkTheme: Theme = {
  // 基础颜色
  primaryColor: '#0078d7',
  primaryColorDark: '#005a9e',
  primaryColorLight: '#203d52',
  backgroundColor: '#1b1a19',
  backgroundHover: '#252423',
  secondaryColor: '#323130',
  textColor: '#ffffff',
  textColorLight: '#a19f9d',
  textOnPrimary: '#ffffff',
  textMuted: '#a19f9d',
  borderColor: '#3b3a39',
  shadowColor: 'rgba(0, 0, 0, 0.4)',
  
  // 界面元素
  cardBackground: '#252423',
  sidebarBackground: '#252423',
  inputBackground: '#323130',
  activeItemBackground: '#3b3a39',
  hoverBackground: '#323130',
  disabledColor: '#484644',
  
  // 状态颜色
  successColor: '#107C10',
  successColorLight: '#2b3c2b',
  errorColor: '#F1707B',
  errorColorLight: '#3f2b2b',
  warningColor: '#FED700',
  warningColorLight: '#3d3223',
  infoColor: '#2196f3',
  infoColorLight: '#263340',
  
  // 待办事项相关
  todoBackground: '#323130',
  todoHoverBackground: '#3b3a39',
  completedColor: '#107C10',
  accentColor: '#0078d7',
  
  // 按钮相关
  buttonBackground: '#323130',
  buttonText: '#ffffff',
  buttonHoverBackground: '#3b3a39',
  
  // 周视图相关
  todayHighlight: '#0f3254',
  todayBackground: '#0f2336',
  
  // 标签相关
  tagBackground: '#3a3a3a',
  tagText: '#e0e0e0',
  
  // 切换组件
  toggleBackground: '#4d4d4d',
  toggleBackgroundActive: '#0078d7',
  toggleButton: '#ffffff'
};

export const GlobalStyle = createGlobalStyle<{ theme: Theme }>`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
    background-color: ${props => props.theme.backgroundColor};
    color: ${props => props.theme.textColor};
    transition: all 0.3s ease;
  }

  h1, h2, h3, h4, h5, h6 {
    margin-bottom: 16px;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    padding: 8px 16px;
    border-radius: 4px;
    background-color: ${props => props.theme.primaryColor};
    color: white;
    font-weight: 600;
    transition: all 0.2s ease;

    &:hover {
      opacity: 0.9;
    }
  }

  input, textarea {
    padding: 8px;
    border: 1px solid ${props => props.theme.borderColor};
    border-radius: 4px;
    background-color: ${props => props.theme.backgroundColor};
    color: ${props => props.theme.textColor};
    margin-bottom: 8px;
    width: 100%;
    outline: none;

    &:focus {
      border-color: ${props => props.theme.primaryColor};
    }
  }
`; 