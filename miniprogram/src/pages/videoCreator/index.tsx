import React, { useState, useCallback } from 'react';
import { View, ScrollView } from '@tarojs/components';
import { Uploader, TextArea, Button } from '@nutui/nutui-react-taro';
import Taro from '@tarojs/taro';
import CustomTabBar from '../../components/CustomTabBar';
import './index.scss';

const VideoCreator: React.FC = () => {
  const [currentFiles, setCurrentFiles] = useState<any[]>([]);
  const [blessingText, setBlessingText] = useState('');
  const [loading, setLoading] = useState(false);

  const [duration, setDuration] = useState(0);


  const handleUploadChange = (data: { fileList: any[] }) => {
    setCurrentFiles(data.fileList);
  };

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

      // step 1 先把图片上传到腾讯云
      // todo：回头把这个图片上传，和前面的音频上传抽成同一个函数@智珏

      // 文件后缀
      const ext = '.' + imageUrl.split('.').pop();
      const cloudPath = `uploads/images/${Date.now()}-${Math.floor(Math.random() * 1000)}${ext}`;

      // 上传图片到微信云
      Taro.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: imageUrl,
        success: (response) => {
            Taro.showToast({ title: '上传成功', icon: 'success' });
            setTimeout(() => setDuration(0), 1000);

            const res = Taro.cloud.getTempFileURL({
                fileList: [response.fileID]
            }).then((res) => {
                const publicImagUrl = res.fileList[0].tempFileURL;
                console.log('uploaded public image url: ' + publicImagUrl);

                // 查询当前用户的voice_id
                const voiceId = Taro.cloud.database().collection('user_voice')
                    .where({
                        'user_id': '123456'
                    }).get().then((res) => {
                       const voiceId = res.data[0].voice_id;
                       console.log('voiceId: ' + voiceId);

                // step 2：根据祝福文本+之前的音色，调用大模型合成声音
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



                // step 3：再调千问最后合成
                /**
                 * image: publicImagUrl
                 * audio: todo, step 2生成的音频微信云公网地址
                 *
                 */
                console.log('text: ' + blessingText + ' voiceId: ' + voiceId + ' imageUrl: ' + publicImagUrl);
                const synthesisResponse = Taro.request({
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
                    success: (res) => {
                      console.log('请求成功 res: ' + res.statusCode);
                      console.log('res: ' + JSON.stringify(res));
                      console.log('voice_id: ' + res.data.output.task_id);

                      // 持久化合成的任务id
                      Taro.cloud.database().collection('user_task').add({
                          data: {
                              user_id: '123456',
                              task_id: res.data.output.task_id,
                              task_type: 'synthesis',
                              request_id: res.data.output.request_id,
                              gmt_create: Date.now()
                          }
                      });
                    }
                  })


                    });

            });

        },
        fail: err => {
          console.log(err);
        }
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

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

          {/* 生成按钮：现在它在 ScrollView 内部，会随页面滚动 */}
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
