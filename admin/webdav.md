---
title: "WebDAV插件的连接与使用"
keywords: 插件安装, WebDAV
description: WebDAV 插件的安装与配置说明，将网盘映射为本地磁盘使用
---

<div id="WebDAV" class="tab-pane fade in active" markdown="1">

### 概述

WebDAV 是一种网络文件访问协议。启用后，可将网盘映射到本地电脑或手机 App，像操作本地文件夹一样管理网盘文件。

### 使用说明

#### 启用插件

依次进入 **插件中心 → WebDAV → 配置插件 → 开启 WebDAV 服务**

![plugin-webdav](../images/plugin-webdav.png){:width="650px"}

#### 获取 WebDAV 连接地址

进入 **账号中心 → WebDAV 挂载**，可查看「个人空间」、「all」（全部文件）等位置的 WebDAV 地址。

![dav](../images/dav.png)

> 提示：
>
> - 使用 PC 客户端登录时，系统会自动在本地挂载 WebDAV，挂载名称与站点标题一致。
> - WebDAV 协议无法准确显示空间大小，显示数值可忽略，以网盘实际配额为准。

![dav-win1](../images/dav-win1.png){:width="500px"}

### 其他连接方式

#### 本地手动连接（Windows）

1. 在本地电脑，右键选择 **添加一个网络位置**

![dav-net](../images/dav-net.png){:width="300px"}

2. 点击 **下一步**，到 **指定网站的位置**，填写从 **账号中心** 获取的 WebDAV 地址，例如 `https://box.kodcloud.com/index.php/dav/`，然后输入 **网盘用户名和密码** 登录

![dav-location](../images/dav-location.png){:width="500px"}

3. 设置网络位置的名称

![dav-name](../images/dav-name.png){:width="500px"}

4. 保存后即连接成功，可在「此电脑」中查看映射的网络位置

![dav-win](../images/dav-win.png){:width="500px"}

> 提示：
>
> - 若连接失败，请在 **账号中心 → WebDAV 挂载 → 如何使用** 中下载修复脚本，以管理员身份运行后再试。

#### 使用 Raidrive 连接

RaiDrive 是第三方工具，WebDAV 连接通常比系统自带方式更稳定。

1. 下载并安装 [RaiDrive](https://www.raidrive.com/)
2. 点击 `+` 号，依次选择 `NAS` → `WebDAV`，填写从 **账号中心** 获取的 WebDAV 地址。注意将域名（如 `box.kodcloud.com`）和路径（如 `/index.php/dav/`）分开填写，然后输入 **网盘用户名和密码**，点击连接

![raidrive](../images/raidrive.png){:width="600px"}
3. 连接成功后，可在本地文件管理器中查看映射的 WebDAV 目录

![raidrive2](../images/raidrive2.png){:width="600px"}

> 提示：
>
> - 若使用 HTTP（非 HTTPS）端口，请取消地址后的防盾（SSL）标识勾选。

![raidrive3](../images/raidrive3.png){:width="500px"}

</div>
