import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { AppState, useAppDispatch } from '../utils/store';
import { 
  startPomodoro, 
  pausePomodoro, 
  resumePomodoro, 
  resetPomodoro, 
  updateTimeLeft, 
  completePomodoro,
  setPomodoroSettings,
  PomodoroSettings
} from '../utils/slices/uiSlice';
import { 
  HiPlay, 
  HiPause, 
  HiRefresh, 
  HiClock, 
  HiAdjustments,
  HiX,
  HiCheck
} from 'react-icons/hi';

interface PomodoroContainerProps {
  isFullView?: boolean;
}

const PomodoroContainer = styled.div<PomodoroContainerProps>`
  background-color: ${props => props.theme.cardBackground};
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: ${props => props.isFullView ? '32px' : '16px'};
  margin-bottom: 20px;
  width: 100%;
  max-width: ${props => props.isFullView ? '600px' : '100%'};
  
  ${props => props.isFullView && `
    align-self: center;
    margin-top: 20px;
  `}
`;

interface TimerContainerProps {
  mode: 'work' | 'shortBreak' | 'longBreak';
  isFullView?: boolean;
}

const TimerContainer = styled.div<TimerContainerProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
  padding: ${props => props.isFullView ? '32px 20px' : '20px'};
  border-radius: 8px;
  background-color: ${props => {
    switch(props.mode) {
      case 'work': return props.theme.errorColorLight;
      case 'shortBreak': return props.theme.infoColorLight;
      case 'longBreak': return props.theme.primaryColorLight;
      default: return props.theme.cardBackground;
    }
  }};
`;

const TimerDisplay = styled.div<{ isFullView?: boolean }>`
  font-size: ${props => props.isFullView ? '4rem' : '3rem'};
  font-weight: bold;
  margin-bottom: 16px;
  font-family: 'Roboto Mono', monospace;
  color: ${props => props.theme.textColor};
`;

const TimerLabel = styled.div<{ isFullView?: boolean }>`
  font-size: ${props => props.isFullView ? '1.5rem' : '1rem'};
  margin-bottom: 8px;
  color: ${props => props.theme.textMuted};
`;

const TimerControls = styled.div<{ isFullView?: boolean }>`
  display: flex;
  gap: ${props => props.isFullView ? '20px' : '12px'};
  margin-top: 16px;
`;

const TimerButton = styled.button<{ isFullView?: boolean }>`
  background-color: ${props => props.theme.buttonBackground};
  color: ${props => props.theme.buttonText};
  border: none;
  border-radius: 50%;
  width: ${props => props.isFullView ? '60px' : '40px'};
  height: ${props => props.isFullView ? '60px' : '40px'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme.buttonHoverBackground};
  }
  
  &:disabled {
    background-color: ${props => props.theme.disabledColor};
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const TimerInfo = styled.div<{ isFullView?: boolean }>`
  margin-top: ${props => props.isFullView ? '16px' : '8px'};
  font-size: ${props => props.isFullView ? '1.1rem' : '0.9rem'};
  color: ${props => props.theme.textMuted};
`;

const PomodoroCount = styled.div<{ isFullView?: boolean }>`
  display: flex;
  gap: ${props => props.isFullView ? '16px' : '8px'};
  margin-top: ${props => props.isFullView ? '24px' : '8px'};
  justify-content: center;
`;

interface PomodoroCircleProps {
  active: boolean;
  isFullView?: boolean;
}

const PomodoroCircle = styled.div<PomodoroCircleProps>`
  width: ${props => props.isFullView ? '16px' : '12px'};
  height: ${props => props.isFullView ? '16px' : '12px'};
  border-radius: 50%;
  background-color: ${props => props.active ? props.theme.primaryColor : props.theme.borderColor};
`;

const SettingsButton = styled.button<{ isFullView?: boolean }>`
  background: transparent;
  border: none;
  color: ${props => props.theme.textMuted};
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  font-size: ${props => props.isFullView ? '1rem' : 'inherit'};
  
  &:hover {
    background-color: ${props => props.theme.hoverBackground};
    color: ${props => props.theme.textColor};
  }
`;

// 设置弹窗
const SettingsModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const SettingsModal = styled.div`
  background-color: ${props => props.theme.cardBackground};
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const SettingsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 1px solid ${props => props.theme.borderColor};
  padding-bottom: 12px;
`;

const SettingsTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  color: ${props => props.theme.textColor};
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.textMuted};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${props => props.theme.textColor};
  }
`;

const SettingsForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label`
  color: ${props => props.theme.textColor};
  font-size: 0.9rem;
`;

const FormInput = styled.input`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 4px;
  background-color: ${props => props.theme.inputBackground};
  color: ${props => props.theme.textColor};
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primaryColor};
  }
`;

const FormRow = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 400px) {
    flex-direction: column;
  }
`;

const FormCheckbox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CheckboxInput = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const SaveButton = styled.button`
  background-color: ${props => props.theme.primaryColor};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 16px;
  
  &:hover {
    background-color: ${props => props.theme.primaryColorDark};
  }
`;

interface PomoCirclesProps {
  total: number;
  completed: number;
  isFullView?: boolean;
}

const PomoCircles: React.FC<PomoCirclesProps> = ({ total, completed, isFullView }) => {
  return (
    <PomodoroCount isFullView={isFullView}>
      {Array.from({ length: total }).map((_, index) => (
        <PomodoroCircle key={index} active={index < completed} isFullView={isFullView} />
      ))}
    </PomodoroCount>
  );
};

interface PomodoroTimerProps {
  isFullView?: boolean;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ isFullView = false }) => {
  const dispatch = useAppDispatch();
  const { pomodoro } = useSelector((state: AppState) => state.ui);
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState<PomodoroSettings>(pomodoro.settings);
  
  // 通过计时器更新剩余时间
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (pomodoro.isActive) {
      interval = setInterval(() => {
        if (pomodoro.timeLeft <= 0) {
          // 时间到，完成当前番茄钟周期
          dispatch(completePomodoro());
          // 播放提示音
          playAlarmSound();
        } else {
          // 更新剩余时间
          dispatch(updateTimeLeft(pomodoro.timeLeft - 1));
        }
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [pomodoro.isActive, pomodoro.timeLeft, dispatch]);
  
  // 格式化时间：分:秒
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // 获取当前模式的标签文本
  const getModeLabel = (): string => {
    switch (pomodoro.mode) {
      case 'work': return '工作';
      case 'shortBreak': return '短休息';
      case 'longBreak': return '长休息';
      default: return '';
    }
  };
  
  // 播放提示音
  const playAlarmSound = () => {
    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg');
    audio.volume = pomodoro.settings.alarmVolume / 100;
    audio.play().catch(error => console.error('播放提示音失败:', error));
  };
  
  // 处理开始按钮点击
  const handleStartClick = () => {
    if (pomodoro.isActive) {
      dispatch(pausePomodoro());
    } else {
      if (pomodoro.startTime === null) {
        dispatch(startPomodoro(null));
      } else {
        dispatch(resumePomodoro());
      }
    }
  };
  
  // 处理重置按钮点击
  const handleResetClick = () => {
    dispatch(resetPomodoro());
  };
  
  // 更新设置表单
  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setTempSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value, 10) : value
    }));
  };
  
  // 保存设置
  const handleSaveSettings = () => {
    dispatch(setPomodoroSettings(tempSettings));
    setShowSettings(false);
  };
  
  // 计算进度
  const progress = pomodoro.timeLeft / pomodoro.totalTime;
  
  return (
    <PomodoroContainer isFullView={isFullView}>
      <TimerContainer mode={pomodoro.mode} isFullView={isFullView}>
        <TimerLabel isFullView={isFullView}>{getModeLabel()} {pomodoro.completedPomodoros > 0 && `#${Math.floor(pomodoro.completedPomodoros / 2) + 1}`}</TimerLabel>
        <TimerDisplay isFullView={isFullView}>{formatTime(pomodoro.timeLeft)}</TimerDisplay>
        
        <TimerControls isFullView={isFullView}>
          <TimerButton onClick={handleStartClick} isFullView={isFullView}>
            {pomodoro.isActive ? <HiPause size={isFullView ? 30 : 20} /> : <HiPlay size={isFullView ? 30 : 20} />}
          </TimerButton>
          <TimerButton onClick={handleResetClick} isFullView={isFullView}>
            <HiRefresh size={isFullView ? 30 : 20} />
          </TimerButton>
        </TimerControls>
      </TimerContainer>
      
      <PomoCircles 
        total={pomodoro.settings.longBreakInterval} 
        completed={pomodoro.completedPomodoros % (pomodoro.settings.longBreakInterval * 2)} 
        isFullView={isFullView}
      />
      
      <TimerInfo isFullView={isFullView}>
        已完成 {Math.floor(pomodoro.completedPomodoros / 2)} 个番茄钟
      </TimerInfo>
      
      <SettingsButton onClick={() => setShowSettings(true)} isFullView={isFullView}>
        <HiAdjustments size={isFullView ? 20 : 16} />
        番茄钟设置
      </SettingsButton>
      
      {showSettings && (
        <SettingsModalBackdrop onClick={() => setShowSettings(false)}>
          <SettingsModal onClick={e => e.stopPropagation()}>
            <SettingsHeader>
              <SettingsTitle>番茄钟设置</SettingsTitle>
              <CloseButton onClick={() => setShowSettings(false)}>
                <HiX size={20} />
              </CloseButton>
            </SettingsHeader>
            
            <SettingsForm>
              <FormRow>
                <FormGroup>
                  <FormLabel>工作时长 (分钟)</FormLabel>
                  <FormInput 
                    type="number" 
                    name="workDuration" 
                    value={tempSettings.workDuration} 
                    onChange={handleSettingChange}
                    min={1}
                    max={60}
                  />
                </FormGroup>
                
                <FormGroup>
                  <FormLabel>短休息时长 (分钟)</FormLabel>
                  <FormInput 
                    type="number" 
                    name="shortBreakDuration" 
                    value={tempSettings.shortBreakDuration} 
                    onChange={handleSettingChange}
                    min={1}
                    max={30}
                  />
                </FormGroup>
              </FormRow>
              
              <FormRow>
                <FormGroup>
                  <FormLabel>长休息时长 (分钟)</FormLabel>
                  <FormInput 
                    type="number" 
                    name="longBreakDuration" 
                    value={tempSettings.longBreakDuration} 
                    onChange={handleSettingChange}
                    min={1}
                    max={60}
                  />
                </FormGroup>
                
                <FormGroup>
                  <FormLabel>长休息间隔 (番茄钟数)</FormLabel>
                  <FormInput 
                    type="number" 
                    name="longBreakInterval" 
                    value={tempSettings.longBreakInterval} 
                    onChange={handleSettingChange}
                    min={1}
                    max={10}
                  />
                </FormGroup>
              </FormRow>
              
              <FormGroup>
                <FormLabel>提醒音量</FormLabel>
                <FormInput 
                  type="range" 
                  name="alarmVolume" 
                  value={tempSettings.alarmVolume} 
                  onChange={handleSettingChange}
                  min={0}
                  max={100}
                />
              </FormGroup>
              
              <FormRow>
                <FormCheckbox>
                  <CheckboxInput 
                    type="checkbox" 
                    name="autoStartBreaks" 
                    checked={tempSettings.autoStartBreaks} 
                    onChange={handleSettingChange}
                  />
                  <FormLabel>自动开始休息</FormLabel>
                </FormCheckbox>
                
                <FormCheckbox>
                  <CheckboxInput 
                    type="checkbox" 
                    name="autoStartPomodoros" 
                    checked={tempSettings.autoStartPomodoros} 
                    onChange={handleSettingChange}
                  />
                  <FormLabel>自动开始下一个番茄钟</FormLabel>
                </FormCheckbox>
              </FormRow>
              
              <SaveButton onClick={handleSaveSettings}>
                <HiCheck size={16} style={{ marginRight: '6px' }} />
                保存设置
              </SaveButton>
            </SettingsForm>
          </SettingsModal>
        </SettingsModalBackdrop>
      )}
    </PomodoroContainer>
  );
};

export default PomodoroTimer; 