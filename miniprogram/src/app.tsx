import React  from 'react'
import Taro, { useDidShow, useDidHide, useLaunch } from '@tarojs/taro'
import { View } from '@tarojs/components';
// 全局样式
import './app.scss'
import { GlobalProvider, useGlobal} from './GlobalContext';
import Index from './pages/index';
import GlobalInitializer from './GlobalInitializer';

function App(props: React.PropsWithChildren) {
  const { children } = props
  const {setState } = useGlobal();

  // 小程序初始化时触发
  useLaunch(async (options) => {
    // 初始化微信云环境
    Taro.cloud.init({
      env: 'cloud1-3gfloa3s868e6640', // 替换为你的云环境ID
      traceUser: true, // 记录用户访问
    })

    /**
     * 1. 如果是分享直接打开播放页，直接放行
     * 2. 如果是非分享访问，先查询声纹，如果没有声纹跳转到声纹采集页面
     */
    // console.log('~~~~~~~ options', options);
    if (options.path !== 'pages/player/index') {
      const db = Taro.cloud.database()
      const { data } = await db.collection('user_voice').get()
      // console.log('~~~~~~~ voiceId', data[0]);
      if (!data[0]?.voice_id) {  // 没有声纹
        // await Taro.showToast({
        //   title: '请先采集声纹',
        //   icon: 'error',
        // })
        await Taro.navigateTo({
          url: '/pages/voice-collector/index',
        })
      }
    }

    // 登录，记录用户信息
    const { code } = await Taro.login()
    try {
      const loginRt = await Taro.cloud.callFunction({
        name: 'login',
        data: {
          code,
        }
      })
      const _openid = loginRt.result?.data.openId;
      console.log('~~~~~~~ finish login', loginRt);
    } catch (err) {
      await Taro.showToast({ title: '登录失败', icon: 'error' });
      console.error('login error', err)
      throw err
    }
  });

  // 对应 onShow
  useDidShow(() => {})

  // 对应 onHide
  useDidHide(() => {})


  return (
    <View>
      <GlobalProvider>
        <GlobalInitializer />
        {children}
      </GlobalProvider>
    </View>
  );
}

export default App
