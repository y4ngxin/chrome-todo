import { createGlobalStyle } from 'styled-components';

export interface Theme {
  primaryColor: string;
  primaryColorDark: string;
  primaryColorLight: string;
  backgroundColor: string;
  backgroundHover: string;
  secondaryColor: string;
  textColor: string;
  textOnPrimary: string;
  textMuted: string;
  borderColor: string;
  shadowColor: string;
  successColor: string;
  errorColor: string;
  warningColor: string;
  cardBackground: string;
  sidebarBackground: string;
  inputBackground: string;
  activeItemBackground: string;
  hoverBackground: string;
  disabledColor: string;
}

export const lightTheme: Theme = {
  primaryColor: '#0078d7',
  primaryColorDark: '#005a9e',
  primaryColorLight: '#c7e0f4',
  backgroundColor: '#f5f5f5',
  backgroundHover: '#f0f0f0',
  secondaryColor: '#f3f2f1',
  textColor: '#323130',
  textOnPrimary: '#ffffff',
  textMuted: '#605e5c',
  borderColor: '#e1dfdd',
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  successColor: '#107C10',
  errorColor: '#A4262C',
  warningColor: '#C19C00',
  cardBackground: '#ffffff',
  sidebarBackground: '#ffffff',
  inputBackground: '#ffffff',
  activeItemBackground: '#edebe9',
  hoverBackground: '#f3f2f1',
  disabledColor: '#c8c8c8'
};

export const darkTheme: Theme = {
  primaryColor: '#0078d7',
  primaryColorDark: '#005a9e',
  primaryColorLight: '#203d52',
  backgroundColor: '#1b1a19',
  backgroundHover: '#252423',
  secondaryColor: '#323130',
  textColor: '#ffffff',
  textOnPrimary: '#ffffff',
  textMuted: '#a19f9d',
  borderColor: '#3b3a39',
  shadowColor: 'rgba(0, 0, 0, 0.4)',
  successColor: '#107C10',
  errorColor: '#F1707B',
  warningColor: '#FED700',
  cardBackground: '#252423',
  sidebarBackground: '#252423',
  inputBackground: '#323130',
  activeItemBackground: '#3b3a39',
  hoverBackground: '#323130',
  disabledColor: '#484644'
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