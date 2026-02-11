import React  from 'react'
import Taro, { useDidShow, useDidHide, useLaunch } from '@tarojs/taro'
import { View } from '@tarojs/components';
// 全局样式
import './app.scss'

function App(props: React.PropsWithChildren) {
  const { children } = props

  // 小程序初始化时触发
  useLaunch(async () => {
    // 初始化微信云环境
    Taro.cloud.init({
      env: 'cloud1-3gfloa3s868e6640', // 替换为你的云环境ID
      traceUser: true, // 记录用户访问
    })

    // 登录，记录用户信息
    const { code } = await Taro.login()
    try {
      await Taro.cloud.callFunction({
        name: 'login',
        data: {
          code,
        }
      })
    } catch (err) {
      await Taro.showToast({ title: '登录失败', icon: 'error' });
      console.error('login error', err)
    }
  });

  // 对应 onShow
  useDidShow(() => {})

  // 对应 onHide
  useDidHide(() => {})


  return (
    <View>
      {children}
    </View>
  );
}

export default App
