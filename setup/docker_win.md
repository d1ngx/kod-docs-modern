---
title: "Docker环境可道云网盘的安装示例"
keywords: windows, docker, 容器
description: 在 Windows Docker Desktop 上部署 kodbox
---

<div id="docker_win" class="tab-pane fade in active" markdown="1">

## 概述

Docker Desktop 是 Windows 上的 Docker 图形化工具，可在本地运行 Linux 容器。请从 Docker 官网下载 [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)，系统要求为 Windows 10 或 Windows 11。

安装并打开后，界面如下图所示：![docker desktop](../images/docker_dk.png){:width="700px"}

## 部署步骤

> 提示:
>
> 在 Linux 或 macOS 上可使用相同的部署步骤。

1. 首先创建一个目录作为项目目录，这里选择 `D:/kodbox/`
2. 在 `D:/kodbox/` 下新建 `db.env` 文件，用于设置数据库环境变量：

    ```bash
    MYSQL_PASSWORD=
    MYSQL_DATABASE=kodbox
    MYSQL_USER=kodbox
    ```

3. 在 `D:/kodbox/` 下新建 `docker-compose.yml` 文件，配置端口映射和数据持久化目录：

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

4. 打开 PowerShell 终端，进入项目目录，执行 `docker compose up -d` 启动服务（`-d` 表示后台运行）。Docker 会自动拉取镜像并创建容器：

    ```powershell
    cd D:/kodbox/
    docker compose up -d
    ```

    示例输出：

    ```text
    [+] Running 4/4
    - Network kodbox_default    Created                                                                               0.1s
    - Container kodbox-redis-1  Started                                                                               5.5s
    - Container kodbox-db-1     Started                                                                               5.6s
    - Container kodbox-app-1    Started                                                                               1.6s
    ```

    用 `docker ps` 查看正在运行的容器，正常情况下可以看到 3 个容器：

    ```powershell
    docker ps
    ```

    示例输出：

    ```text
    CONTAINER ID   IMAGE             COMMAND                  CREATED         STATUS         PORTS                                   NAMES
    b68969faf44e   kodcloud/kodbox   "/entrypoint.sh /usr…"   6 minutes ago   Up 6 minutes   443/tcp, 0.0.0.0:80->80/tcp, 9000/tcp   kodbox-app-1
    b56ad3c7248e   mariadb           "docker-entrypoint.s…"   6 minutes ago   Up 6 minutes   3306/tcp                                kodbox-db-1
    d00f14f16ca7   redis:alpine      "docker-entrypoint.s…"   6 minutes ago   Up 6 minutes   6379/tcp                                kodbox-redis-1
    ```

    如需停止并移除所有容器（数据仍保留在挂载目录中）：

    ```powershell
    docker compose down
    ```

    示例输出：

    ```text
    [+] Running 4/4
    - Container kodbox-app-1    Removed                                                                                                                                              1.1s
    - Container kodbox-redis-1  Removed                                                                                                                                              0.5s
    - Container kodbox-db-1     Removed                                                                                                                                              1.1s
    - Network kodbox_default    Removed
    ```

    数据库和 kodbox 的数据已挂载到本地目录，再次执行 `docker compose up` 即可恢复，数据不会丢失：

    ```powershell
    docker compose up
    ```

5. 根据 `docker-compose.yml` 中配置的映射端口，访问 [安装向导](./start.md) 完成系统初始化。

</div>
