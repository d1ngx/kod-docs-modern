---
title: "WebDAV插件的连接与使用"
keywords: 插件安装, WebDAV
description: 关于WebDAV插件安装、配置的相关说明
---

<div id="WebDAV" class="tab-pane fade in active" markdown="1">

### 概述

网盘文档可以通过`WebDAV`网络映射的方式挂载在到本地电脑或APP, 使得文件管理和本地硬盘一样方便快捷。

### 使用说明

#### 启用插件

依次进入`插件中心 -WebDAV -配置插件 -开启WebDAV服务`

![plugin-webdav](../images/plugin-webdav.png){:width="650px"}

#### 获取 WebDAV 连接地址

进入`账号中心 -WebDAV挂载`，可以看到`个人空间`、`all`(全部)等位置的WebDAV路径。

![dav](../images/dav.png)

> 提示：
>
> - 在使用PC客户端登录时，会在本地以站点标题自动进行`WebDAV`挂载。
> - `WebDAV`协议无法获取准确的空间大小，因此显示的大小可以忽略，实际以网盘空间为准。

![dav-win1](../images/dav-win1.png){:width="500px"}

### 其他连接方式

#### 本地手动连接

1. 在本地电脑，右键选择 **添加一个网络位置**

![dav-net](../images/dav-net.png){:width="300px"}

2. 点 **下一步**，到 **指定网站的位置**，填写从 **账号中心** 获取的WebDAV地址，例如`https://box.kodcloud.com/index.php/dav/`，然后输入 **网盘用户名和密码** 登录

![dav-location](../images/dav-location.png){:width="500px"}

3. 设置网络位置的名称

![dav-name](../images/dav-name.png){:width="500px"}

4. 保存后即连接成功，可在本地目录中查看

![dav-win](../images/dav-win.png){:width="500px"}

> 提示：
>
> - 若连接失败，请在**账号中心**-**WebDAV挂载** -**如何使用**中下载脚本，以管理员身份执行后再试。

#### 使用 Raidrive 连接

Raidrive 可以使WebDAV连接更加稳定

1. 下载Raidrive 并完成安装 [Raidrive](https://www.raidrive.com/)
2. 点击`+`号依次进入 `NAS`- `WebDAV`，填写从 **账号中心** 获取的WebDAV地址，注意域名`box.kodcloud.com` 和路径 `/index.php/dav/` 需要分开填写，然后输入 **网盘用户名和密码**，点击连接即可。

![raidrive](../images/raidrive.png){:width="600px"}
3. 然后可以在本地查看映射的webdav目录

![raidrive2](../images/raidrive2.png){:width="600px"}

> 提示：
>
> - 如果使用的是http端口，地址后的防盾标识请取消勾选。

![raidrive3](../images/raidrive3.png){:width="500px"}

</div>
