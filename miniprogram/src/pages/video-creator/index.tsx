import React, { useState , useEffect} from 'react';
import { View, ScrollView } from '@tarojs/components';
import { Uploader, UploaderProps, FileItem, TextArea, Button, Toast } from '@nutui/nutui-react-taro';
import Taro, { useLoad } from '@tarojs/taro';
import CustomTabBar from '@/components/CustomTabBar';
import { GenerateAudioResponse, GenerateVideoResponse, Voice } from '@/types';
import dayjs from 'dayjs';
import './index.scss';
import {useGlobal} from '../../GlobalContext';

interface CloudFileInfo {
  tempFileURL: string;
  fileId: string;
}

const VideoCreator: React.FC = () => {
  const db = Taro.cloud.database()
  const [selectedImage, setSelectedImage] = useState<FileItem>();
  const [blessingText, setBlessingText] = useState('');
  const [loading, setLoading] = useState(false);
  const { state } = useGlobal();

  const handleUploadChange: UploaderProps['onChange'] = (files) => {
    if (files.length > 0) {
      setSelectedImage(files[0])
    }
  };

  /**
   * step1 上传图片到微信云存储，并返回图片公网 URL
   */
  const uploadImageToWxCloud = async (): Promise<CloudFileInfo> => {
    const filePath: string = selectedImage?.path ?? selectedImage?.url ?? '';

    const ext = filePath.split('.').pop();
    const cloudPath = `images/${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`;

    try {
      const { fileID } = await Taro.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: filePath,
      })

      const fileURLRes = await Taro.cloud.getTempFileURL({
        fileList: [fileID]
      })
      const { tempFileURL } = fileURLRes.fileList[0];
      // console.log('~~~~~~~ uploadImage => tempFileURL', tempFileURL);

      Toast.show('notice', {
        content: '上传成功',
        position: 'center',
        type: 'success',
      })

      return {
        fileId: fileID,
        tempFileURL,
      };
    } catch(err) {
      console.error(err)
      Toast.show('notice', {
        content: '上传失败',
        position: 'center',
        type: 'fail',
      })
      throw err;
    }
  }

  /**
   * 读取当前用户的 voiceData
   */
  const fetchVoiceData = async (): Promise<Voice> => {
    // 查询当前用户的voice_id
    const voiceRt = await db.collection('user_voice').get()
    return voiceRt.data[0] as Voice;
  }

  /**
   * step 2：根据祝福文本+之前的音色，调用大模型合成声音
   */
  const generateAudio = async (text: string, voiceId: string) => {
    /**
     * 根据文档上的python SDK调用反向推测出：https://help.aliyun.com/zh/model-studio/qwen-tts-voice-cloning?spm=a2c4g.11186623.0.0.2502435awD34Xo#f9ba08cd4ewkv
     *
     * =====response======
     * {
     *   'output': {
     *     'audio': {
     *       'data':'',
     *       'expires_at':1771004886,
     *       'id':'audio_0a255f04-66fb-4394-b497-a3e188f790b9',
     *       'url':'http://dashscope-result-bj.oss-cn-beijing.aliyuncs.com/1d/13/20260213/5655f9db/7c3e8c27-0ca5-43d0-9453-f44410402f01.wav?Expires=1771004886&OSSAccessKeyId=LTAI5tPxpiCM2hjmWrFXrym1&Signature=BczEz9TOPluPUgTnyRaksMpShz4%3D'
     *     },
     *     'finish_reason':'stop'
     *   },
     *   'usage':{'characters':87},
     *   'request_id':'0a255f04-66fb-4394-b497-a3e188f790b9'
     * }
     *
     * input:
     *  voice_id: voiceId
     *  text:  blessingText
     *
     * ouput:
     *  audioPublicUrl
     *
     */
    try {
      const res = await Taro.request<GenerateAudioResponse>({
        url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
        method: 'POST',
        data: {
          model: 'qwen3-tts-vc-2026-01-22',
          input: {
            text: text,
            // 先写死这个音色用于联调
            voice: voiceId,
            // voice: 'qwen-tts-vc-my_voice-voice-20260212215658933-9ec9'
          }
        },
        header: {
          'Authorization': 'Bearer sk-b9e99c3d10504180bea3ef1edc4989af'
          //'X-DashScope-Async': true
        },
      })
      console.log('~~~~~~~ generateAudio => res', res);
      return res;
    } catch(err) {
      throw err;
    }
  }

  /**
   * step 3：再调千问最后合成视频
   * @param audioURL
   * @param imageURL
   */
  const generateVideo = async (audioURL: string, imageURL: string, duration: number) => {
    try {
      const res = await Taro.request<GenerateVideoResponse>({
        url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis',
        method: 'POST',
        data: {
          model: 'wan2.6-i2v-flash',
          input: {
            prompt: '根据提供的图片和语音，合成一个视频，并且嘴型要严格对上',
            img_url: imageURL,
            audio_url: audioURL,
          },
          parameters: {
            resolution: '720P',
            prompt_extend: true,
            duration: duration,
          },
        },
        header: {
          'Authorization': 'Bearer sk-b9e99c3d10504180bea3ef1edc4989af',
          'X-DashScope-Async': 'enable'
        },
      })
      console.log('~~~~~~~ generateVideo => res', res);
      return res;
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    console.log('use effect', state.userInfo?._openid);
    // todo：如果用户在分享页面，直接点击【制作同款】，强校验其是否有采集过音色；如果没有需要redirect过去
  });

  const handleGenerate = async () => {

      if (!selectedImage) {
        Toast.show('notice', {
          content: '请选择照片',
          position: 'center',
          type: 'fail',
       })
        return;
      }
     if (!blessingText.trim()) {
        Toast.show('notice', {
          content: '请输入祝福语',
          position: 'center',
          type: 'fail',
       })
       return;
      }

    setLoading(true);
    await Taro.showLoading({ title: 'AI 视频生成中', mask: true });

    try{
      // 取音色
      const { voice_id: voiceId } = await fetchVoiceData()
      console.log('~~~~~~~ voiceId', voiceId);

      // step1 上传图片到微信云存储，并返回图片公网 URL
      const { tempFileURL: imageTempURL, fileId } = await uploadImageToWxCloud()

      // step 2：根据祝福文本+之前的音色，调用大模型合成声音
      const audioRes = await generateAudio(blessingText, voiceId)

      const audioURL = audioRes.data.output.audio.url
      // step 3：再调千问最后合成视频
      // 预估语音长度，用于后面的视频生成长度
      const duration = estimateVoiceDuration(blessingText);
      const videoDuration = Math.min(Math.max(duration, 2), 15);
      console.log('duration: ', videoDuration);
      /**
       * wan2.6-i2v-flash：取值为[2, 15]之间的整数。默认值为5。
       * 详见
       * https://help.aliyun.com/zh/model-studio/image-to-video-api-reference/?spm=a2c4g.11186623.help-menu-2400256.d_2_3_0.324f367djNAHi3&scm=20140722.H_2867393._.OR_help-T_cn~zh-V_1
       */
      const videoRes = await generateVideo(audioURL, imageTempURL, videoDuration)

      // step 4：存入数据库
      const {
        output: {
          task_status,
          task_id,
        },
        request_id,
      } = videoRes.data

      // 持久化合成的任务信息
      await db.collection('user_task').add({
        data: {
          task_id,
          task_status,
          request_id,
          image_file_id: fileId,
          text: blessingText,
          gmt_create: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        }
      });

      Taro.hideLoading();
      const modalRes = await Taro.showModal({
        title: '生成成功',
        content: '你的祝福视频生成任务已创建，大概需要等待1-2分钟',
        confirmText: '回首页',
        showCancel: false,
      });
      if (modalRes.confirm) {
        await Taro.switchTab({
          url: '/pages/home/index',
        });
      }
    } catch (err) {
      Taro.hideLoading();
      Toast.show('notice', {
        content: '生成失败',
        position: 'center',
        type: 'fail',
      })
    } finally {
      setLoading(false);
    }
  };


  // 返回文本对应的语音时长预估
  const estimateVoiceDuration = (text) => {
    if (!text || typeof text !== 'string') {
      return 0;
    }
    const wordsPerMinute: number = 150
    // 只统计中文字符、英文字母、数字（忽略标点、空格、换行等）
    const validChars = text.match(/[\u4e00-\u9fa5a-zA-Z0-9]/g) || [];
    const charCount = validChars.length;
    if (charCount === 0) {
      return 0;
    }
    // 计算每秒字数
    const charsPerSecond = wordsPerMinute / 60;
    // 时长 = 字数 / 每秒字数
    const duration = charCount / charsPerSecond;
    // 保留1位小数，向上取整更符合实际（避免太短）
    return Math.round(duration);
  }

  return (
    <View className='video-creator'>
      <Toast id='notice' />

      <View className='content'>
        <ScrollView
          scrollY
          enhanced
          showScrollbar={false}
          className='content-flow'
        >
          <View className='header-section'>
            <View className='main-title'>制作你的祝福视频</View>
            <View className='sub-title'>每一次祝福都值得用心记录</View>
          </View>

          {/* 第一步 */}
          <View className='glass-card'>
            <View className='card-header'>
              <View className='indicator' />
              <View className='label'>第一步：上传你的照片</View>
            </View>
            <Uploader
              className='uploader'
              autoUpload={false}
              onChange={handleUploadChange}
              mediaType={['image']}
              sizeType={['compressed']}
            />
          </View>

          {/* 第二步 */}
          <View className='glass-card'>
            <View className='card-header'>
              <View className='indicator' />
              <View className='label'>第二步：写下你的祝福语</View>
            </View>
            <TextArea
              placeholder='美好祝愿从这里开始...'
              className='custom-textarea'
              maxLength={42}
              showCount
              value={blessingText}
              onChange={(v) => setBlessingText(v)}
            />
          </View>

          <View className='btn-container'>
            <Button
              type='primary'
              block
              className='custom-gradient-btn'
              loading={loading}
              onClick={handleGenerate}
            >
              一键生成
            </Button>
          </View>
        </ScrollView>
      </View>

      <CustomTabBar />
      <View className='bg-decorator' />
    </View>
  );
};

export default VideoCreator;
