---
title: "使用Docker离线部署"
keywords: Docker, 容器, 离线
description: 在离线环境下, 如何使用Docker部署可道云网盘
---

<div id="docker" class="tab-pane fade in active" markdown="1">

## 环境需求

- 一台离线的服务器A, 需要部署可道云网盘
- 一台能联网的服务器B, 要求有docker环境，用于下载安装包和在线拉取镜像

### 离线安装 Docker

先从[Docker官网下载页面](https://download.docker.com/linux/centos/7/x86_64/stable/Packages/)下载`Docker`的软件包，这里以`CentOS7`为例
分别下载最新的:

- [containerd.io](https://download.docker.com/linux/centos/7/x86_64/stable/Packages/containerd.io-1.6.13-3.1.el7.x86_64.rpm)
- [docker-ce](https://download.docker.com/linux/centos/7/x86_64/stable/Packages/docker-ce-20.10.19-3.el7.x86_64.rpm)
- [docker-ce-cli](https://download.docker.com/linux/centos/7/x86_64/stable/Packages/docker-ce-cli-20.10.19-3.el7.x86_64.rpm)
- [docker-compose-plugin](https://download.docker.com/linux/centos/7/x86_64/stable/Packages/docker-compose-plugin-2.14.1-3.el7.x86_64.rpm)
- [docker-ce-rootless-extras](https://download.docker.com/linux/centos/7/x86_64/stable/Packages/docker-ce-rootless-extras-20.10.9-3.el7.x86_64.rpm)
- [docker-scan-plugin](https://download.docker.com/linux/centos/7/x86_64/stable/Packages/docker-scan-plugin-0.23.0-3.el7.x86_64.rpm)

把以上文件都上传到服务器A, 假设目录位于`docker`，执行安装命令

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

在一台能联网、有Docker环境的服务器B上拉取镜像，并导出tar包

```console
$ docker pull kodcloud/kodbox
$ docker pull redis:alpine
$ docker pull mariadb:10.6
$ docker save -o kodbox.tar kodcloud/kodbox
$ docker save -o redis.tar redis:alpine
$ docker save -o mariadb.tar mariadb
```

将tar包上传到离线服务器A上，然后执行导入命令

```console
$ docker load -i kodbox.tar
$ docker load -i redis.tar
$ docker load -i mariadb.tar
```

导入完成后，`docker images`看到3个镜像，`kodbox、redis 和mariadb`

### http 方式快速启动

> 注意
>
> 在离线服务器A上创建一个目录作为项目目录，后面所有命令都在这个目录下执行
{: .important}

- 创建文件.env来设置环境变量（必须修改等号右边的值，形式如 `MYSQL_USER=kodbox`，值不要包含&符号），这些在docker启动时会自动传入容器

  ```console
  $ mkdir /kodbox && cd /kodbox
  $ vim .env
  ```

 - 创建文件来设置数据库环境变量`vim db.env`

  ```bash
  MYSQL_PASSWORD=
  MYSQL_DATABASE=kodbox
  MYSQL_USER=kodbox
  ```

- 创建docker-compose.yml 文件，在其中配置映射端口、持久化目录

  ```console
  $ vim docker-compose.yml
  ```

  ```yaml
  version: '3.5'

  services:
    db:
      image: mariadb:10.6
      restart: always
      command: --transaction-isolation=READ-COMMITTED --log-bin=binlog --binlog-format=ROW
      volumes:
        - "./db:/var/lib/mysql"       #./db是数据库持久化目录，可以修改
        # - "./etc/mysql/conf.d:/etc/mysql/conf.d"       #增加自定义mysql配置
      environment:
        - MYSQL_ROOT_PASSWORD=
        - MARIADB_AUTO_UPGRADE=1
        - MARIADB_DISABLE_UPGRADE_BACKUP=1
      env_file:
        - db.env

    app:
      image: kodcloud/kodbox
      restart: always
      ports:
        - 80:80                       #左边80是使用端口，可以修改
      volumes:
        - "./site:/var/www/html"      #./site是站点目录位置，可以修改
      environment:
        - MYSQL_HOST=db
        - REDIS_HOST=redis
      env_file:
        - db.env
      depends_on:
        - db
        - redis

    redis:
      image: redis:alpine
      restart: always
  ```

进入项目目录，执行`docker compose up -d`启动命令，会自动拉取容器并运行

```console
$ docker compose up -d
Creating network "kodbox_default" with the default driver
Creating kodbox_redis_1 ... done
Creating kodbox_db_1    ... done
Creating kodbox_app_1   ... done
```

列出docker容器，可以看到3个容器正在运行

```console
$ docker ps
CONTAINER ID   IMAGE             COMMAND                  CREATED              STATUS              PORTS                          NAMES
f596f5b00305   kodcloud/kodbox   "/entrypoint.sh /usr…"   About a minute ago   Up About a minute   0.0.0.0:80->80/tcp, 9000/tcp   kodbox_app_1
5f94f6d1aabb   mariadb           "docker-entrypoint.s…"   About a minute ago   Up About a minute   3306/tcp                       kodbox_db_1
e6296b23fb0a   redis:alpine      "docker-entrypoint.s…"   About a minute ago   Up About a minute   6379/tcp                       kodbox_redis_1
```

如果需要停止服务

```console
$ docker compose down
Stopping kodbox_app_1   ... done
Stopping kodbox_db_1    ... done
Stopping kodbox_redis_1 ... done
Removing kodbox_app_1   ... done
Removing kodbox_db_1    ... done
Removing kodbox_redis_1 ... done
Removing network kodbox_default
```

由于数据库和kodbox已经挂载了持久化目录，需要时可以重新启动，不用担心数据丢失

```console
$ docker compose up -d
```

然后访问KodBox安装向导，完成系统初始化

</div>
