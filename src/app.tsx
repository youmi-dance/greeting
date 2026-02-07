import React, { useEffect } from 'react'
import Taro, { useDidShow, useDidHide } from '@tarojs/taro'
import { View } from '@tarojs/components';
// 全局样式
import './app.scss'

function App(props: React.PropsWithChildren) {
  const { children } = props
  // 可以使用所有的 React Hooks
  useEffect(() => {
    (async () => {
      const { code } = await Taro.login()
      console.log('~~~~~~~ code', code);
    })()
  }, []);

  // 对应 onShow
  useDidShow(() => {})

  // 对应 onHide
  useDidHide(() => {})

  // 初始化微信云环境
  Taro.cloud.init({
    env: 'cloud1-3gfloa3s868e6640', // 替换为你的云环境ID
    traceUser: true, // 记录用户访问
  })

  return (
    <View>
      {children}
    </View>
  );
}

export default App
