---
title: "Docker环境可道云网盘的安装示例"
keywords: windows, docker, 容器
description: Docker环境可道云网盘的安装示例
---

<div id="docker_win" class="tab-pane fade in active" markdown="1">

## 概述

从Docker官网下载[Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/), 注意Windows系统要求为`win10`或`win11`

安装并打开后页面如下图![docker desktop](../images/docker_dk.png){:width="700px"}

## 部署步骤

> 提示:
>
> 在Linux 或者 Mac OS上可以使用相同的部署步骤。

1. 首先创建一个目录作为项目目录, 这里选择 `D:/kodbox/`
2. 在`D:/kodbox/`下新建`db.env`文件来设置数据库环境变量

    ```bash
    MYSQL_PASSWORD=
    MYSQL_DATABASE=kodbox
    MYSQL_USER=kodbox
    ```

3. 在`D:/kodbox/`下新建`docker-compose.yml`文件, 在其中配置映射端口、持久化目录等

  ```yaml
  version: '3.5'

  services:
    db:
      image: mariadb:lts
      command: --transaction-isolation=READ-COMMITTED
      restart: always
      volumes:
        - "./db:/var/lib/mysql"       #./db是数据库持久化目录，可以修改
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

3. 打开`powershell`终端, 进入项目目录，执行`docker compose up -d`启动命令，会自动拉取容器并运行

    ```powershell
    PS D:\> cd D:/kodbox/
    PS D:\kodbox> docker compose up -d
    [+] Running 4/4
    - Network kodbox_default    Created                                                                               0.1s
    - Container kodbox-redis-1  Started                                                                               5.5s
    - Container kodbox-db-1     Started                                                                               5.6s
    - Container kodbox-app-1    Started                                                                               1.6s
    PS D:\kodbox>
    ```

    列出docker容器，可以看到3个容器正在运行

    ```powershell
    PS D:\kodbox> docker ps
    CONTAINER ID   IMAGE             COMMAND                  CREATED         STATUS         PORTS                                   NAMES
    b68969faf44e   kodcloud/kodbox   "/entrypoint.sh /usr…"   6 minutes ago   Up 6 minutes   443/tcp, 0.0.0.0:80->80/tcp, 9000/tcp   kodbox-app-1
    b56ad3c7248e   mariadb           "docker-entrypoint.s…"   6 minutes ago   Up 6 minutes   3306/tcp                                kodbox-db-1
    d00f14f16ca7   redis:alpine      "docker-entrypoint.s…"   6 minutes ago   Up 6 minutes   6379/tcp                                kodbox-redis-1
    ```

    如果需要停止服务

    ```powershell
    PS D:\kodbox> docker compose down
    [+] Running 4/4
    - Container kodbox-app-1    Removed                                                                                                                                              1.1s
    - Container kodbox-redis-1  Removed                                                                                                                                              0.5s
    - Container kodbox-db-1     Removed                                                                                                                                              1.1s
    - Network kodbox_default    Removed
    ```

    由于数据库和kodbox已经挂载了持久化目录，需要时可以重新启动，不用担心数据丢失

    ```powershell
    PS D:\kodbox> docker compose up
    ```

4. 根据`docker-compose.yml`文件中配置的映射端口, 访问 [安装向导](./start.md) 进行系统初始化。

</div>
