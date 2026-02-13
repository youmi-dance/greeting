export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/voice-collector/index',
    'pages/video-creator/index',
    'pages/player/index',
    'pages/mine/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '悠米祝福',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    custom: true,
    list: [
      { pagePath: 'pages/home/index', text: '首页' },
      { pagePath: 'pages/video-creator/index', text: '创作' },
      { pagePath: 'pages/mine/index', text: '我的' }
    ],
  }
});
