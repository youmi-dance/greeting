import React, { useState } from 'react';
import Taro, { useLoad, useShareAppMessage } from '@tarojs/taro';
import { View } from '@tarojs/components';
import { Video, Button, SafeArea } from '@nutui/nutui-react-taro';
import { Share, Edit } from '@nutui/icons-react-taro';
import * as Types from '@/types';
import './index.scss';

const Player: React.FC = () => {
  const db = Taro.cloud.database()
  const [video, setVideo] = useState<Types.Video>();

  useShareAppMessage(() => ({
    title: '看看我用AI制作的专属祝福视频',
    path: '/pages/player/index?videoId=' + video?._id,
  }));

  useLoad(async () => {
    const routerParams = Taro.getCurrentInstance().router?.params ?? {}
    const { videoId = '' } = routerParams
    // console.log('~~~~~~~ videoId', videoId)
    const { data } = await db.collection('user_task').doc(videoId).get()
    console.log('~~~~~~~ videoRes', data);
    setVideo(data);
  })

  const handleGoCreate = async () => {
    // Taro.vibrateShort({ type: 'medium' });
    await Taro.switchTab({ url: '/pages/video-creator/index' })
  };

  return (
    <View className='player-page-wrapper'>
      {/* 第一层：基础流式布局，用于撑开高度 */}
      <View className='flex-body'>
        <View className='video-content'>
          <Video
            source={{
              src: video?.video_url ?? '',
              type: 'video/mp4'
            }}
            options={{
              poster: video?.image_file_id,
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
          <View className='user-name'>@悠米祝福</View>
          <View className='video-topic'>基于你的AI原声生成的专属祝福视频</View>
          <SafeArea position='bottom' />
        </View>
      </View>
    </View>
  );

};

export default Player;
