---
title: "Docker环境可道云网盘的安装示例"
keywords: Docker, 容器
description: Docker环境可道云网盘的安装示例
---

<div id="docker" class="tab-pane fade in active" markdown="1">

## [安装Docker](https://docs.docker.com/engine/install/)

### 1.安装环境

安装并启动docker服务, 新版本docker会自动安装`docker-compose-plugin`

```console
$ curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
$ systemctl enable docker && systemctl start docker
```

docker compose 用法, 在通过`docker compose up`启动后, 可以使用`docker compose ls`查看配置文件位置

```console
$ docker compose ls
NAME                STATUS              CONFIG FILES
docker-compose      running(3)          /kodbox/docker-compose.yaml
```

> 提示：
>
> 若`docker compose`命令不存在，可手动安装二进制文件`docker-compose`并在后续命令中替换。
> - `curl -SL https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose`
> - `chmod +x /usr/local/bin/docker-compose`

### 2.http方式快速启动

> 注意：
>
> 首先创建一个目录作为项目目录，后面所有命令都在这个目录下执行
> - `mkdir /kodbox && cd /kodbox`
> - 需在`db.env`中设置数据库密码，还有yml中的`MYSQL_ROOT_PASSWORD`需补充.
{: .important}

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

> 增加自定义mysql配置：
>
> `mkdir -p ./etc/mysql/conf.d && vim ./etc/mysql/conf.d/custom.cnf`

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

根据`docker-compose.yml`文件中配置的映射端口, 访问 [安装向导](./start.md) 进行系统初始化。

### 3.配置https证书

#### 方式一：宿主机Nginx反向代理

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate     /etc/nginx/ssl/example.com.pem;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;
    ssl_protocols       TLSv1.1 TLSv1.2 TLSv1.3;
    ssl_ciphers         EECDH+CHACHA20:EECDH+CHACHA20-draft:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:!MD5;
    add_header Strict-Transport-Security "max-age=31536000";
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:2m;
    ssl_session_timeout 1h;
    ssl_session_tickets off;

    client_max_body_size 0;
    proxy_buffering off;

    access_log  /var/log/nginx/proxy_access.log  main;
    error_log  /var/log/nginx/proxy_error.log  info;

    location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $http_host;

        proxy_connect_timeout 3600;
        proxy_read_timeout 3600;
        proxy_send_timeout 3600;
        proxy_http_version 1.1;
        proxy_set_header Connection "";

        proxy_pass http://127.0.0.1:80/;
    }
}
```

#### 方式二：配置证书到容器

创建一个证书目录,把下载的nginx版ssl证书放入目录

```console
$ mkdir /etc/kodbox/ssl
```

将证书重命名

```console
$ mv xxx.pem fullchain.pem
$ mv xxx.key privkey.pem
```

在http的docker-compose.yml增加证书目录映射`/etc/kodbox/ssl:/etc/nginx/ssl`, 容器检测到证书文件存在时会自动启用https配置.

```console
$ mkdir kodbox && cd kodbox
$ vim docker-compose.yaml
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
      - 443:443                      #左边80是使用端口，可以修改
    volumes:
      - "/etc/kodbox/ssl:/etc/nginx/ssl"  #左边配置主机证书目录
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

然后进入项目目录，执行`docker compose up -d`命令启动

### 4.其他问题

#### 自定义容器网络及IP段

参考[provide-static-ip-to-docker-containers-via-docker-compose](https://stackoverflow.com/questions/39493490)

```yaml
version: '3.5'

services:
  db:
    image: mariadb:10.6
    restart: always
    command: --transaction-isolation=READ-COMMITTED --log-bin=binlog --binlog-format=ROW
    volumes:
      - "./db:/var/lib/mysql"       #./db是数据库持久化目录，可以修改
    environment:
      - MYSQL_ROOT_PASSWORD=
      - MARIADB_AUTO_UPGRADE=1
      - MARIADB_DISABLE_UPGRADE_BACKUP=1
    env_file:
      - db.env
    networks:
      vpcbr:
        ipv4_address: 10.5.0.5
      
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
    networks:
      vpcbr:
        ipv4_address: 10.5.0.6
    depends_on:
      - db
      - redis

  redis:
    image: redis:alpine
    restart: always
    networks:
      vpcbr:
        ipv4_address: 10.5.0.7

networks:
  vpcbr:
    driver: bridge
    ipam:
     config:
       - subnet: 10.5.0.0/16
         gateway: 10.5.0.1
```

#### 挂载NFS存储卷

> 提示：
>
> - NFS服务端需配置`no_root_squash`
> - 启动后需赋予容器对挂载目录的读写权限`docker exec -it kodbox-app-1 chown -R nginx:nginx /mnt/nfs`

```yaml
version: '3.5'

services:
  db:
    image: mariadb:10.6
    restart: always
    command: --transaction-isolation=READ-COMMITTED --log-bin=binlog --binlog-format=ROW
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
      - nfs_mount:/mnt/nfs
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

volumes:
  nfs_mount:
    driver_opts:
      type: "nfs"
      o: "addr=192.168.1.4,nolock,rw"
      device: ":/path/to-dir"
```

#### 挂载CIFS存储卷（SMB）

参考[docker_compose_cifs_mounts](https://docs.unmanic.app/docs/advanced/docker_compose_cifs_mounts/)
```bash
# Variables that will need to be changed:
#     <PUID>                            -  User id for folder/file permissions
#     <PGID>                            -  Group id for folder/file permissions
#     <PATH_TO_CONFIG>                  -  Path where Unmanic will store config files
#     <PATH_TO_ENCODE_CACHE>            -  Cache path for in-progress encoding tasks
#     <REMOTE_IP>                       -  Remote IP address of CIFS mount
#     <PATH_TO_LIBRARY>                 -  Path in remote machine to be mounted as your library 
#     <USERNAME>                        -  Remote mount username
#     <PASSWORD>                        -  Remote mount password
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
      - cifs_mount:/mnt/cifs
    environment:
      - MYSQL_HOST=db
      - REDIS_HOST=redis
      - PUID=100
      - PGID=101
    env_file:
      - db.env
    depends_on:
      - db
      - redis

  redis:
    image: redis:alpine
    restart: always

volumes:
  cifs_mount:
    driver: local
    driver_opts:
      type: cifs    
      device: //<REMOTE_IP>/<PATH_TO_LIBRARY>
      o: "username=<USERNAME>,password=<PASSWORD>,uid=100,gid=101"
```
</div>
