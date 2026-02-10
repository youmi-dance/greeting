// import { useState } from 'react'
import { View } from '@tarojs/components'
import CustomTabBar from '../../components/CustomTabBar';
import './index.scss'


function Mine() {// const [visible, setVisible] = useState(false)

  return (
    <View className='mine'>
      <View className='content'>
        我的
      </View>
      <CustomTabBar />
    </View>
  )
}

export default Mine
