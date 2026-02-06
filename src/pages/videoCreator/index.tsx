import React, { useState, useCallback } from 'react';
import { View, ScrollView } from '@tarojs/components';
import { Uploader, TextArea, Button } from '@nutui/nutui-react-taro';
import Taro from '@tarojs/taro';
import CustomTabBar from '../../components/CustomTabBar';
import './index.scss';

const CreateVideo: React.FC = () => {
  const [currentFiles, setCurrentFiles] = useState<any[]>([]);
  const [blessingText, setBlessingText] = useState('');
  const [loading, setLoading] = useState(false);

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
    <View className='page-wrapper'>
      <View className='bg-decorator' />

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
            <View className='label'>第一步：上传素材</View>
          </View>
          <Uploader
            url='YOUR_SERVER_URL'
            onChange={handleUploadChange}
            onDelete={handleUploadChange}
          >
            <View className='upload-placeholder'>
              <View className='plus-icon'>+</View>
              <View className='text'>{currentFiles.length > 0 ? '已选择' : '上传照片'}</View>
            </View>
          </Uploader>
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
            block
            className='custom-gradient-btn'
            loading={loading}
            onClick={handleGenerate}
          >
            开启智能生成
          </Button>
          {/* 增加一点底部间距，防止离 Tabbar 太近 */}
          <View className='bottom-spacer' />
        </View>
      </ScrollView>

      {/* 底部 Tabbar：依然在 ScrollView 之外，保持在屏幕最下方 */}
      <View>
        <CustomTabBar />
      </View>
    </View>
  );
};

export default CreateVideo;
