---
title: "CentOS 7.9系统中可道云网盘的安装示例"
keywords: centos, CentOS7.9
description: 在 CentOS 7.9 上从零安装 Nginx、PHP、MySQL 与 kodbox 的分步教程
---

> 重要：
>
> CentOS 7 已停止官方维护，新项目建议选用 Ubuntu 22.04、openEuler 或 teamOS。
{: .important}

## 概述

本文介绍如何在 **CentOS 7.9 最小安装系统** 上部署 **KodBox**。CentOS 是基于 Red Hat 的 Linux 发行版，适合服务器环境。

### 软件版本

- **nginx** 1.22
- **php** 7.4
- **MySQL** 8.0
- **redis** 6.2

### NGINX

Nginx 是高性能 Web 服务器。请参考 [nginx 官网教程](http://nginx.org/en/linux_packages.html#RHEL-CentOS) 添加稳定版 yum 源并安装：

```console
$ yum -y install yum-utils vim
$ vim /etc/yum.repos.d/nginx.repo
```

```repo
[nginx-stable]
name=nginx stable repo
baseurl=http://nginx.org/packages/centos/$releasever/$basearch/
gpgcheck=1
enabled=1
gpgkey=https://nginx.org/keys/nginx_signing.key
module_hotfixes=true
```

安装 Nginx 并编辑配置文件：

```console
$ yum install nginx
$ systemctl enable nginx
$ vim /etc/nginx/nginx.conf
```

需要注意的配置

```nginx
listen 80;              ##访问端口
root /var/www/html;     #改成自己的站点目录
server_name _;          #访问域名 '_'代表任何域名都能访问
```

还需添加以下配置，使 Nginx 能正确解析 PHP 文件：

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

[安装参考](https://computingforgeeks.com/how-to-install-php-7-4-on-centos-7/)

```console
$ yum -y install https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
$ yum -y install https://rpms.remirepo.net/enterprise/remi-release-7.rpm
$ yum-config-manager --enable remi-php74
$ yum install php php-cli php-fpm php-mysqlnd php-zip php-gd php-mcrypt php-mbstring php-xml php-pear \
php-bcmath php-redis php-memcached php-ldap php-intl php-pecl-imagick php-pecl-swoole php-opcache
$ chown -R root:nginx /var/lib/php
$ systemctl enable php-fpm && systemctl start php-fpm
```

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
   -e "s/listen = 127.0.0.1:9000/listen = \/var\/run\/php-fpm.sock/g" \
   ${PHP_FPM}

$ systemctl restart php-fpm
```

### MySQL

[安装参考](https://linuxize.com/post/install-mysql-on-centos-7/)

```console
$ yum localinstall https://dev.mysql.com/get/mysql80-community-release-el7-7.noarch.rpm
$ yum install mysql-community-server
```

在安装过程中可能会提示需要导入 `MySQL GPG` 密钥。键入 `y` 并回车。

```console
$ systemctl enable mysqld && systemctl start mysqld
```

MySQL 首次启动会生成临时 root 密码，可用以下命令查看：

```console
$ grep 'temporary password' /var/log/mysqld.log
```

按向导完成安全设置（修改密码、删除测试库等）：

```console
$ mysql_secure_installation
```

连上数据库

```console
$ mysql -uroot -p
```

创建 kodbox 数据库和用户（将 `username` 和 `password` 替换为实际值）：

```sql
mysql> CREATE USER 'username'@'localhost' IDENTIFIED BY 'password';
mysql> CREATE DATABASE IF NOT EXISTS kodbox CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
mysql> GRANT ALL PRIVILEGES ON kodbox.* TO 'username'@'localhost';
mysql> FLUSH PRIVILEGES;
```

### [Redis](https://linuxize.com/post/how-to-install-and-configure-redis-on-centos-7/)

```console
$ yum-config-manager --enable remi
$ yum install redis
$ systemctl enable redis && systemctl start redis
```

#### 安装 KodBox

关闭 SELinux（Linux 安全模块，可能阻止 Nginx 访问文件）：

```console
$ setenforce 0
$ sed -i "s/SELINUX=enforcing/SELINUX=disabled/g" /etc/selinux/config
```

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
