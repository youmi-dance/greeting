export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/videoCreator/index',
    'pages/index/index',
    'pages/login/index',
    'pages/voiceprint/index',
    'pages/player/index',
    'pages/mine/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    custom: true,
    list: [
      { pagePath: 'pages/home/index', text: '首页' },
      { pagePath: 'pages/videoCreator/index', text: '创作' },
      { pagePath: 'pages/mine/index', text: '我的' }
    ],
  }
});
