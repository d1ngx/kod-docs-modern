---
title: "OnlyOffice组件的安装示例"
keywords: 在线预览, cad在线预览, 在线流程图, office在线编辑, psd在线预览
description: 可道云企业网盘支持数百种常见办公文档格式的在线预览。
---

<div id="setup" class="tab-pane fade in active" markdown="1">

## 环境要求

- 激活可道云授权：企业版及以上；[更多了解](https://kodcloud.com/price/)
- 操作系统: CentOS 7+、Ubtntu 14+、Debian 8+、RedHat 7+
- 服务器内存4G以上
- 剩余磁盘空间不少于10G
- 当前登录用户必须是管理员

> 重要：
>
> 本节仅适用于以及购买可道云企业版授权并激活后的用户。免费用户请忽略本环节。
{: .important}

## 1.安装docker

安装并启动docker服务

```console
$ curl -sSL https://get.daocloud.io/docker | sh
$ systemctl enable docker && systemctl start docker
```

## 2.在线部署方式

### 1.快速启动

```console
$ docker run -itd -p 8001:80 --name kodoffice --restart always \
registry.cn-hangzhou.aliyuncs.com/kodcloud/kodoffice:mini
```

- onlyoffice缓存目录是`/var/lib/onlyoffice`,如果编辑文件特别多，可以考虑挂载。
- 验证启动成功，在浏览器访问 `http://[域名(IP)]:8001/web/` 会看到`success,运行正常`.

### 2.以https方式启动

使用已有ssl证书

- `/data/certs/onlyoffice.key`
- `/data/certs/onlyoffice.pem`
- 确认`/data/certs`目录有证书存在（证书名称必须为`onlyoffice.key`、`onlyoffice.pem`），在执行下方命令启动

```console
$ docker run -itd -p 8001:443 --name kodoffice --restart always \
-v /data/certs:/etc/onlyoffice/documentserver/certs  \
registry.cn-hangzhou.aliyuncs.com/kodcloud/kodoffice:mini
```

- 验证启动成功，在浏览器访问`https://[域名]:8001/web/`会看到`success,运行正常`.

#### 更新证书

1. 替换证书文件`/data/certs/onlyoffice.key`、`/data/certs/onlyoffice.pem`, 注意证书名称不能改变。
2. 重启容器服务`docker restart kodoffice`

### 3.注意事项

- 快速启动是http的方式，如果可道云站点使用了https，请选择https的方式部署，否则无法使用
- 8001端口是可以改的，修改后记得填写解析地址到onlyoffice插件配置里面

## 3.离线部署方式

> 说明
>
> 离线部署请联系可道云技术售后。
{: .important}

## 4.配置到可道云

### 1.安装插件

管理员登陆-进入**插件中心 (全部)**-找到onlyoffice插件，点击安装

### 2.配置插件

点击配置插件,将上面office所在服务器ip替换到如图选中的内容(注意结尾/web/不能去除);

**如果office和可道云部署在同一台服务器，则无需任何配置 。**

点击"检测office服务器"，如果检测通过这说明全部配置完成，刷新可道云页面，选中一个office文件右键打开方式，选择onlyoffice编辑即可体验。
![插件设置](/setup/images/2.3/1.png){:width="800px"}

检测结果无误如下图:
![插件设置](/setup/images/2.3/2.png){:width="600px"}

> **注意：**
>
> 1. 上面配置ip也可以是绑定了到该服务器的域名，不能为localhost
> 2. 不知道如何获取本机ip的，可以通过`ifconfig` 指令查看
> 3. 如果网络内、或服务器开启防火墙，导致访问不了，可以尝试关闭防火墙或开启8001端口
{: .warning}

## 5.其他问题

### 如何配置https访问

- 如果部署是以https方式启动，直接访问即可
- 如果部署是以http方式启动的，需要配置nginx反向代理来实现https转http，具体实现: [参考这里](http://doc.kodcloud.com/vip/#/others/office_https)

### 重启系统后如何自启动

- 安装默认已经加入自启动了
