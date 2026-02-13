import { useState } from 'react'
import { View, ScrollView } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { Grid, GridItem, Image, FixedNav } from '@nutui/nutui-react-taro'
import CustomTabBar from '@/components/CustomTabBar'
import { VideoList, Video } from '@/types/video';
import './index.scss'

const debugList = [
  {
    id: 1,
    text: '首页',
    icon: '',
    path: 'pages/home/index'
  },
  {
    id: 2,
    text: '声纹采集',
    icon: '',
    path: 'pages/voice-collector/index'
  },
  {
    id: 3,
    text: '播放页',
    icon: '',
    path: 'pages/player/index'
  },
]

function Home() {
  const db = Taro.cloud.database()
  const [videoList, setVideoList] = useState<VideoList>([])

  useLoad(async () => {
    const userTaskRt = await db.collection('user_task')
      .where({
        task_status: 'SUCCEEDED'
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
    Taro.navigateTo({
      url: `/pages/player/index?videoId=${video._id}`
    })
  }

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

      <FixedNav
        list={debugList}
        inactiveText='DEV'
        // overlay
        position={{ top: '520px' }}
        onChange={change}
        visible={visible}
        onSelect={handleNavSelect}
      />
    </View>
  )
}

export default Home
