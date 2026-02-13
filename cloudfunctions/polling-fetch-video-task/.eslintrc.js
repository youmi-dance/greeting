module.exports = {
  'env': {
    'node': true,
    'es2020': true,
    'commonjs': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:node/recommended'
  ],
  'parserOptions': {
    'ecmaVersion': 2020
  },
  'rules': {
    'indent': ['error', 2],           // 2 个空格
    'quotes': ['error', 'single'],    // 单引号
    'semi': ['error', 'always'],      // 强制分号（保持 Node 代码严谨）

    // --- 云函数适配优化 ---
    'no-console': 'off',              // 云函数日志全靠 console
    'node/no-unsupported-features/es-syntax': 'off', // 允许使用 async/await
    'node/no-missing-require': 'error', // 引用了 package.json 里没写的包直接报错
    'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }], // 允许 _ 开头的参数不使用（如 _context）

    // --- 提高鲁棒性 ---
    'no-return-await': 'warn',        // 避免不必要的 return await
    'prefer-const': 'error',          // 能用 const 就不允许用 let
    'curly': ['error', 'all']         // if 语句必须带大括号，防止逻辑出错
  }
};