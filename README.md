# diskMirror-front
DiskMirror 的浏览器客户端，其能够接入到任何盘镜服务器中，使用空间登录的方式访问，能够帮助您可视化的操作盘镜！

## 快速开始

### 部署您的盘镜后端

后端的部署操作是很简单的，您可以直接将 [后端服务器](https://github.com/BeardedManZhao/diskMirror-backEnd-spring-boot.git) 部署在您的服务器中，然后直接启动！

### 下载并编辑配置文件

在 前端项目的 `web/js/conf` 中，会有一个 `indexConfig.js` 文件，您可以在其中填写盘镜服务器的信息。

```
const indexConfig = {
    // 服务器地址
    server: "http://xxx",
    // 空间类型 这里不需要改动！
    spaceType: "Binary",
    // 盘镜 服务器所处的域
    domain: "xxx.com",
}
```

### 访问您的前端项目
访问您的前端项目，即可开始使用，下面是一个访问示例
