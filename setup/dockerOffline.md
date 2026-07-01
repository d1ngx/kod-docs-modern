---
title: "使用Docker离线部署"
keywords: Docker, 容器, 离线
description: 无公网环境下导入 Docker 镜像并部署 kodbox
---

<div id="docker" class="tab-pane fade in active" markdown="1">

## 环境需求

离线部署指目标服务器无法访问公网，需要先在能联网的机器上准备好安装包和镜像，再拷贝到离线环境安装。

- **服务器 A**（离线）：需要部署可道云的目标机器
- **服务器 B**（联网）：已安装 Docker，用于下载安装包和拉取镜像

### 离线安装 Docker

Docker 是容器运行平台。请先从 [Docker 官网下载页面](https://download.docker.com/linux/centos/7/x86_64/stable/Packages/) 下载 RPM 安装包，以下以 CentOS 7 为例。
分别下载最新版本的：

- [containerd.io](https://download.docker.com/linux/centos/7/x86_64/stable/Packages/containerd.io-1.6.13-3.1.el7.x86_64.rpm)
- [docker-ce](https://download.docker.com/linux/centos/7/x86_64/stable/Packages/docker-ce-20.10.19-3.el7.x86_64.rpm)
- [docker-ce-cli](https://download.docker.com/linux/centos/7/x86_64/stable/Packages/docker-ce-cli-20.10.19-3.el7.x86_64.rpm)
- [docker-compose-plugin](https://download.docker.com/linux/centos/7/x86_64/stable/Packages/docker-compose-plugin-2.14.1-3.el7.x86_64.rpm)
- [docker-ce-rootless-extras](https://download.docker.com/linux/centos/7/x86_64/stable/Packages/docker-ce-rootless-extras-20.10.9-3.el7.x86_64.rpm)
- [docker-scan-plugin](https://download.docker.com/linux/centos/7/x86_64/stable/Packages/docker-scan-plugin-0.23.0-3.el7.x86_64.rpm)

将以上文件上传到服务器 A（假设放在 `docker` 目录），执行安装命令：

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

在能联网、已安装 Docker 的服务器 B 上拉取镜像，并导出为 tar 包（便于拷贝到离线环境）：

```console
$ docker pull kodcloud/kodbox
$ docker pull redis:alpine
$ docker pull mariadb:10.6
$ docker save -o kodbox.tar kodcloud/kodbox
$ docker save -o redis.tar redis:alpine
$ docker save -o mariadb.tar mariadb
```

将 tar 包上传到离线服务器 A，执行导入命令：

```console
$ docker load -i kodbox.tar
$ docker load -i redis.tar
$ docker load -i mariadb.tar
```

导入完成后，执行 `docker images` 应能看到 `kodbox`、`redis` 和 `mariadb` 三个镜像。

### HTTP 方式快速启动

> 注意
>
> 在离线服务器 A 上创建一个目录作为项目目录，后面所有命令都在这个目录下执行
{: .important}

- 创建 `.env` 文件设置环境变量（必须修改等号右边的值，格式如 `MYSQL_USER=kodbox`，值不要包含 `&` 符号）。Docker 启动时会自动将这些变量传入容器：

  ```console
  $ mkdir /kodbox && cd /kodbox
  $ vim .env
  ```

- 创建 `db.env` 文件，设置数据库专用环境变量（执行 `vim db.env` 编辑）：

  ```bash
  MYSQL_PASSWORD=
  MYSQL_DATABASE=kodbox
  MYSQL_USER=kodbox
  ```

- 创建 `docker-compose.yml` 文件，配置端口映射和数据持久化目录：

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

进入项目目录，执行 `docker compose up -d` 启动服务。离线环境不会重新拉取镜像，直接使用已导入的本地镜像创建容器：

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

然后访问 KodBox 安装向导，完成系统初始化。

</div>
