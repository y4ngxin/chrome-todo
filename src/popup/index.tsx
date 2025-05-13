import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '../utils/store';
import App from '../components/App';
import '../styles/global.css';

const PopupContent = () => {
  // 直接显示完整应用
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

const container = document.getElementById('root');
const root = createRoot(container as HTMLElement);

root.render(
  <React.StrictMode>
    <PopupContent />
  </React.StrictMode>
); 