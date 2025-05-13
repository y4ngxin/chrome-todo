import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '../utils/store';
import App from '../components/App';
import '../styles/global.css';

// 检测当前是否在弹出窗口环境
const isPopup = window.location.pathname.endsWith('popup.html');

const PopupContent = () => {
  // 在弹出窗口中，添加一个按钮打开独立页面
  if (isPopup) {
    return (
      <div style={{
        width: '280px',
        padding: '20px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '200px',
        backgroundColor: '#f5f5f5'
      }}>
        <h2 style={{ 
          color: '#0078d7', 
          marginBottom: '16px', 
          fontSize: '22px'
        }}>
          ChromeToDo
        </h2>
        <p style={{ 
          marginBottom: '20px', 
          color: '#605e5c', 
          fontSize: '14px'
        }}>
          高效管理您的待办事项
        </p>
        <button 
          onClick={() => {
            // 发送消息给后台脚本，打开独立页面
            chrome.runtime.sendMessage({ action: 'openOptionsPage' });
          }}
          style={{
            background: '#0078d7',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            marginBottom: '10px',
            width: '100%'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#005a9e'}
          onMouseOut={(e) => e.currentTarget.style.background = '#0078d7'}
        >
          打开完整应用
        </button>
        <p style={{ 
          color: '#605e5c', 
          fontSize: '12px',
          marginTop: '8px'
        }}>
          应用将在独立窗口打开，便于使用
        </p>
      </div>
    );
  }
  
  // 在选项页中，显示完整应用
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