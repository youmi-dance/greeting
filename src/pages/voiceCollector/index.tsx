import React, { useState, useEffect, useRef } from 'react';
import { View } from '@tarojs/components';
import { Toast } from '@nutui/nutui-react-taro';
import { Microphone } from '@nutui/icons-react-taro';
import Taro from '@tarojs/taro';
import './index.scss';

const recorderManager = Taro.getRecorderManager();

const VoiceRecord: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [toast, setToast] = useState({ visible: false, msg: '', type: 'text' });

  const timerRef = useRef<any>(null);
  const isPressing = useRef(false); // 关键：记录用户当前的物理按压状态
  const MAX_SEC = 60;

  useEffect(() => {
    // 录音停止监听
    recorderManager.onStop((res) => {
      stopTimer();
      const { tempFilePath, duration: actualDuration } = res;

      // 只有录音时长超过 1.5s 才视为有效，并清空进度
      if (actualDuration < 1500) {
        setToast({ visible: true, msg: '录音太短，请长按说话', type: 'fail' });
        setDuration(0);
        return;
      }
      uploadAudioFile(tempFilePath);
    });

    recorderManager.onError((err) => {
      console.error('录音机错误:', err);
      handleRecBtnTouchEnd();
      setToast({ visible: true, msg: '录音失败，请重试', type: 'fail' });
    });

    return () => stopTimer();
  }, []);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    stopTimer();
    setDuration(0);
    let count = 0;
    timerRef.current = setInterval(() => {
      count++;
      if (count >= MAX_SEC) {
        setDuration(MAX_SEC);
        handleRecBtnTouchEnd();
      } else {
        setDuration(count);
      }
    }, 1000);
  };

  // 按钮按下处理
  const handleRecBtnTouchStart = async (e) => {
    e.stopPropagation();
    isPressing.current = true; // 记录按下动作

    // 权限检查
    try {
      const setting = await Taro.getSetting();
      if (!setting.authSetting['scope.record']) {
        await Taro.authorize({ scope: 'scope.record' });
      }
    } catch (err) {
      isPressing.current = false;
      Taro.showModal({
        title: '权限提示',
        content: '需要麦克风权限才能录音',
        success: (res) => res.confirm && Taro.openSetting()
      });
      return;
    }

    // 【核心修复】权限检查完后，如果用户已经松手，则直接退出不启动录音
    if (!isPressing.current) return;

    Taro.vibrateShort({ type: 'medium' });
    setIsRecording(true);
    startTimer();

    recorderManager.start({
      duration: MAX_SEC * 1000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 96000,
      format: 'mp3',
    });
  };

  // 按钮松开处理
  const handleRecBtnTouchEnd = (e?: any) => {
    if (e) e.stopPropagation();

    isPressing.current = false; // 记录松开动作

    // 只有在真正处于录音状态时才调用停止
    if (isRecording) {
      setIsRecording(false);
      stopTimer();
      recorderManager.stop();
    }
  };

  const uploadAudioFile = async (filePath: string) => {
    Taro.showLoading({ title: '语音解析中...' });
    try {
      // 文件后缀
      const ext = '.' + filePath.split('.').pop();
      const cloudPath = `uploads/${Date.now()}-${Math.floor(Math.random() * 1000)}${ext}`;

      const res = Taro.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: filePath,
        success: (response) => {
          Taro.showToast({ title: '录制成功', icon: 'success' });
          setTimeout(() => setDuration(0), 1000);
          // 上传后返回的文件【临时]url
          console.log("上传采集声音的url: " + getTempFileUrl(response.fileID));
        },
        fail: err => {
          console.log(err);
        }
      });

    } catch (error) {
      console.error('上传出错:', error);
    } finally {
      Taro.hideLoading();
    }

  };

  // 获取上传文件的临时链接
  function getTempFileUrl = async (fileID) => {
    try {
      const res = await Taro.cloud.getTempFileURL({
        fileList: [fileID]
      })

      if (res.fileList && res.fileList[0]) {
        const url = res.fileList[0].tempFileURL;
        console.log('url', url);
        return url;
      }
    } catch (error) {
      console.error('获取临时链接失败:', error)
    }
  }

  const progressDeg = (duration / MAX_SEC) * 360;

  return (
    <View className='voice-collector'>
      <Toast
        visible={toast.visible}
        msg={toast.msg}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      <View className='header-area'>
        <View className='title'>定制 AI 原声</View>
        <View className='subtitle'>录制一段语音，让 AI 学习您的独特嗓音</View>
      </View>

      <View className='main-control'>
        <View className='center-anchor'>
          {/* 呼吸灯效果 */}
          {isRecording && <View className='breath-ripple' />}

          {/* 进度环层 */}
          <View
            className='progress-ring'
            style={{
              background: `conic-gradient(#fa2c19 ${progressDeg}deg, #f0f2f5 0deg)`
            }}
          >
            {/* 交互按钮层 */}
            <View
              className={`mic-trigger ${isRecording ? 'is-active' : ''}`}
              onTouchStart={handleRecBtnTouchStart}
              onTouchEnd={handleRecBtnTouchEnd}
              onClick={(e) => e.stopPropagation()}
            >
              <View className='gradient-core'>
                <Microphone size={26} color='#fff' />
              </View>
            </View>
          </View>
        </View>

        <View className='info-text'>
          <View className={`timer ${isRecording ? 'recording' : ''}`}>
            {isRecording ? `正在录制 ${duration}s` : '按住说话'}
          </View>
          <View className='guide'>录制时间越长，AI 还原度越高</View>
        </View>
      </View>

      <View className='bottom-notice'>
        请保持环境安静，点击按钮无法录音，需长按
      </View>
    </View>
  );
};

export default VoiceRecord;
