// import { useState } from 'react'
import { View } from '@tarojs/components'
import CustomTabBar from '../../components/CustomTabBar';
import './index.scss'

function VideoCreator() {// const [visible, setVisible] = useState(false)

  return (
    <View className='video-creator'>
      <View className='content'>
        create
      </View>
      <View className='tab-bar'>
        <CustomTabBar />
      </View>
    </View>
  )
}

export default VideoCreator
