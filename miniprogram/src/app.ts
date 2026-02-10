import { PropsWithChildren } from 'react'
import Taro, { Config } from '@tarojs/taro'


import './index.scss'

class App extends Component<PropsWithChildren> {

  componentDidMount () {
    if (process.env.TARO_ENV === 'weapp') {
      Taro.cloud.init()
    }
  }

  componentDidShow () {}

  componentDidHide () {}

  // this.props.children 是将要会渲染的页面
  render () {
    return this.props.children
  }
}

export default App
