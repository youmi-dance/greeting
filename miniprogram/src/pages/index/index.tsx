import { Component, PropsWithChildren } from 'react'
import Taro, { Config } from '@tarojs/taro'

import { View, Text } from '@tarojs/components'

import './index.scss'

import Login from '../../components/login/index'

export default class Index extends Component<PropsWithChildren> {
  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  render () {
    return (
      <View className='index'>
        <Login/>
      </View>
    )
  }
}
