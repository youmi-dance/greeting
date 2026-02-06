import React, { useEffect } from 'react'
import Taro, { useDidShow, useDidHide } from '@tarojs/taro'
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

  return children
}

export default App
