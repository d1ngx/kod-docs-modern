---
title: "OnlyOffice组件的安装示例"
keywords: 在线预览, cad在线预览, 在线流程图, office在线编辑, psd在线预览
description: 可道云企业网盘支持数百种常见办公文档格式的在线预览。
---

<div id="setup" class="tab-pane fade in active" markdown="1">

## 环境要求

- 操作系统: CentOS 7+、Ubtntu 14+、Debian 8+、RedHat 7+
- 服务器内存4G以上
- 剩余磁盘空间不少于10G

> 提示：
>
> 默认使用社区版onlyoffice容器解析服务，支持20编辑并发，超出的并发数只能预览。

## 1.安装docker

安装并启动docker服务

```console
$ curl -fsSL https://get.docker.com | bash -s docker
$ systemctl enable docker && systemctl start docker
```

## 2.在线部署方式

### 1.快速启动

```console
$ docker run -itd -p 8001:80 --name kodoffice --restart always kodcloud/kodoffice:7.4.1.1
```

- onlyoffice缓存目录是`/var/lib/onlyoffice`,如果编辑文件特别多，可以考虑挂载。
- 验证启动成功：
    - 等待1~3分钟，在浏览器访问 `http://[域名(IP)]:8001/web/` 会看到`success,运行正常`.

> 提示：
>
> - kodoffice版本增加了多种中文字体 并且兼容插件检测;
> - 如果使用onlyoffice官方社区版部署，也是支持的：
```console
$ docker run -itd -p 8001:80 -e JWT_ENABLED=false -e ALLOW_PRIVATE_IP_ADDRESS=true \
--name onlyoffice --restart always onlyoffice/documentserver:7.5
```

### 2.以https方式启动

使用已有ssl证书

- `/data/certs/onlyoffice.key`
- `/data/certs/onlyoffice.crt`
- 确认`/data/certs`目录有证书存在（证书名称必须为`onlyoffice`），在执行下方命令启动

```console
$ docker run -itd --name kodoffice -p 8443:443 \
-v /data/certs:/var/www/onlyoffice/Data/certs \
kodcloud/kodoffice:7.4.1.1
```

- 验证启动成功：
    - 等待1~3分钟，在浏览器访问`https://[域名]:8443/web/`会看到`success,运行正常`.

#### 更新证书

1. 替换证书文件`/data/certs/onlyoffice.key`、`/data/certs/onlyoffice.crt`, 注意证书名称不能改变。
2. 重启容器内nginx服务`docker exec -it kodoffice service nginx restart`

### 3.注意事项

- 快速启动是http的方式，如果可道云站点使用了https，请选择https的方式部署，否则无法使用
- 8001端口是可以改的，修改后记得填写解析地址到onlyoffice插件配置里面

## 3.离线部署方式

> 提示：
>
> - 离线部署请联系可道云技术售后。

## 4.配置到可道云

### 1.安装插件

管理员登陆-进入**插件中心 (全部)**-找到onlyoffice插件，点击安装

### 2.配置插件

> 提示：
>
> - 如果office和可道云部署在同一台服务器, 且office使用`8001`端口, 插件则无需任何配置 。

点击配置插件,将上面office所在服务器ip替换到如图选中的内容(注意结尾`/web/`不能去除);

点击"检测office服务器"，如果检测通过这说明全部配置完成，刷新可道云页面，选中一个office文件右键打开方式，选择onlyoffice编辑即可体验。
![插件设置](/setup/images/2.3/1.png){:width="800px"}

检测结果无误如下图:
![插件设置](/setup/images/2.3/2.png){:width="600px"}

> **注意：**
>
> 1. 上面配置ip也可以是绑定了到该服务器的域名，不能为localhost
> 2. 如果网络内、或服务器开启防火墙，导致访问不了，可以尝试关闭防火墙或开启8001端口
> 3. 使用onlyoffice官方社区版本时，需填写服务地址`http://[IP]:8001`,插件第3，4项可能会报错，但是不影响使用，可以忽略。
{: .warning}

## 5.其他问题

### 重启、停止和删除

- `docker restart kodoffice`
- `docker stop kodoffice`
- `docker rm kodoffice`

### 如何配置https访问

- 如果部署是以https方式启动，直接访问即可
- 如果部署是以http方式启动的，需要配置nginx反向代理来实现https转http，具体实现参考：

    ```bash
    server
    {
        listen 8443 ssl http2;
        server_name cloud.example.com;

        ssl_certificate    /etc/ssl/nginx/cloud.example.com.crt;
        ssl_certificate_key    /etc/ssl/nginx/cloud.example.com.key;
        ssl_protocols TLSv1 TLSv1.1 TLSv1.2 SSLv2 SSLv3;
        ssl_ciphers HIGH:!aNULL:!MD5:!3DES;
        ssl_prefer_server_ciphers on;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        location / {
            proxy_pass  http://localhost:8001;
            proxy_set_header Host $host:$server_port;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            #websocket wss代理
            proxy_http_version 1.1;  
            proxy_set_header Upgrade $http_upgrade;  
            proxy_set_header Connection "Upgrade";

            proxy_cache_key $time_local$host$request_uri$is_args$args;
            proxy_cache_valid 200 304 301 302 1h;
            add_header X-Cache $upstream_cache_status;
            expires 3600s;
        }
    }
    ```

### insecure ssl

使用自签名ssl证书

> 提示： 
> 
> 浏览器会有警告，但继续访问仍可以使用。

1. 生成证书
    ```console
    $ sudo mkdir /etc/nginx/ssl
    $ sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/nginx-selfsigned.key -out /etc/nginx/ssl/nginx-selfsigned.crt
    ```
2. 更新证书到nginx反代配置
> 提示：
>
> 将onlyoffice服务地址（`https://[server]:[port]/web/`）配置到插件后, 需单独访问一次onlyoffice服务地址, 浏览器允许继续访问才可正常使用。

    ```nginx
        ssl_certificate    /etc/nginx/ssl/nginx-selfsigned.crt;
        ssl_certificate_key     /etc/nginx/ssl/nginx-selfsigned.key;
    ```
3. 修改容器配置, 允许不安全访问
> 提示：
> 
> 如果网盘站点使用了不安全证书，则需要进行以下配置。

    ```console
    $ docker exec -it kodoffice bash
    $ sed -i.bak '/rejectUnauthorized/ s/true/false/g' /etc/onlyoffice/documentserver/default.json
    $ bash documentserver-update-securelink.sh
    ```

### 重启系统后如何自启动

- 安装默认已经加入自启动了

### 自定义域名解析

重新运行容器, 加上参数解析指定域名（示例） `--add-host test1.com:192.168.3.4`

<div>
