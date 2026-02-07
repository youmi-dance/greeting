import { View, ScrollView } from '@tarojs/components'
import { Grid, GridItem, Image } from '@nutui/nutui-react-taro'
import CustomTabBar from '../../components/CustomTabBar';
import './index.scss'

// 这里的图片建议替换成你真实的竖屏视频封面
const imgSrc = 'https://m.360buyimg.com/babel/jfs/t1/36973/29/11270/120042/5cf1fe3cEac2b5898/10c2722d0cc0bfa7.png'

function Home() {
  const renderList = () => {
    const list = Array(17).fill(imgSrc)
    return (
      <Grid columns={2} gap={10} className='video-grid'>
        {
          list.map((src, index) => (
            <GridItem key={index} className='video-card'>
              <Image
                src={src}
                mode='aspectFill' // 确保图片铺满容器不变形
                width='100%'
                height='180' // 竖屏比例的关键：高度增加
                radius={12}
              />
            </GridItem>
          ))
        }
      </Grid>
    )
  }

  return (
    <View className='home-page'>

      <View className='content'>
        <ScrollView className='scroll-container' scrollY enhanced showScrollbar={false}>
          <View className='title'>
            <View className='main-title'>我的祝福</View>
            <View className='sub-title'>记录每一个温暖瞬间</View>
          </View>

          {renderList()}
        </ScrollView>
      </View>

      <CustomTabBar />
      <View className='header-bg' />
    </View>
  )
}

export default Home
