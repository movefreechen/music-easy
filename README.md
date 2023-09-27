![logo](https://github.com/movefreechen/music-easy/raw/main/packages/extension/logo.png)

# 表格风 vscode Netease 音乐播放插件

[![Visual Studio Marketplace](https://img.shields.io/badge/Visual%20Studio-Marketplace-007acc.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=movefreechen.music-easy)
[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/movefreechen.music-easy.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=movefreechen.music-easy)

### 感谢 [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) 提供的音乐 api

### 本项目网页部分使用 vue3 + vuetify + APlayer 开发

### 请使用 pnpm 进行依赖安装

### 根目录执行 pnpm run build 即可打包，打包好的插件在 packages/extension/dist 下面

## 使用

在命令面板中输入: Music Easy，支持 http/https 代理，支持有帐号密码的代理

## 配置项

1.music.easy.proxy: 代理地址，例如 http://username:password@127.0.0.1:8888  
2.music.easy.port: api 服务启动端口，默认 4000

## 已有功能

1.每日推荐歌单  
2.每日推荐歌曲  
3.搜索歌单/歌曲  
4.我喜欢的歌曲  
5.我收藏/创建的歌单  
6.登录  
7.登出  
8.私人 FM(当播放列表为空的时候，点击左下角播放按钮就能开启)  
9.收藏歌曲/歌单

## 准备做的功能

1.查看歌曲评论
