---
title: "Anolis OS系统中可道云网盘的安装示例"
keywords: Anolis OS, 龙蜥
description: Anolis OS系统中可道云网盘的安装示例
---

### 概述

Anolis OS 8 是 OpenAnolis 社区推出的完全开源、中立、开放的发行版。 [了解更多](https://openanolis.cn/anolisos)

#### 查看系统版本

```console
$ cat /etc/os-release
NAME="Anolis OS"
VERSION="8.8"
ID="anolis"
ID_LIKE="rhel fedora centos"
VERSION_ID="8.8"
PLATFORM_ID="platform:an8"
PRETTY_NAME="Anolis OS 8.8"
ANSI_COLOR="0;31"
HOME_URL="https://openanolis.cn/"
```

### 软件版本

- **nginx** 1.22
- **php** 8.0
- **MySQL** 8.0
- **redis** 6.0

### 安装依赖环境

安装基础依赖环境

```console
$ dnf module enable nginx:1.22 php:8.0 redis:6
$ dnf install nginx php php-fpm php-gd php-json php-mbstring php-mysqlnd php-xml php-intl mysql-server redis
$ systemctl enable nginx php-fpm mysqld redis
$ systemctl start nginx php-fpm mysqld redis
```

支持图片视频等文件生成封面缩略图, 需要安装`ImageMagick`和`ffmpeg`。

> 提示：
>
> 如果是龙芯CPU
>
> - 安装`ImageMagick`可以从 `https://pkg.loongnix.cn/loongnix-server/8.4/epel/loongarch64/release/Everything/Packages/`下载RPM;
> - 安装`ffmpeg`需要切换Plus源地址`/etc/yum.repos.d/AnolisOS-Plus.repo`
>
> 1. 修改
`baseurl=http://pkg.loongnix.cn/loongnix-server/8.4/Loongnixplus/$basearch/release`
> 2. 修改`gpgcheck=0`
> 3. `dnf install ffmpeg --enablerepo=Plus`

### NGINX

`/etc/nginx/nginx.conf`需要注意的配置

```nginx
listen 80;              ##访问端口
root /var/www/html;     #改成自己的站点目录
server_name _;          #访问域名 '_'代表任何域名都能访问
```

需要添加的配置, 以解析PHP

```nginx
location ~ [^/]\.php(/|$) {
    try_files $uri =404;
    fastcgi_pass unix:/run/php-fpm/www.sock;
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

[配置优化参考](./configuration.md)

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

### MySQL

这里需要使用 MySQL 命令行界面创建`KodBox`所使用的数据库用户和数据库。首次登录时, `KodBox`将创建数据库表。

执行数据库安全设置向导, 根据提示步骤设置密码规则、删除匿名用户等

```console
$ mysql_secure_installation
```

启动 MySQL 命令行模式, 输入以下行，将`username`和`password`替换为适当的值，并使用 Enter 键确认：

```sql
mysql> CREATE USER 'username'@'localhost' IDENTIFIED BY 'password';
mysql> CREATE DATABASE IF NOT EXISTS kodbox CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
mysql> GRANT ALL PRIVILEGES ON kodbox.* TO 'username'@'localhost';
mysql> FLUSH PRIVILEGES;
```

### Redis

由于系统默认不包含`php-redis`扩展, 这里需要手动编译, 执行

```console
$ dnf install git php-devel make -y
$ git clone https://github.com/phpredis/phpredis.git
$ cd phpredis
$ phpize
$ ./configure
$ make && make install
Installing shared extensions:     /usr/lib64/php/modules/
$ echo "extension=redis.so" > /etc/php.d/20-redis.ini
$ systemctl restart php-fpm
```

#### 安装KodBox

下载最新版本的kodbox安装包，解压到站点目录

```console
$ dnf install -y unzip
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
