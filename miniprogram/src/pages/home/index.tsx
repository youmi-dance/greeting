import { useState } from 'react'
import { View, ScrollView, Text} from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { Grid, GridItem, Image, FixedNav, Toast} from '@nutui/nutui-react-taro'
import CustomTabBar from '@/components/CustomTabBar'
import { VideoList, Video } from '@/types/video';
import './index.scss'
import {useGlobal} from '../../GlobalContext';

const debugList = [
  {
    id: 1,
    text: '首页',
    icon: '',
    path: 'pages/home/index'
  },
  {
    id: 2,
    text: 'AI原声',
    icon: '',
    path: 'pages/voice-collector/index'
  },
  {
    id: 3,
    text: '祝福播放',
    icon: '',
    path: 'pages/player/index'
  },
]

function Home() {
  const db = Taro.cloud.database()
  const _ = db.command;
  const [videoList, setVideoList] = useState<VideoList>([])
  const { state } = useGlobal();

  useLoad(async () => {
    console.log('loading video list.' +  state.userInfo?._openid);
    // _openid是强校验，否则会有水平权限问题
    if (state.userInfo?._openid == null) {
      console.log('_openid empty!!!!');
      return;
    }
    const userTaskRt = await db.collection('user_task')
      .where({
        task_status: _.in(['SUCCEEDED', 'RUNNING', 'PENDING']),
        _openid: state.userInfo?._openid
      })
      .get()
    setVideoList(userTaskRt.data as VideoList);
  })

  const [visible, setVisible] = useState(false)
  const change = (value: boolean) => {
    setVisible(value)
  }
  const handleNavSelect = async (item) => {
    await Taro.navigateTo({ url: `/${item.path}` })
  }


  const listItemClick = (video: Video) => {
    // 列表中成功/生成中的均会展示，但只有成功的才能播放
    // todo: 但这个逻辑为啥没起作用?
    if(video.task_status !== 'SUCCEEDED') {
      Toast.show('notice', {
        content: '还在生成中，请稍后再试',
        position: 'center',
        type: 'warn'
      })
    } else {
      Taro.navigateTo({
       url: `/pages/player/index?videoId=${video._id}`
      })
  }
  }

  const statusTextMap: Record<string, string> = {
    'PENDING': '生成中...',
    'SUCCEEDED': '',
    'RUNNING': '',
    'FAILED': '生成失败，请重试'
  };

  const renderList = () => {
    return (
      <Grid columns={2} gap={10} className='video-grid'>
        {
          videoList.map((item, index) => (
            <GridItem
              key={index}
              className='video-card'
              onClick={() => listItemClick(item)}
            >
              <Image
                src={item.image_file_id}
                mode='aspectFill' // 确保图片铺满容器不变形
                width='100%'
                height='180' // 竖屏比例的关键：高度增加
                radius={12}
              />
              <Text className="status-text">
              {statusTextMap[item.task_status]} {/* 兜底 */}
              </Text>
            </GridItem>
          ))
        }
      </Grid>
    )
  }

  return (
    <View className='home-page'>

      <View className='content'>
        <ScrollView className='scroll-container' scrollY enhanced showScrollbar={false}>
          <View className='title'>
            <View className='main-title'>我的祝福</View>
            <View className='sub-title'>记录每一个温暖瞬间</View>
          </View>

          {renderList()}
        </ScrollView>
      </View>

      <CustomTabBar />
      <View className='header-bg' />

    </View>
  )
}

export default Home
