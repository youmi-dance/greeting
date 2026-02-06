// import { useState } from 'react'
import { View } from '@tarojs/components'
import { Tabbar } from '@nutui/nutui-react-taro'
import { Home as HomeIcon, AddRectangle, User } from '@nutui/icons-react-taro'
import CustomTabBar from '../../components/CustomTabBar';
import './index.scss'

function Home() {
  // const [visible, setVisible] = useState(false)

  return (
    <View className='home'>
      <View className='home_content'>
      </View>
      <View className='home_tabbar'>
        <CustomTabBar />
      </View>
    </View>
  )
}

export default Home
