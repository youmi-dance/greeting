import React, { useState, useEffect, useRef } from 'react';
import { View } from '@tarojs/components';
import { Toast } from '@nutui/nutui-react-taro';
import { Microphone } from '@nutui/icons-react-taro';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import './index.scss';

const recorderManager = Taro.getRecorderManager();

const VoiceRecord: React.FC = () => {
  const db = Taro.cloud.database()
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const timerRef = useRef<any>(null);
  const isPressing = useRef(false); // 关键：记录用户当前的物理按压状态
  const MAX_SEC = 60;

  useEffect(() => {
    // 录音停止监听
    recorderManager.onStop(async (res) => {
      stopTimer();
      const {
        tempFilePath,
        duration,
        // fileSize
      } = res;

      // 只有录音时长超过 1.5s 才视为有效，并清空进度
      if (duration < 1500) {
        Toast.show('notice', {
          content: '录音太短，请长按采集声音',
          position: 'bottom',
          type: 'fail',
        })
        setRecordingDuration(0);
        return;
      }

      /**
       * 上传音色文件，并提交到大模型服务处理
       */
      Toast.show('notice', {
        content: '语音解析中',
        position: 'bottom',
        type: 'loading',
      })

      try {
        const fileId = await uploadVoiceFile(tempFilePath);
        const fileTempURL = await getVoiceFileTempURLByFileId(fileId)
        console.log('file tmpe url: ', fileTempURL);
        // 调用千问接口创建音色
        await fetchModelToCreateVoice(fileTempURL, fileId);
        Toast.show('notice', {
          content: '语音解析成功',
          position: 'bottom',
          type: 'success',
        })
      } catch(err) {
        Toast.show('notice', {
          content: '语音解析失败，请重试',
          position: 'bottom',
          type: 'fail',
        })
      }
    });

    recorderManager.onError((err) => {
      console.error('录音错误:', err);
      handleRecBtnTouchEnd();
      Toast.show('notice', {
        content: '录音失败，请重试',
        type: 'fail',
      })
    });

    return () => stopTimer();
  }, []);

  /**
   * 上传音色文件到微信云，并返回 fileID
   * @param filePath
   */
  const uploadVoiceFile = async (filePath: string): Promise<string> => {
    try {
      // 文件后缀
      const ext = filePath.split('.').pop();
      const cloudPath = `voices/${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`;

      // 上传采集的音频到微信云
      const response = await Taro.cloud.uploadFile({
        cloudPath,
        filePath: filePath,
      });
      return response.fileID
    } catch (error) {
      console.error('上传出错:', error);
      throw error;
    }
  };

  // 克隆音色并获取voice_id
  // https://help.aliyun.com/zh/model-studio/cosyvoice-clone-api
  const fetchModelToCreateVoice = async (voiceURL: string, voiceFileId: string) => {
    try {
      // const res = await Taro.request({
      //   url: 'https://dashscope.aliyuncs.com/api/v1/services/audio/tts/customization',
      //   method: 'POST',
      //   data: {
      //     model: 'voice-enrollment',
      //     input: {
      //       action: 'create_voice',
      //       target_model: 'cosyvoice-v3-plus',
      //       prefix: 'testvoice',
      //       url: voiceURL,
      //       language_hints: ['zh']
      //     }
      //   },
      //   header: {
      //     // 'Content-type': 'application/json',
      //     // sk-b9e99c3d10504180bea3ef1edc4989af
      //     'Authorization': 'Bearer sk-b9e99c3d10504180bea3ef1edc4989af'
      //   },
      // })
      const res = await Taro.request({
        url: 'https://dashscope.aliyuncs.com/api/v1/services/audio/tts/customization',
        method: 'POST',
        data: {
          model: 'qwen-voice-enrollment',
          input: {
            action: 'create',
            target_model: 'qwen3-tts-vc-2026-01-22',
            preferred_name: 'my_voice',
            audio: {
              data: voiceURL,
            },
          }
        },
        header: {
          Authorization: 'Bearer sk-b9e99c3d10504180bea3ef1edc4989af',
        },
      })
      console.log('~~~~~~~ fetchModelToCreateVoice res =>', res);

      // 同步将voice_id存入用户的音色表（当前默认一个用户就一个音色；后续再支持多个）
      await db.collection('user_voice').add({
        data: {
          voice_id: res.data.output.voice_id,
          cloud_file_id: voiceFileId,
          gmt_create: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        }
      })
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  // 获取上传文件的临时链接
  const getVoiceFileTempURLByFileId = async (fileID): Promise<string> => {
    try {
      const res = await Taro.cloud.getTempFileURL({
        fileList: [fileID]
      })

      return res.fileList?.[0]?.tempFileURL;
    } catch (error) {
      console.error('获取临时链接失败:', error)
      throw error;
    }
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    stopTimer();
    setRecordingDuration(0);
    let count = 0;
    timerRef.current = setInterval(() => {
      count++;
      if (count >= MAX_SEC) {
        setRecordingDuration(MAX_SEC);
        handleRecBtnTouchEnd();
      } else {
        setRecordingDuration(count);
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
      const res = await Taro.showModal({
        title: '权限提示',
        content: '需要麦克风权限才能录音',
      });
      if (res.confirm) {
        await Taro.openSetting()
      }
      return;
    }

    if (!isPressing.current) return;

    await Taro.vibrateShort({ type: 'medium' });
    setIsRecording(true);
    startTimer();

    recorderManager.start({
      format: 'mp3',
      duration: MAX_SEC * 1000,
      sampleRate: 16000,
      numberOfChannels: 2,
      encodeBitRate: 48000,
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



  const progressDeg = (recordingDuration / MAX_SEC) * 360;

  return (
    <View className='voice-collector'>
      <Toast id='notice' />

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
            {isRecording ? `正在录制 ${recordingDuration}s` : '按住说话'}
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
