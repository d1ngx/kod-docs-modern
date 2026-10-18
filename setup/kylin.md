---
title: "银河麒麟(kylin V10)系统中可道云网盘的安装示例"
keywords: 银河麒麟, kylin V10
description: 在 Kylin Linux Advanced Server V10 上从零安装 Nginx、PHP、MySQL 与 kodbox 的分步教程
---

## 概述

查看系统版本

```console
$ nkvers
############## Kylin Linux Version #################
Release:
Kylin Linux Advanced Server release V10 (Tercel)

Kernel:
4.19.90-23.8.v2101.ky10.x86_64

Build:
Kylin Linux Advanced Server
release V10 (SP1) /(Tercel)-x86_64-Build20/20210518
#################################################
```

### 软件版本

- **nginx** 1.16
- **php** 7.2
- **MariaDB** 10.3
- **redis** 4.0

### 安装依赖环境

安装基础依赖环境

```console
$ yum install nginx
$ yum install php php-fpm php-json php-mysqlnd php-gd php-mbstring php-xml php-bcmath php-ldap php-intl php-opcache
$ yum install mariadb-server redis
$ systemctl enable nginx php-fpm mariadb redis
$ systemctl start nginx php-fpm mariadb redis
```

支持图片视频等文件生成封面缩略图

```console
$ yum install ImageMagick ffmpeg
```

### NGINX

`/etc/nginx/nginx.conf`需要注意的配置

```nginx
listen 80;              ##访问端口
root /var/www/html;     #改成自己的站点目录
server_name _;          #访问域名 '_'代表任何域名都能访问
```

需要添加的配置，以解析PHP

```nginx
location ~ [^/]\.php(/|$) {
   try_files $uri =404;
   fastcgi_pass unix:/var/run/php-fpm.sock;
   fastcgi_index index.php;
   set $path_info $fastcgi_path_info;
   set $real_script_name $fastcgi_script_name;
   if ($fastcgi_script_name ~ "^(.+?\.php)(/.+)$") {
      set $real_script_name $1;
      set $path_info $2;
   }
   fastcgi_param SCRIPT_FILENAME $document_root$real_script_name;
   fastcgi_param SCRIPT_NAME $real_script_name;
   fastcgi_param PATH_INFO $path_info;
   include fastcgi_params;
}
```

[Nginx 配置说明](/setup/nginx/)

### PHP

配置参数调整

```console
$ PHP_INI=/etc/php.ini
$ PHP_FPM=/etc/php-fpm.d/www.conf
$ sed -i \
   -e "s/max_execution_time = .*/max_execution_time = 3600/g" \
   -e "s/max_input_time = .*/max_input_time = 3600/g" \
   -e "s/memory_limit = .*/memory_limit = 512M/g" \
   -e "s/post_max_size = .*/post_max_size = 512M/g" \
   -e "s/upload_max_filesize = .*/upload_max_filesize = 512M/g" \
   ${PHP_INI}

$ sed -i \
   -e "s/pm.max_children = .*/pm.max_children = 100/g" \
   -e "s/pm.start_servers = .*/pm.start_servers = 10/g" \
   -e "s/pm.min_spare_servers = .*/pm.min_spare_servers = 10/g" \
   -e "s/pm.max_spare_servers = .*/pm.max_spare_servers = 50/g" \
   -e "s/;pm.max_requests = 500/pm.max_requests = 500/g" \
   -e "s/user = apache/user = nginx/g" \
   -e "s/group = apache/group = nginx/g" \
   -e "s/;listen.mode = 0660/listen.mode = 0666/g" \
   -e "s/;listen.owner = nobody/listen.owner = nginx/g" \
   -e "s/;listen.group = nobody/listen.group = nginx/g" \
   ${PHP_FPM}

$ systemctl restart php-fpm
```

### MariaDB

这里需要使用 MariaDB 命令行界面创建`KodBox`所使用的数据库用户和数据库。首次登录时，`KodBox`将创建数据库表。

MariaDB 初始密码为空，执行数据库安全设置向导，根据提示步骤重新设置密码(提示输密码时直接回车)

```console
$ sudo mysql_secure_installation
```

输入以下行，将`username`和`password`替换为适当的值，并使用 Enter 键确认：

```sql
mysql> CREATE USER 'username'@'localhost' IDENTIFIED BY 'password';
mysql> CREATE DATABASE IF NOT EXISTS kodbox CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
mysql> GRANT ALL PRIVILEGES ON kodbox.* TO 'username'@'localhost';
mysql> FLUSH PRIVILEGES;
```

### Redis

系统默认未包含 php-redis 扩展（用于连接 Redis 缓存），需手动编译安装：

```console
$ yum install git php-devel make -y
$ git clone https://github.com/phpredis/phpredis.git
$ cd phpredis
$ phpize
$ ./configure
$ make && make install
Installing shared extensions:     /usr/lib64/php/modules/
$ echo "extension=redis.so" > /etc/php.d/20-redis.ini
$ systemctl restart php-fpm
```

#### 安装 KodBox

下载最新版 kodbox 安装包，解压到网站根目录：

```console
$ yum install -y unzip
$ cd /var/www/html/
$ curl -L "https://api.kodcloud.com/?app/version&download=server.link" -o kodbox.zip
$ unzip kodbox.zip && rm -f kodbox.zip
$ chown -R nginx:nginx /var/www/html
$ chmod -R 755 /var/www/html
$ systemctl restart nginx
```

设置防火墙

```console
$ firewall-cmd --zone=public --add-port=80/tcp --permanent
$ firewall-cmd --reload
```

然后在浏览器访问[安装向导](./start.md), 完成系统初始化步骤。
