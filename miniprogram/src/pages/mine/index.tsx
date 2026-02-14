// import { useState } from 'react'
import { View } from '@tarojs/components'
import CustomTabBar from '@/components/CustomTabBar';
import './index.scss'


function Mine() {// const [visible, setVisible] = useState(false)

  return (
    <View className='mine'>
      <View className='content poem-container'>
      <view>
        Voicepilled 时刻
      </view>
      <view>
      在《黑客帝国》里面服下“红丸”或“蓝丸”后，会突然感到思想清晰，出现以一种不同的方式看待世界的那一刻。
      </view>
      <view>
      "Voicepilled"，是指当你开始认真使用语音与技术互动时，你顿悟到这开启了一种放大你能力的新方式。
      </view>
      <view>
      英国诗人艾丽丝·奥斯瓦尔德（Alice Oswald）在诗集《达特河》里用三年的时间记录那些在德文郡达特河畔生活和工作的人们的对话，包括偷猎者、摆渡人、污水处理工、牛奶厂工人、林务员、游泳者和皮划艇运动员——并与历史及神话之声交织在一起：那些溺水者的声音、梦境中的声音，创造了关于这条河流的叙事，追踪它从源头到大海的生命轨迹。
      </view>
      <view>
      我们相信声音与AI，我们会在人文与科技的十字路口更好的相遇。
      </view>
      <view>Enjoy~</view>
      <view>2026.2.14 情人节~</view>
      </View>
      <CustomTabBar />
    </View>
  )
}

export default Mine
