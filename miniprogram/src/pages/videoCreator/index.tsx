import React, { useState, useCallback } from 'react';
import { View, ScrollView } from '@tarojs/components';
import { Uploader, TextArea, Button } from '@nutui/nutui-react-taro';
import Taro from '@tarojs/taro';
import CustomTabBar from '../../components/CustomTabBar';
import './index.scss';
import {after} from 'node:test';

const VideoCreator: React.FC = () => {
  const db = Taro.cloud.database()
  const [currentFiles, setCurrentFiles] = useState<any[]>([]);
  const [blessingText, setBlessingText] = useState('');
  const [loading, setLoading] = useState(false);

  const [duration, setDuration] = useState(0);


  const handleUploadChange = (data: { fileList: any[] }) => {
    setCurrentFiles(data.fileList)
  };

  /**
   * step1 上传图片到微信云存储，并返回图片公网 URL
   * @param cloudPath
   * @param imageUrl
   */
  const uploadImageToWxCloud = async (cloudPath: string, imageUrl: string): Promise<string> => {
    try {
      const { fileID } = await Taro.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: imageUrl,
      })
      await Taro.showToast({ title: '上传成功', icon: 'success' })
      // setTimeout(() => setDuration(0), 1000);

      const fileURLRes = await Taro.cloud.getTempFileURL({
        fileList: [fileID]
      })

      const publicImagUrl = fileURLRes.fileList[0].tempFileURL;
      console.log('uploaded public image url: ' + publicImagUrl)
      return publicImagUrl;
    } catch(err) {
      console.error(err)
      await Taro.showToast({ title: '上传失败', icon: 'error' })
    }
  }

  /**
   * 读取当前用户的 voiceId
   */
  const fetchVoiceId = async (): Promise<string> => {
    // 查询当前用户的voice_id
    const userVoiceRes = await db.collection('user_voice').get()
    const voiceId = userVoiceRes.data[0].voice_id
    console.log('voiceId: ' + voiceId)
    return voiceId
  }

  /**
   * step 2：根据祝福文本+之前的音色，调用大模型合成声音
   * @param cloudPath
   * @param imageUrl
   */
  const generateAudio = async () => {
    // https://help.aliyun.com/zh/model-studio/cosyvoice-clone-api
    /**
     * input:
     *  voice_id: voiceId
     *  text:  blessingText
     *
     * ouput:
     *  audioPublicUrl
     *
     * API: https://dashscope.aliyuncs.com/api/v1/services/aigc/text2audio/text-to-audio
     *         {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${this.apiKey}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         model: this.model,
         input: {
           text: text,
           voice: this.voice,
           language_type: this.languageType,
           format: this.format,
           sample_rate: this.sampleRate,
         },
       }),
     }
     */
    try {
      console.log('step2')
    } catch(err) {
      console.error(err)
      await Taro.showToast({ title: '上传失败', icon: 'error' })
    }
  }

  /**
   * step 3：再调千问最后合成视频
   * @param voiceId
   * @param publicImagUrl
   */
  const generateVideo = async (voiceId: string, publicImagUrl: string) => {
    console.log('step3')
    /**
     * image: publicImagUrl
     * audio: todo, step 2生成的音频微信云公网地址
     *
     */
    console.log('text: ' + blessingText + ' voiceId: ' + voiceId + ' imageUrl: ' + publicImagUrl);
    const synthesisResponse = await Taro.request({
      url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis',
      method: 'POST',
      data: {
        model: 'wan2.6-i2v-flash',
        input: {
          // prompt: '',
          image_url: publicImagUrl,
          audio_url: '',
          url: 'audioUrl',
          language_hints: ['zh']
        }
      },
      header: {
        'Content-type': 'application/json',
        'Authorization': 'Bearer sk-b9e99c3d10504180bea3ef1edc4989af',
        'X-DashScope-Async': true
      },
    })
    console.log('请求成功 res: ' + synthesisResponse.statusCode);
    console.log('res: ' + JSON.stringify(synthesisResponse));
    console.log('voice_id: ' + synthesisResponse.data.output.task_id);

    // 持久化合成的任务id
    db.collection('user_task').add({
      data: {
        user_id: '123456',
        task_id: synthesisResponse.data.output.task_id,
        task_type: 'synthesis',
        request_id: synthesisResponse.data.output.request_id,
        gmt_create: Date.now()
      }
    });
  }

  const handleGenerate = useCallback(async () => {
    if (currentFiles.length === 0) {
      Taro.showToast({ title: '请上传照片', icon: 'none' });
      return;
    }
    if (!blessingText.trim()) {
      Taro.showToast({ title: '请输入祝福语', icon: 'none' });
      return;
    }

    setLoading(true);
    Taro.showLoading({ title: 'AI 视频生成中', mask: true });

    try {
      const file = currentFiles[0];
      const imageUrl = file?.url || file?.tempFilePath;

      // 文件后缀
      const ext = '.' + imageUrl.split('.').pop();
      const cloudPath = `uploads/images/${Date.now()}-${Math.floor(Math.random() * 1000)}${ext}`;

      // 获取 voiceId
      const voiceId = await fetchVoiceId()

      // step1 上传图片到微信云存储，并返回图片公网 URL
      const publicImagUrl = await uploadImageToWxCloud(cloudPath, imageUrl)
      // step 2：根据祝福文本+之前的音色，调用大模型合成声音
      await generateAudio()
      // step 3：再调千问最后合成视频
      await generateVideo(voiceId, publicImagUrl)

      Taro.hideLoading();
      Taro.showModal({
        title: '生成成功',
        content: '您的祝福视频已准备就绪',
        confirmText: '去查看',
        showCancel: false,
        success: (res) => {
          if (res.confirm) Taro.navigateTo({ url: '/pages/preview/index' });
        }
      });
    } catch (err) {
      Taro.hideLoading();
      Taro.showToast({ title: '生成失败', icon: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentFiles, blessingText]);

  return (
    <View className='video-creator'>
      <View className='content'>
        <ScrollView
          scrollY
          enhanced
          showScrollbar={false}
          className='content-flow'
        >
          <View className='header-section'>
            <View className='main-title'>定制专属视频</View>
            <View className='sub-title'>上传照片并填写祝福，开启 AI 创作</View>
          </View>

          {/* 第一步 */}
          <View className='glass-card'>
            <View className='card-header'>
              <View className='indicator' />
              <View className='label'>第一步：上传照片</View>
            </View>
            <Uploader
              className='uploader'
              url='YOUR_SERVER_URL'
              onChange={handleUploadChange}
              // onDelete={handleUploadChange}
            />
          </View>

          {/* 第二步 */}
          <View className='glass-card'>
            <View className='card-header'>
              <View className='indicator' />
              <View className='label'>第二步：文字寄语</View>
            </View>
            <TextArea
              placeholder='写下您的美好祝愿...'
              className='custom-textarea'
              maxLength={30}
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
              开启智能生成
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
