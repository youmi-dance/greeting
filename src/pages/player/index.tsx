import React from 'react';
import { View } from '@tarojs/components';
import { Video, Button, SafeArea } from '@nutui/nutui-react-taro';
import { Share, Edit } from '@nutui/icons-react-taro';
import Taro, { useShareAppMessage } from '@tarojs/taro';
import './index.scss';

const Player: React.FC = () => {
  useShareAppMessage(() => ({
    title: '看看我用 AI 制作的专属祝福视频',
    path: '/pages/player/index',
  }));

  const handleGoCreate = () => {
    Taro.vibrateShort({ type: 'medium' });
    Taro.navigateTo({ url: '/pages/record/index' });
  };

  return (
    <View className='player-page-wrapper'>
      {/* 第一层：基础流式布局，用于撑开高度 */}
      <View className='flex-body'>
        <View className='video-content'>
          <Video
            source={{
              src: 'https://your-cdn-url.com/ai-video.mp4',
              type: 'video/mp4'
            }}
            options={{
              poster: 'https://your-cdn-url.com/poster.jpg',
              controls: true,
              autoplay: true,
              loop: true
            }}
            objectFit='cover'
          />
        </View>
        {/* 关键：SafeArea 在普通文档流中，它会真实占据底部高度 */}
        <SafeArea position='bottom' />
      </View>

      {/* 第二层：绝对定位浮层，承载 UI 元素 */}
      <View className='ui-absolute-layer'>
        <View className='sidebar'>
          <Button className='action-item share-btn' openType='share' fill='none'>
            <Share size={24} color='#fff' />
            <View className='text'>分享</View>
          </Button>

          <View className='action-item create-btn' onClick={handleGoCreate}>
            <Edit size={24} color='#fff' />
            <View className='text'>制作同款</View>
          </View>
        </View>

        <View className='video-info-box'>
          <View className='user-name'>@AI 祝福助手</View>
          <View className='video-topic'>基于您的原声特征实时生成的专属祝福视频</View>
          <SafeArea position='bottom' />
        </View>
      </View>
    </View>
  );
};

export default Player;
