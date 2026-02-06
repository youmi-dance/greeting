module.exports = {
  'extends': ['taro/react'],
  'rules': {
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'quotes': [
      'error',
      'single',
      {
        'avoidEscape': true,           // 允许在字符串包含单引号时使用双引号
        'allowTemplateLiterals': true  // 允许使用反引号（模板字符串）
      }
    ],
  }
}
