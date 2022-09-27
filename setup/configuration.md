---
title: "可道云依赖环境的配置优化"
keywords: nginx, php, MySQL, redis
description: 可道云网盘的依赖环境优化
---

<div id="configuration" markdown="1">

## NGINX

`/etc/nginx/nginx.conf`参考配置

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

#include /usr/share/nginx/modules/*.conf;

events {
    use epoll;
    worker_connections 51200;
    multi_accept on;
}

http {
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    server_names_hash_bucket_size 512;
    client_header_buffer_size 32k;
    large_client_header_buffers 4 32k;
    client_max_body_size 10G;

    sendfile            on;
    tcp_nopush          on;
    tcp_nodelay         on;
    keepalive_timeout   65;
    types_hash_max_size 4096;

    fastcgi_connect_timeout 3600;
    fastcgi_send_timeout 3600;
    fastcgi_read_timeout 3600;
    fastcgi_buffer_size 64k;
    fastcgi_buffers 4 64k;
    fastcgi_busy_buffers_size 128k;
    fastcgi_temp_file_write_size 256k;
    fastcgi_intercept_errors on;

    gzip on;
    gzip_min_length  1k;
    gzip_buffers     4 16k;
    gzip_http_version 1.1;
    gzip_comp_level 2;
    gzip_types     text/plain application/javascript application/x-javascript text/javascript text/css application/xml;
    gzip_vary on;
    gzip_proxied   expired no-cache no-store private auth;
    gzip_disable   "MSIE [1-6]\.";
    server_tokens off;

    include             /etc/nginx/mime.types;
    default_type        application/octet-stream;

    server {
        listen       80;
        listen       [::]:80;
        server_name  _;
        root         /var/www/html;
        index        index.php index.html;

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

        location ~ ^/(?:config|data)(?:$|/)  { 
            return 404; 
        }

        location ~* \.(jpg|jpeg|gif|png|css|js|ico|webp|tiff|ttf|svg)$ {
            expires      30d;
        }

        location ~ .*\.(js|css)?$ {
            expires      12h;
        }
        location = /favicon.ico {
            log_not_found off;
        }
    }
}
```

> 注意:
>
> 其中的`fastcgi_pass unix:/var/run/php-fpm.sock;`指的是绑定PHP的进程文件, 若该文件不存在, 请检查php-fpm配置。
{: .important}

在调整nginx配置后, 执行`nginx -t`检查语法, 确定无误后重启服务

```console
$ nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
$ systemctl restart nginx
```

## PHP

开启pathinfo, 支持webdav协议传输

```console
$ echo "cgi.fix_pathinfo=1" >> /etc/php.ini
```

建议调整`/etc/php.ini`中的如下参数, 以实现更好的上传体验

> 提示：
>
> KodBox采用分片上传, 这里设置的参数不会影响上传大文件。

```php.ini
max_execution_time = 3600
max_input_time = 3600
memory_limit = 512M
post_max_size = 512M
upload_max_filesize = 512M
```

php-fpm的配置文件位置通常位于`/etc/php/7.4/fpm/`或者`/etc/php-fpm.d/`

以下参数控制php-fpm进程数量, 建议根据实际情况适当调整, 参考[计算PHP内存消耗](https://spot13.com/pmcalculator/)

```www.conf
pm = dynamic
pm.max_children = 20
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 5
```

在调整php-fpm配置后, 执行`php-fpm -t`检查语法, 确定无误后重启服务

```console
$ php-fpm -t
[22-Sep-2022 18:12:21] NOTICE: configuration file /etc/php-fpm.conf test is successful
$ systemctl restart php-fpm
```

## MySQL

`/etc/my.cnf`参考配置, 最大内存占用`6G`左右, 参考计算方法[MySQL最大内存占用计算](https://www.mysqlcalculator.com/)

```my.cnf
binlog_cache_size = 192K
thread_stack = 384K
join_buffer_size = 4M

max_heap_table_size = 2048M
key_buffer_size = 256M
max_allowed_packet = 10G
table_open_cache = 2048
sort_buffer_size = 2M
read_buffer_size = 2M
read_rnd_buffer_size = 1M
thread_cache_size = 256
tmp_table_size = 512M
max_connections = 400
max_connect_errors = 100
open_files_limit = 65535
slow_query_log = 1
long_query_time = 3

innodb_buffer_pool_size = 1024M
innodb_log_file_size = 2048M
innodb_log_buffer_size = 512M
```

## Redis

如果安装时未选择redis, 登录后在可道云后台 - 服务器管理, 可以进行`缓存切换`

- 选择redis进行检测
- 检测通过后可以执行切换, 切换后会自动跳转到登录页面
  ![swh_rds](../images/swh_rds.png){:width="550px"}

为增强安全性, 建议增加redis密码配置。

编辑redis配置文件, 通常是`/etc/redis.conf`, 添加如下配置, 将其中的`password`替换为您的redis密码。

```redis.conf
requirepass password
```

然后在`KodBox`的根目录下`./config/setting_user.php`文件中添加如下配置, 将其中的`password`替换为您的redis密码。

```php
$config['cache']['redis']['auth'] = 'password'; 
```

需要重启redis服务, 执行`systemctl restart redis`

## PSD

`KodBox`支持`PSD`、`AI`等文件预览, 还有`pdf`、视频文件的封面缩略图生成。

实现这些需要安装`ImageMagick`和`ffmpeg`。

在CentOS 7.9 上, 安装方式为

```console
$ yum install ImageMagick
$ yum install epel-release
$ yum install https://download1.rpmfusion.org/free/el/rpmfusion-free-release-7.noarch.rpm
$ yum install ffmpeg
```

对于`HEIC`格式的在线预览, 则需要手动编译`ImageMagick`以增加支持。

```console
$ export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig
$ yum remove ImageMagick -y
$ yum install gcc gcc-c++ autoconf automake libtool
$ yum install -y fftw fftw-devel fftw-devel bzip2-devel freetype-devel libjpeg-devel libpng-devel libtiff-devel giflib-devel zlib-devel ghostscript-devel djvulibre-devel libwmf-devel jasper-devel  libX11-devel libXext-devel libXt-devel lcms-devel libxml2-devel librsvg2-devel OpenEXR-devel openjpeg openjpeg-devel  openjpeg2 openjpeg2-devel openjpeg2-libs  gcc gcc-c++  make automake  libtool   libtool-ltdl-devel lcms2  lcms2-devel LibRaw LibRaw-devel

$ cd /usr/src/ 
$ git clone https://github.com/strukturag/libde265.git  
$ git clone https://github.com/strukturag/libheif.git
$ git clone --depth 1 --branch 7.1.0-46 https://github.com/ImageMagick/ImageMagick.git
$ cd libde265/ 
$ ./autogen.sh && ./configure && make && make install 
$ cd /usr/src/libheif/ 
$ ./autogen.sh && ./configure && make && make install 
$ cd /usr/src/ImageMagick
$ ./configure
$ make -j 8
$ make install
$ ldconfig /usr/local/lib
$ identify --version
```

</div>
