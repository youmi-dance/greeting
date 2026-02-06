// import { useState } from 'react'
import { View } from '@tarojs/components'
import { Grid, GridItem, Image } from '@nutui/nutui-react-taro'
import CustomTabBar from '../../components/CustomTabBar';
import './index.scss'

const imgSrc = 'https://m.360buyimg.com/babel/jfs/t1/36973/29/11270/120042/5cf1fe3cEac2b5898/10c2722d0cc0bfa7.png'

function Home() {
  // const [visible, setVisible] = useState(false)

  const renderList = () => {
    const list = Array(7).fill('祝福视频')
    return (
      <Grid columns={2}>
        {
          list.map((item, index) => (
            <GridItem key={index} text={item}>
              <Image src={imgSrc} width='100%' height={150} />
            </GridItem>
          ))
        }
      </Grid>
    )
  }

  return (
    <View className='home'>
      <View className='content'>
        {renderList()}
      </View>
      <View className='tab-bar'>
        <CustomTabBar />
      </View>
    </View>
  )
}

export default Home
