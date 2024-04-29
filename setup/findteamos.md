---
title: "3 发现teamOS"
keywords: 发现 teamOS
description: 安装teamOS 后, 系统会自动以dhcp形式获取IP, 此时利用可道云客户端可以搜索到teamOS服务器地址。
---

<div id="setup" class="tab-pane fade in active" markdown="1">

## 1 使用要求

- 系统镜像版本 teamOS-22.03.e13.iso或以上
- PC客户端版本 0.5.4或以上,[下载地址](https://kodcloud.com/download/)
- 手机APP端最新版本,[下载地址](https://kodcloud.com/download/)

## 2 发现步骤

### 2.1 PC端发现

> 提示：
>
> - 当teamOS安装完成后, 可以利用客户端的发现功能找到站点。

1. 在PC端图标右键可以找到**切换/发现站点**,或者打开PC端,在首页点击**发现站点**
![pc_login](/setup/images/pc_login.png){:width="400px"}

2. PC端在局域网内扫描到设备后会显示相关信息,如果还未初始化,可以直接点击**配置设备**进入系统的初始化界面
![pcinit](/setup/images/pcinit.png){:width="600px"}

3. 初始化后可直接登录,后面再次扫描时也能直接连接设备登录。
![pcinit1](/setup/images/pcinit1.png){:width="600px"}

### 2.2 手机端发现

1. 同样打开手机端,点击**发现站点**（或者切换站点后进入）
![appfind](/setup/images/appfind.png){:width="300px"}

2. 也能发现局域网内的teamOS服务器地址并一键连接,输入账号密码即可登录。
![applogin](/setup/images/applogin.png){:width="300px"}

### 2.3 服务器本机获取IP

当teamOS系统安装完成后, 连接显示器时正常看到的页面如下图, 其中有显示IP地址,可以在网页访问使用
![installed](/setup/images/installed.png){:width="600px"}

> **注意：**
> - 若找不到IP, 请检查网线是否连接正常, 网口灯是否闪烁。
> - 可连接显示器在本机登录root账户 (若修改过网盘admin密码, 则会同时修改root的密码)：
>   - 查询IP`ip a`
>   - 重置网络, `menu 1` 重置dhcp, `menu 2`设置静态IP.
{: .warning}

</div>
