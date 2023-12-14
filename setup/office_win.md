---
title: "OnlyOffice组件的安装"
keywords: 在线预览, cad在线预览, 在线流程图, office在线编辑, psd在线预览
description: 可道云企业网盘支持数百种常见办公文档格式的在线预览。
---

<div id="office_win" class="tab-pane fade in active" markdown="1">

## window部署office服务器流程

### 环境要求

- 操作系统: windows 7/8/10 以上； windows server 2008/2012/2016 以上；
- 服务器内存必须4G以上；
- C盘剩余空间不少于20G；
- 当前登录用户必须是管理员；
- 由于DockerToolbox不再更新, 如果无法安装, 请更换linux操作系统

> 提示：
>
> 本节仅适用于以及购买可道云企业版授权并激活后的用户。免费用户请忽略本环节。

### 一、下载相关资源

#### 1、在桌面创建一个文件夹,重命名为`kod`【注: 必须在桌面】

#### 2、下载下列内容到kod文件夹

1. [docker安装程序 DockerToolbox](https://mirrors.aliyun.com/docker-toolbox/windows/docker-toolbox/DockerToolbox-18.03.0-ce.exe)
2. [docker资源文件夹 data.zip](http://kodcdn.kodcloud.com/docker/data.zip)

#### 3、解压data.zip 到当前文件夹(桌面的kod文件夹)

### 二、安装docker

#### 1、安装DockerToolbox程序

双击桌面kod文件夹下“DockerToolbox”程序，无需任何设置，一直点下一步直到完成。
安装成功后桌面会多出如下三个软件快捷方式。
![docker-install](/setup/images/run_office_win.png){:width="700px"}

!> **注意：**

- 不要更换安装位置,必须安装在`C:/Program Files/`
- 如果你安装了360，可能会阻止程序的安装，应该注意允许程序安装
- 在安装过程中，会出现几个其他的安装过程，全部选择安装即可

#### 2、配置VirtualBox虚拟机

##### 1、安装，初始化

双击运行`[桌面]/kod/启动或重启.cmd`。这是一键配置和运行docker的过程。

配置成功后会显示如下图内容，窗口需要手动关闭。
![导入并运行](/setup/images/run_office.png){:width="650px"}

!> **注意：**

- 需要联网下载镜像，大概需要5分钟左右,如果界面长时间卡住不动，可以输入回车键激活一下。
- 上图截图中的日志时间为UTC时间，等于国内时间+8小时。
- 如果你安装了360，可能会阻止程序的安装，应该注意允许程序安装.
- 如果上面过程出现该报错:

```cmd
Error creating machine: Error in driver during machine creation: This computer doesn't have VT-X/AMD-V enabled. Enabling it in the BIOS is mandatory
```

- 是因为电脑没有开启虚拟化技术(没有开启支持VT-X/AMD-v)，解决方法：

    重启电脑后按 F2 或 F10 进入 BIOS 界面(不同主板型号进入 BIOS 所需按键不同)。
    进入 BIOS 界面:Configuratio > Intel Virtualization Technology > Enabled。
    注:主板不一样其 BISO 中显示关键词也不一样的，主要是找到 Virtual 或 Virtualization 将其设置为
    Enabled。[详情](http://www.netinstructions.com/how-to-install-docker-on-windows-behind-a-proxy/)

##### 2. 映射绑定端口

启动桌面的 VirtualBox，default—设置—网络—网卡1(高级)—添加端口转发:主机端口 8001 到子系统端口 81

操作流程图如下:
![映射绑定端口](/setup/images/port.png){:width="700px"}

##### 3. 调整虚拟机配置

1. 同上面操作，启动桌面的 VirtualBox
2. 右键左侧default——退出——正常关机
3. default——设置——系统——内存大小：设置内存大小，建议分配4G以上
4. default——设置——系统——处理器数量：建议设置为总cpu数的一半

##### 4. 重启虚拟机

- 双击运行`[桌面]/kod/启动或重启.cmd`，配置即可生效。

### 三、配置到可道云

#### 1、安装插件

管理员登陆-界面右上角菜单-**插件中心 (全部)**-找到onlyoffice插件，点击安装

#### 2、配置插件

##### 如果office和可道云部署在同一台服务器，则无需任何配置

office和可道云不在一台服务器：点击配置插件,将上面office所在服务器ip替换到如图选中的内容(注意结尾/web/不能去除);

点击"检测office服务器"，如果检测通过这说明全部配置完成，刷新可道云页面，选中一个office文件右键打开方式，选择onlyoffice编辑即可体验。

![插件设置](/setup/images/2.3/1.png){:width="700px"}

检测结果无误如下图:
![插件设置](/setup/images/2.3/2.png){:width="600px"}

> **注意：**
>
> 1. 上面配置ip也可以是绑定了到该服务器的域名，不能为localhost；
> 2. 不知道如何获取本机ip的，可以通过WIN+R快捷键进入CMD==> 输入ipconfig ; 查看以IPV4开头的项；
> 3. 如果网络内、或服务器开启防火墙，导致访问不了，可以尝试关闭防火墙或开启8001端口。

### 四、其他问题

#### VirtulBox无法打开，提示软件不安全

请到[官网下载](https://www.virtualbox.org/wiki/Downloads)最新版本VirtulBox安装

#### 如何查看容器状态？

可以在桌面上运行Docker Quickstart Terminal,然后执行 `docker ps`查看
    ![容器状态](/setup/images/docker_ps.png){:width="650px"}

#### 如何配置https访问

- 若全站采用https访问office，需要配置nginx反向代理来实现https转http
- 具体实现: [参考这里](/others/office_https.md)

#### 如何自启动office服务，避免每次开启后需要手动启动

- `win + r` 输入 `shell:startup` 回车打开**启动**目录
- 将`[桌面]/kod/启动或重启.cmd` 发送到桌面快捷方式, 并将快捷方式拷贝到该**启动**目录

#### 优化office打开预览速度

- 优化office打开预览速度，建议分配docker 4G以上内存，设置方法：
    启动桌面的 VirtualBox ==> 右键左侧“default”-退出(关闭电源),设置-系统内存设置为 4096 MB; 选择处理器CPU ==> 处理器数量建议尽可能多。

注意：操作完成后，双击运行`[桌面]/kod/启动或重启.cmd`生效

#### docker占用空间越来越大怎么办

- 双击运行`[桌面]/kod/启动或重启.cmd`即可清理相关缓存及临时文件。

</div>
