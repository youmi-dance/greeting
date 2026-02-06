import React, { useState } from 'react'
import { View } from '@tarojs/components'
import CustomTabBar from '../../components/CustomTabBar';
import './index.scss'

function VideoCreator() {
  return (
    <View className='nutui-react-demo'>
      <View>video creator</View>
      <CustomTabBar />
    </View>
  )
}

export default VideoCreator
