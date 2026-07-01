---
title: "Ubuntu 22.04 LTS系统中可道云网盘的安装示例"
keywords: Ubuntu, Ubuntu 22.04 LTS
description: 在 Ubuntu 22.04 LTS 上从零安装 Nginx、PHP、MySQL 与 kodbox 的分步教程
---

<div id="ubuntu" markdown="1">

## 概述

本文介绍如何在 **Ubuntu 22.04 LTS** 上部署 **kodbox**。Ubuntu 是常用的 Linux 发行版；LTS（长期支持版）意味着官方会提供较长时间的更新维护。该版本默认软件源已包含所需依赖，安装步骤相对简单。

### 软件版本

- **nginx** 1.18
- **php** 8.1
- **MySQL** 8.0
- **redis** 6.0

### 安装依赖环境

以下命令会安装 Nginx（Web 服务器）、MySQL（数据库）、Redis（缓存）和 PHP（可道云运行环境）：

```console
$ sudo apt update && sudo apt upgrade
$ sudo apt install nginx mysql-server redis-server
$ sudo apt install php php-fpm php-mysql php-gd php-redis php-mbstring php-curl php-xml php-zip php-json
$ sudo systemctl disable apache2.service
$ sudo systemctl enable nginx php8.1-fpm mysql redis-server
```

以下扩展用于生成图片、视频等文件的封面缩略图：

```console
$ sudo apt install imagemagick ffmpeg
```

> 如果 PDF 文件没有生成缩略图，可执行以下命令修改 ImageMagick 对 PDF 转换的限制：
>
> `sudo sed -i '/PDF/s/none/read \| write/g' /etc/ImageMagick-6/policy.xml`
>

### NGINX

编辑 `/etc/nginx/sites-enabled/default`，调整以下关键配置：

```nginx
listen 80;              ##访问端口
root /var/www/html;     #改成自己的站点目录
server_name _;          #访问域名 '_'代表任何域名都能访问
```

还需添加以下配置，使 Nginx 能正确解析 PHP 文件：

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

以下命令调整 PHP 运行参数（如上传大小、执行时间等），以满足可道云对大文件上传的需求：

```console
$ PHP_INI=/etc/php/8.1/fpm/php.ini
$ PHP_FPM=/etc/php/8.1/fpm/pool.d/www.conf
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
   -e "s/;listen.mode = 0660/listen.mode = 0666/g" \
   ${PHP_FPM}

$ sudo systemctl restart php8.1-fpm
```

### MySQL

MySQL 是关系型数据库，可道云用它存储用户、文件索引等数据。需要通过命令行创建 kodbox 使用的数据库和用户；首次访问安装向导时，可道云会自动创建数据表。

启动 MySQL 命令行（首次登录无需密码）：

```console
$ sudo mysql
```

出现 **mysql [root]>** 提示符后，建议先设置 root 账号密码：

```sql
mysql> ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password by 'xxxx';
mysql> quit
```

然后执行数据库安全设置向导，按提示设置密码强度、删除匿名用户等：

```console
$ sudo mysql_secure_installation
```

再次进入 MySQL 命令行，创建 kodbox 数据库和用户（将 `username` 和 `password` 替换为实际值）：

```sql
mysql> CREATE USER 'username'@'localhost' IDENTIFIED BY 'password';
mysql> CREATE DATABASE IF NOT EXISTS kodbox CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
mysql> GRANT ALL PRIVILEGES ON kodbox.* TO 'username'@'localhost';
mysql> FLUSH PRIVILEGES;
```

输入 `quit` 退出 MySQL 命令行：

```sql
mysql> quit
```

### 安装 KodBox

下载最新版 kodbox 安装包，解压到网站根目录：

```console
$ sudo apt install -y unzip
$ cd /var/www/html/
$ sudo curl -L "https://api.kodcloud.com/?app/version&download=server.link" -o kodbox.zip
$ sudo unzip kodbox.zip && sudo rm kodbox.zip
$ sudo chown -R www-data:www-data /var/www/html
$ sudo chmod -R 755 /var/www/html
$ sudo systemctl restart nginx
```

配置防火墙（UFW 是 Ubuntu 自带的防火墙工具），允许 SSH 和 HTTP 访问。更多设置[参考](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-with-ufw-on-ubuntu-18-04)：

```console
$ sudo ufw allow ssh
$ sudo ufw allow http
$ sudo ufw enable
```

然后在浏览器访问 [安装向导](./start.md)，完成系统初始化。

</div>
