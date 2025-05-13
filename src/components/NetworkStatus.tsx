import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { AppState, useAppDispatch } from '../utils/store';
import { setNetworkStatus } from '../utils/slices/uiSlice';
import { 
  HiWifi, 
  HiSignalSlash, 
  HiExclamationCircle, 
  HiArrowsRightLeft,
  HiArrowPath
} from 'react-icons/hi2';
import { listenToNetworkChanges } from '../utils/offlineSupport';
import { syncOfflineActions } from '../utils/syncService';

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'error' | 'syncing';
}

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 8px;
  margin-right: 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  opacity: 0.8;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 1;
  }
`;

const StatusIndicator = styled.div<StatusIndicatorProps>`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${props => {
    switch (props.status) {
      case 'online': return props.theme.successColor;
      case 'offline': return props.theme.textMuted;
      case 'error': return props.theme.errorColor;
      case 'syncing': return props.theme.infoColor;
      default: return props.theme.textColor;
    }
  }};
`;

const SyncButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.textMuted};
  padding: 4px;
  margin-left: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.theme.textColor};
    background-color: ${props => props.theme.hoverBackground};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusText = styled.span`
  @media (max-width: 600px) {
    display: none;
  }
`;

const NetworkStatus: React.FC = () => {
  const dispatch = useAppDispatch();
  const { networkStatus, syncStatus, needsSync } = useSelector((state: AppState) => state.ui);
  
  // 监听网络状态变化
  useEffect(() => {
    const handleOnline = () => dispatch(setNetworkStatus('online'));
    const handleOffline = () => dispatch(setNetworkStatus('offline'));
    
    // 初始化时设置当前状态
    dispatch(setNetworkStatus(navigator.onLine ? 'online' : 'offline'));
    
    // 添加事件监听
    const cleanup = listenToNetworkChanges(handleOnline, handleOffline);
    
    return cleanup;
  }, [dispatch]);
  
  // 手动触发同步
  const handleSyncClick = async () => {
    if (networkStatus === 'online') {
      dispatch({ type: 'ui/setSyncStatus', payload: 'syncing' });
      await syncOfflineActions(dispatch);
    }
  };
  
  // 决定显示的状态图标和文本
  const getStatusInfo = () => {
    if (networkStatus === 'offline') {
      return {
        icon: <HiSignalSlash size={16} />,
        text: '离线',
        status: 'offline' as const
      };
    }
    
    if (syncStatus === 'error') {
      return {
        icon: <HiExclamationCircle size={16} />,
        text: '同步错误',
        status: 'error' as const
      };
    }
    
    if (syncStatus === 'syncing') {
      return {
        icon: <HiArrowPath size={16} className="rotating" />,
        text: '正在同步...',
        status: 'syncing' as const
      };
    }
    
    if (needsSync) {
      return {
        icon: <HiWifi size={16} />,
        text: '需要同步',
        status: 'online' as const
      };
    }
    
    return {
      icon: <HiWifi size={16} />,
      text: '已同步',
      status: 'online' as const
    };
  };
  
  const statusInfo = getStatusInfo();
  
  return (
    <StatusContainer>
      <StatusIndicator status={statusInfo.status}>
        {statusInfo.icon}
        <StatusText>{statusInfo.text}</StatusText>
      </StatusIndicator>
      
      {(needsSync || syncStatus === 'error') && networkStatus === 'online' && (
        <SyncButton 
          onClick={handleSyncClick}
          disabled={syncStatus === 'syncing'}
          title="手动同步"
        >
          <HiArrowsRightLeft size={14} />
        </SyncButton>
      )}
    </StatusContainer>
  );
};

export default NetworkStatus; 