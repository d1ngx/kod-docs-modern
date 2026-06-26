---
title: "4.2 iKuai上使用Docker部署kodbox私有企业网盘"
keywords: docker部署, 企业网盘本地部署, 部署教程
description: iKuai上使用Docker部署kodbox私有企业网盘教程，附带图文
---

<div id="setup" class="tab-pane fade in active" markdown="1">

### 1 部署准备

- 安装Docker

 ![安装docker效果图](/setup/images/4.2.1-1.png){:width="800px"}
- 打开Docker-服务设置，设置镜像库URL`https://hub.docker.com/`

 ![设置docker效果图](/setup/images/4.2.1-2.png){:width="800px"}

### 2 正式部署

- 打开Docker-镜像管理-添加，搜索kodbox，选择kodcloud/kodbox最新版本下载。以同样方式搜索mariadb、redis，分别下载（相近版本即可）mariadb:10.6.0、redis:alpine3.13，然后查看docker-镜像管理，确认3个镜像都下载完成。

![镜像1效果图](/setup/images/4.2.2-1.png){:width="800px"}

![镜像2效果图](/setup/images/4.2.2-2.png){:width="800px"}

![镜像3效果图](/setup/images/4.2.2-3.png){:width="800px"}
- 运行容器之前先在Docker-添加网络接口,地址和网关自定义设置。

![自定义设置效果图](/setup/images/4.2.2-4.png){:width="800px"}
- 下面开始运行容器，在Docker-容器列表-分别添加

### 3 运行 redis

自定义容器名、内存，镜像文件选择刚才下载的redis，网络接口选择刚才设置的，勾选开机自启；然后保存

![设置redis效果图](/setup/images/4.2.2-5.png){:width="800px"}

### 4 运行 mariadb

自定义容器名、内存，镜像文件选择刚才下载的mariadb,勾选开机自启

- 在高级设置中添加挂载目录，源路径是本地磁盘位置（提前创建一个空目录），目录路径固定，填写/var/lib/mysql；
- 在高级设置-环境中，添加4个环境变量（MYSQL_DATABASE数据库、MYSQL_USER 用户名、MYSQL_PASSWORD密码、MYSQL_ROOT_PASSWORD），值可以自定义，这里举例全部设为kod_box，建议修改；然后`保存‘。

![设置mariadb效果图](/setup/images/4.2.2-6.png){:width="800px"}

### 5 运行 kodbox

自定义容器名、内存，镜像文件选择刚才下载的kodbox,勾选开机自启

- 在高级设置中勾选启用自动重新启动；
- 在高级设置中添加挂载目录，源路径是本地磁盘位置（提前创建一个空目录），目录路径固定，填写/var/www/html

![设置kodbox效果图](/setup/images/4.2.2-7.png){:width="800px"}

- 然后查看Docker-容器列表，有三个正在运行的容器，记住它们的IP

![ip效果图](/setup/images/4.2.2-8.png){:width="800px"}

- 打开网络设置-端口映射-端口映射，配置内网地址kodbox容器IP，端口为80，外网地址为iKuai IP地址，外网端口自定义，这里设为8080，然后保存。

![端口效果图](/setup/images/4.2.2-9.png){:width="800px"}

- 打开网页，输入iKuai IP地址后面加8080端口，开始配置kodbox
- 环境检测正常，直接点下一步；

![环境检测效果图](/setup/images/4.2.2-10.png){:width="800px"}

- 数据库配置，服务器栏分别填写mariadb和redis容器IP，用户名密码等填前面设置的环境变量；然后确定进入下一步，设置你的管理员的账号和密码，完成部署；

![mariadb配置效果图](/setup/images/4.2.2-11.png){:width="800px"}

![注册账号效果图](/setup/images/4.2.2-12.png){:width="800px"}

</div>
