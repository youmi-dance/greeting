import { useState, useEffect } from 'react'
import { Tabbar, TabbarItem } from '@nutui/nutui-react-taro'
import Taro, { useRouter } from '@tarojs/taro'
import { AddRectangle, Home as HomeIcon, User } from '@nutui/icons-react-taro';
import './index.scss'

/**
 * 页面路径与索引的映射表
 * 此处配置还对应 src/app.config.js 文件中的 tabBar
 */
const tabList = [
  { title: '首页', path: '/pages/home/index', IconCmp: HomeIcon, unreadNum: 8 },
  { title: '创作', path: '/pages/videoCreator/index', IconCmp: AddRectangle },
  { title: '我的', path: '/pages/mine/index', IconCmp: User }
]

const CustomTabBar = () => {
  const [activeTab, setActiveTab] = useState(0)
  const router = useRouter()

  // 核心：每次进入页面，根据当前路径自动校准选中的 Tab
  useEffect(() => {
    const currentTabIndex = tabList.findIndex(
      item => item.path === router.path
    )
    if (currentTabIndex !== -1) {
      setActiveTab(currentTabIndex)
    }
  }, [router.path])

  const handleSwitch = async (value: number) => {
    const targetPath = tabList[value].path
    // 使用 switchTab 跳转（如果是原生 tabBar 页面）
    // 或者用 redirectTo（如果你是纯自定义路由）
    const rs = await Taro.switchTab({ url: targetPath })
    console.info('switchTab to ', targetPath, rs);
  }

  return (
    <Tabbar
      className='cmp_tab-bar'
      value={activeTab}
      onSwitch={handleSwitch}
      safeArea
    >
      {tabList.map(({path, IconCmp, title, unreadNum}) => (
        <TabbarItem
          key={path}
          title={title}
          value={unreadNum}
          icon={
            <IconCmp size={18} />
            }
        />
        ))}
    </Tabbar>
  )
}

export default CustomTabBar
