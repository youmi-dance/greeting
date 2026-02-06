import { useState } from 'react'
import { View } from '@tarojs/components'
import { Cell, Uploader, Button, TextArea } from '@nutui/nutui-react-taro'
import CustomTabBar from '../../components/CustomTabBar';
import './index.scss'

function VideoCreator() {// const [visible, setVisible] = useState(false)
  const [isImageUploaded, setIsImageUploaded] = useState<boolean>(false)
  const [text, setText] = useState<string>('')


  const uploadUrl = 'https://my-json-server.typicode.com/linrufeng/demo/posts'
  const onStart = () => {
    console.log('start触发')
  }
  const beforeUpload = async (files: File[]) => {
    console.log('beforeUpload')
    const allowedTypes = ['image/png']
    const filteredFiles = Array.from(files).filter((file) =>
      allowedTypes.includes(file.type)
    )
    return filteredFiles
  }

  const handleTextChange = (value: string) => {
    setText(value)
  }

  return (
    <View className='video-creator'>
      <View className='content'>
        <Cell>
          <View>
            1. 选择一张人物照片
          </View>
          <View>
            <Uploader
              width={200}
              height={300}
              url={uploadUrl}
              onStart={onStart}
              beforeUpload={beforeUpload}
            />
          </View>
        </Cell>
        <Cell>
          <TextArea
            showCount
            maxLength={30}
            onChange={handleTextChange}
          />
        </Cell>
        <Button>生成视频</Button>
      </View>
      <View className='tab-bar'>
        <CustomTabBar />
      </View>
    </View>
  )
}

export default VideoCreator
