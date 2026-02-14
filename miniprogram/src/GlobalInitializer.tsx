import { useGlobal } from './GlobalContext';
import { useEffect } from 'react';
import Taro from '@tarojs/taro'

export default function GlobalInitializer() {
  const { setState } = useGlobal();

  useEffect(() => {
    // 在这里安全地设置全局状态
    const init = async () => {
      try {
        const { code } = await Taro.login()
        const loginRt = await Taro.cloud.callFunction({
          name: 'login',
          data: {
            code,
          }
        })
        const _openid = loginRt.result?.data.openId;
        console.log('~~~~~~~ finish login', loginRt);
        setState({
          userInfo: { _openid: _openid }
        });
      } catch (err) {
        await Taro.showToast({ title: '登录失败', icon: 'error' });
        console.error('login error', err)
        throw err
      }
    };
    init();
  }, []);

  return null; // 不渲染任何 UI
}