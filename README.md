# greeting
A wechat mini program for sending greeting

## 项目开发手册

### 1. 安装开发和运行环境
- Node.js：选择LTS长期支持版本（版本号前两位为偶数的版本，如24.13.0） 
  - 地址：https://nodejs.org/zh-cn/download/current

- 安装IED
  - WebStorm（与 Java 的 intelliJ 几乎一样，并且有免费版本 for non-commercial use）
    - 地址：https://www.jetbrains.com/webstorm/
  - 或者选择 vscode
    - 地址：https://code.visualstudio.com/

- 安装 yarn （nodejs 包管理工具）,在任何目录执行下面命令
  ```shell
  npm install -g yarn
  ```

### 2. 初始化项目
- 通过 git clone 项目到本地 
- 打开 terminal 并路径切换到项目根目录，执行下面命令初始化
  ```shell
  yarn
  ```
- 等待安装完成后，执行下面命令启动开发服务。此命令会自动 watch 本地文件修改并实时编译代码提供给微信开发程序预览
  ```shell
  yarn dev
  ```

### 3. 开发过程中的项目预览
将项目根目录中的`dist`目录，导入到微信小程序开发工具，即可在微信开发工具中实时查看预览

### 4. 项目相关依赖
- 开发框架：`taro`
  - 地址：https://docs.taro.zone/docs/
- 开发语言：`react`
- UI 组件库：NutUI-React
  - 地址：https://nutui.jd.com/taro/react/2x/#/zh-CN/guide/intro-react
