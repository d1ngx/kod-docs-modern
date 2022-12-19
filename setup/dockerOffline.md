---
title: "使用Docker离线部署"
keywords: Docker, 容器, 离线
description: 在离线环境下, 如何使用Docker部署可道云网盘
---

<div id="docker" class="tab-pane fade in active" markdown="1">

## 环境需求

- 一台离线的服务器, 需要部署可道云网盘
- 一台能联网的服务器, 要求有docker环境, 用于下载安装包和在线拉取镜像

### 离线安装Docker

先从[Docker官网下载页面](https://download.docker.com/linux/centos/7/x86_64/stable/Packages/)下载`Docker`的软件包, 这里以`CentOS7`为例
分别下载最新的:

- [containerd.io](https://download.docker.com/linux/centos/7/x86_64/stable/Packages/containerd.io-1.6.13-3.1.el7.x86_64.rpm)
- [docker-ce](https://download.docker.com/linux/centos/7/x86_64/stable/Packages/docker-ce-20.10.19-3.el7.x86_64.rpm)
- [docker-ce-cli](https://download.docker.com/linux/centos/7/x86_64/stable/Packages/docker-ce-cli-20.10.19-3.el7.x86_64.rpm)
- [docker-compose-plugin](https://download.docker.com/linux/centos/7/x86_64/stable/Packages/docker-compose-plugin-2.14.1-3.el7.x86_64.rpm)
- [docker-ce-rootless-extras](https://download.docker.com/linux/centos/7/x86_64/stable/Packages/docker-ce-rootless-extras-20.10.9-3.el7.x86_64.rpm)
- [docker-scan-plugin](https://download.docker.com/linux/centos/7/x86_64/stable/Packages/docker-scan-plugin-0.23.0-3.el7.x86_64.rpm)

把以上文件都上传到服务器, 假设目录位于`docker`, 执行安装命令

```bash
[root@kod ~]# rpm -ivh docker/*.rpm
准备中...                          ################################# [100%]
正在升级/安装...
   1:docker-scan-plugin-0:0.23.0-3.el7################################# [ 17%]
   2:docker-ce-cli-1:20.10.19-3.el7   ################################# [ 33%]
   3:containerd.io-1.6.13-3.1.el7     ################################# [ 50%]
   4:docker-ce-rootless-extras-0:20.10################################# [ 67%]
   5:docker-ce-3:20.10.19-3.el7       ################################# [ 83%]
   6:docker-compose-plugin-0:2.14.1-3.################################# [100%]
[root@kod ~]# docker -v
Docker version 20.10.19, build d85ef84
```

### 导入镜像

在一台能联网、有Docker环境的服务器上拉取镜像, 并导出tar包

```console
$ docker pull kodcloud/kodbox
$ docker pull redis:alpine3.17
$ docker pull mariadb:10.9
$ docker save -o kodbox.tar kodcloud/kodbox
$ docker save -o redis.tar redis:alpine3.17
$ docker save -o mariadb.tar mariadb:10.9
```

将tar包上传到离线服务器上, 然后执行导入命令

```console
$ docker load -i kodbox.tar
$ docker load -i redis.tar
$ docker load -i mariadb.tar
```

导入完成后, `docker images`看到3个镜像，kodbox、redis 和mariadb



部署可道云kodbox
1.下载 http://box.kodcloud.ltd:10081/static/docker/docker-compose.yml 

docker-compose.yml这个是核心配置文件，在其中定义启动的容器服务和挂载的存储

/var/lib/mysql :服务器目录，用于数据库存储目录
/data/kodbox: 服务器目录，用于映射可道云站点目录（包含默认存储）
"MYSQL_ROOT_PASSWORD=root密码"
      - "MYSQL_DATABASE=数据库"
      - "MYSQL_USER=数据库用户"
      - "MYSQL_PASSWORD=数据库密码"

ports:
      - 服务器端口:80

修改端口: 改服务器端口即可
配置全部内容如下：
version: "3.5"

services:
  db:
    image: mariadb:10.6
    command: --transaction-isolation=READ-COMMITTED --binlog-format=ROW
    volumes:
      - "/var/lib/mysql:/var/lib/mysql"
    environment:
      - "TZ=Asia/Shanghai"
      - "MYSQL_ROOT_PASSWORD=root密码"
      - "MYSQL_DATABASE=数据库"
      - "MYSQL_USER=数据库用户"
      - "MYSQL_PASSWORD=数据库密码"
    restart: always

  app:
    image: kodcloud/kodbox:v1.23
    ports:
      - 80:80
    links:
      - db
      - redis
    volumes:
      - "/data/kodbox:/var/www/html"
    restart: always

  redis:
    image: redis:alpine3.14
    environment:
      - "TZ=Asia/Shanghai"
    restart: always
2.执行启动命令，在docker-compose.yml 文件所在目录。执行
docker-compose up -d 

3.docker ps  检查kodbox/mariadb/redis 都是运行状态 Up
4.运行onlyoffice在线编辑预览解析服务（服务器端口8001，可以改）
docker run -itd -p 8001:80 –name kodoffice –restart always kodoffice

5.此时，所有相关服务都已启动，在网页访问服务器IP即可配置可道云初始化。
检测环境跳过，数据库配置页面 类似下图，填写在docker-compo.yml中配置的参数。
选择MySQL+Redis
填写MySQL 服务器：db
			用户名：数据库用户
			密码：数据库密码
			数据库：数据库
填写redis 服务器：redis
			端口号：6379

然后点击确定，会让你设置管理员密码，设置后登陆即可。
6.上传企业版插件(http://box.kodcloud.ltd:10081/static/docker/plugins.tar.gz )到可道云.plugins目录解压；

7.离线激活

8.配置onlyoffice插件,IP是你的服务器地址,8001是运行时指定的端口。
填写解析地址：http://IP:8001/web/

