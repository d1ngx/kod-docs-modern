---
title: "使用Docker安装示例"
description: 在群晖 Docker 中分别创建 redis、mariadb、kodbox 容器（图形界面方式）
keywords: 群晖, Docker
---

<div id="dsm_docker" class="tab-pane fade in active" markdown="1">

### 1 安装 Docker

![图片介绍](/setup/images/4.1.1-1.png){:width="800px"}

### 2 拉取 kodbox 镜像

打开Docker-注册表，搜索kodbox, 选择`kodcloud/kodbox` 最新版本

![图片介绍](/setup/images/4.1.2-1.png){:width="800px"}

### 3 拉取数据库镜像

以同样方式搜索mariadb、redis, 分别下载`mariadb:10.5.5`、`redis:alpine3.12`，然后查看Docker-映像，等待下载完成。

![图片介绍](/setup/images/4.1.3-1.png){:width="800px"}

### 4 运行容器

#### 运行 redis

进入Docker-映像，双击redis, 在高级设置中勾选启用自动重新启动;然后应用保存，继续下一步-应用-完成运行’

![图片介绍](/setup/images/4.1.4-1.png){:width="800px"}

#### 运行 mariadb

进入Docker-映像，双击mariadb

- 在高级设置中勾选启用自动重新启动
- 在‘卷’中添加文件夹-选择一个用来存储数据库的位置 (这里是先创建了docker/db目录，是空目录) , 装载路径填写`/var/lib/mysql`，这个是固定的

![图片介绍](/setup/images/4.1.4-2.png){:width="800px"}

在高级设置-环境中，添加4个环境变量 (`MYSQL_DATABASE` 数据库、`MYSQL_USER` 用户名、`MYSQL_PASSWORD` 密码、`MYSQL_ROOT_PASSWORD`) , 值可以自定义，这里举例全部设为kod_box, 建议修改;然后应用-下一步-再应用立即启动。

![图片介绍](/setup/images/4.1.4-3.png){:width="800px"}

#### 运行 kodbox

进入Docker-映像，双击kodbox

- 在高级设置中勾选启用自动重新启动
- 在‘卷’中添加文件夹-选择一个用来存放kodbox站点的位置 (这里是先创建了docker/kodbox目录，是空目录) ; 装载路径填写`/var/www/html`，这个是固定的；

![图片介绍](/setup/images/4.1.4-4.png){:width="800px"}

- 如果已有数据目录 (非空目录，这里举例 `web/data`) , 想放到kodbox里面管理，也需要在此时配置，建议装载路径填`/mnt`; (数据卷是Docker和群晖主机共用的目录，可以有多个)

![图片介绍](/setup/images/4.1.4-5.png){:width="800px"}

- 在`端口设置`中添加映射端口，本地端口 (群晖) 这里举例用88, 容器端口是80固定的; (有个9000可以点’-’删掉)

![图片介绍](/setup/images/4.1.4-6.png){:width="800px"}

- 在`链接`中分别添加刚才启动的2个容器`mariadb1`、`redis1`，起别名 (这里可以修改，作为连接服务器的地址) `db`和`redis`; 然后应用保存，继续下一步-应用-完成运行’

![图片介绍](/setup/images/link_db.png){:width="800px"}

- 在Docker-容器中查看，刚启动的三个容器都在运行中

![图片介绍](/setup/images/4.1.4-7.png){:width="800px"}

### 5 可道云初始化

打开网页，输入群晖地址后面加88端口，开始配置kodbox

- 环境检测正常，直接点下一步；

![图片介绍](/setup/images/4.1.5-1.png){:width="800px"}

- 数据库配置，服务器栏填写运行容器时起的别名，用户名密码等填前面设置的环境变量;然后确定进入下一步,

![图片介绍](/setup/images/4.1.5-2.png){:width="800px"}

- 设置好管理员的账号和密码，完成部署

![图片介绍](/setup/images/4.1.5-3.png){:width="800px"}

</div>
