---
title: "NGINX的配置优化"
keywords: nginx, php, MySQL, redis
description: 可道云网盘的依赖环境优化
---

<div id="nginx" markdown="1">

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
    client_max_body_size 1024M;
    client_body_timeout 300s;
    client_body_buffer_size 512k;

    sendfile            on;
    tcp_nopush          on;
    tcp_nodelay         on;
    keepalive_timeout   65;
    types_hash_max_size 4096;

    fastcgi_send_timeout 3600;
    fastcgi_read_timeout 3600;
    fastcgi_buffer_size 64k;
    fastcgi_buffers 4 64k;
    fastcgi_busy_buffers_size 128k;
    fastcgi_temp_file_write_size 256k;
    fastcgi_intercept_errors on;
    fastcgi_hide_header X-Powered-By;

    gzip on;
    gzip_min_length  1k;
    gzip_comp_level 2;
    gzip_types     text/plain application/javascript application/x-javascript text/javascript text/css application/xml;
    gzip_vary on;
    gzip_disable   "MSIE [1-6]\.";
    server_tokens off;

    add_header Referrer-Policy                      "no-referrer"   always;
    add_header X-Content-Type-Options               "nosniff"       always;
    add_header X-Download-Options                   "noopen"        always;
    add_header X-Frame-Options                      "SAMEORIGIN"    always;
    add_header X-Permitted-Cross-Domain-Policies    "none"          always;
    add_header X-Robots-Tag                         "none"          always;
    add_header X-XSS-Protection                     "1; mode=block" always;

    include             /etc/nginx/mime.types;
    default_type        application/octet-stream;

    server {
        listen 80;
        listen [::]:80;
        server_name cloud.example.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443      ssl http2;
        listen [::]:443 ssl http2;
        server_name  cloud.example.com;
        root         /var/www/html;
        index        index.php index.html;

        ssl_certificate     /etc/ssl/nginx/cloud.example.com.crt;
        ssl_certificate_key /etc/ssl/nginx/cloud.example.com.key;

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

</div>
