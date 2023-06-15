---
title: "Ubuntu 22.04 LTS系统中可道云网盘的安装示例"
keywords: Ubuntu, Ubuntu 22.04 LTS
description: Ubuntu 22.04 LTS系统中可道云网盘的安装示例
---

<div id="ubuntu" markdown="1">

## 概述

在**Ubuntu 22.04 LTS** 上部署**kodbox**, 安装依赖软件环境比较简单, 所有软件在默认源中已经包含。

### 软件版本

- **nginx** 1.18
- **php** 8.1
- **MySQL** 8.0
- **redis** 6.0

### 安装依赖环境

安装基础依赖环境

```console
$ sudo apt update && sudo apt upgrade
$ sudo apt install nginx mysql-server redis-server
$ sudo apt install php php-fpm php-mysql php-gd php-redis php-mbstring php-curl php-xml php-zip php-json
$ sudo systemctl disable apache2.service
$ sudo systemctl enable nginx php8.1-fpm mysql redis-server
```

支持图片视频等文件生成封面缩略图

```console
$ sudo apt install imagemagick ffmpeg
```

> 如果PDF文件没有生成缩略图, 可以使用以下命令修改 imagemagick配置中关于pdf转换的限制
>  
> `sudo sed -i '/PDF/s/none/read \| write/g' /etc/ImageMagick-6/policy.xml`
>

### NGINX

`/etc/nginx/sites-enabled/default`配置调整

需要注意的配置

```nginx
listen 80;              ##访问端口
root /var/www/html;     #改成自己的站点目录
server_name _;          #访问域名 '_'代表任何域名都能访问
```

需要添加的配置, 以解析PHP

```nginx
location ~ [^/]\.php(/|$) {
   try_files $uri =404;
   fastcgi_pass unix:/run/php/php8.1-fpm.sock;
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
$ PHP_INI=/etc/php/8.1/fpm/php.ini
$ PHP_FPM=/etc/php/8.1/fpm/pool.d/www.conf
$ sed -i \
   -e "s/max_execution_time = 30/max_execution_time = 3600/g" \
   -e "s/max_input_time = 60/max_input_time = 3600/g" \
   -e "s/memory_limit = 128M/memory_limit = 512M/g" \
   -e "s/post_max_size = 8M/post_max_size = 512M/g" \
   -e "s/upload_max_filesize = 2M/upload_max_filesize = 512M/g" \
   ${PHP_INI}
    
$ sed -i \
   -e "s/pm.max_children = 5/pm.max_children = 100/g" \
   -e "s/pm.start_servers = 2/pm.start_servers = 10/g" \
   -e "s/pm.min_spare_servers = 1/pm.min_spare_servers = 10/g" \
   -e "s/pm.max_spare_servers = 3/pm.max_spare_servers = 50/g" \
   -e "s/;pm.max_requests = 500/pm.max_requests = 500/g" \
   -e "s/;listen.mode = 0660/listen.mode = 0666/g" \
   ${PHP_FPM}

$ sudo systemctl restart php8.1-fpm
```

### MySQL

这里需要使用 MySQL 命令行界面创建`KodBox`所使用的数据库用户和数据库。首次登录时, `KodBox`将创建数据库表。

要启动 MySQL 命令行模式, 请使用以下命令：

```console
$ sudo mysql
```

然后会出现 **mysql [root]>** 窗口。首次登陆建议先设置数据库root账号的密码

```sql
mysql> ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password by 'xxxx';
mysql> quit
```

并执行数据库安全设置向导, 根据提示步骤设置密码规则、删除匿名用户等

```console
$ sudo mysql_secure_installation
```

再次启动 MySQL 命令行模式, 输入以下行, 将`username`和`password`替换为适当的值, 并使用 Enter 键确认：

```sql
mysql> CREATE USER 'username'@'localhost' IDENTIFIED BY 'password';
mysql> CREATE DATABASE IF NOT EXISTS kodbox CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
mysql> GRANT ALL PRIVILEGES ON kodbox.* TO 'username'@'localhost';
mysql> FLUSH PRIVILEGES;
```

可以通过输入以下命令退出窗口：

```sql
mysql> quit
```

### 安装KodBox

下载最新版本的kodbox安装包, 解压到站点目录

```console
$ sudo apt install -y unzip
$ cd /var/www/html/
$ sudo curl -L "https://api.kodcloud.com/?app/version&download=server.link" -o kodbox.zip
$ sudo unzip kodbox.zip && sudo rm kodbox.zip
$ sudo chown -R www-data:www-data /var/www/html
$ sudo chmod -R 755 /var/www/html
$ sudo systemctl restart nginx
```

设置防火墙, 更多防火墙设置[参考](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-with-ufw-on-ubuntu-18-04)

```console
$ sudo ufw allow ssh
$ sudo ufw allow http
$ sudo ufw enable
```

然后在浏览器访问[安装向导](./start.md), 完成系统初始化步骤。

</div>
