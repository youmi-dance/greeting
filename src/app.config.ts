export default defineAppConfig({
  pages: [
    'pages/voiceCollector/index',
    'pages/player/index',
    'pages/home/index',
    'pages/videoCreator/index',
    'pages/mine/index',
    // 'pages/login/index',
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
      { pagePath: 'pages/videoCreator/index', text: '创作' },
      { pagePath: 'pages/mine/index', text: '我的' }
    ],
  }
});
