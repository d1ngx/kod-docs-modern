---
title: "OnlyOffice组件的安装示例"
keywords: 在线预览, office, office在线编辑, kodoffice, 容器, onlyoffice
description: Linux 上用 Docker 部署 OnlyOffice 在线编辑服务并接入 kodbox
---

<div id="setup" class="tab-pane fade in active" markdown="1">

## 环境要求

OnlyOffice 是在线文档编辑服务，可让用户在浏览器中直接编辑 Word、Excel、PPT 等文件。

- 操作系统：CentOS 7+、Ubuntu 14+、Debian 8+、RedHat 7+
- 服务器内存 4GB 以上
- 需安装 onlyoffice 插件（v2.06 版本起免费开放）

> 提示：
>
> 默认使用社区版 OnlyOffice 容器，支持 20 路同时编辑；超出并发数的用户只能预览。

## 1. 安装 Docker

Docker 是容器运行平台。请先安装并启动 Docker 服务：

```bash
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
systemctl enable docker && systemctl start docker
```

## 2. 在线部署方式

### 1. 快速启动

以下命令会拉取并运行 OnlyOffice 容器，映射到本机 8001 端口：

```bash
docker run -itd -p 8001:80 --name kodoffice --restart always kodcloud/kodoffice:7.4.1.1
```

若网络不佳，可切换阿里云容器镜像地址

```bash
docker run -itd -p 8001:80 --name kodoffice --restart always registry.cn-hangzhou.aliyuncs.com/kodcloud/kodoffice:7.4.1.1
```

- OnlyOffice 缓存目录为 `/var/lib/onlyoffice`；若编辑文件较多，建议挂载到宿主机以节省容器空间。
- 验证是否启动成功：
    - 等待 1～3 分钟后，在浏览器访问 `http://[域名或IP]:8001/web/`，页面显示 `success,运行正常` 即表示正常。

> 提示：
>
> - kodoffice版本增加了多种中文字体 并且兼容插件检测；
> - 部署onlyoffice官方社区版（包含arm版）：
```bash
docker run -itd -p 8001:80 -e JWT_ENABLED=false -e ALLOW_PRIVATE_IP_ADDRESS=true \
--name onlyoffice --restart always onlyoffice/documentserver
```
> - 部署龙芯版（loongarch64架构，如使用3A5000、3A6000的CPU）：
```bash
docker run -itd -p 8001:80 --name kodoffice --restart always kodcloud/kodoffice:loongarch-7.4.1.3
```

### 2. 以 HTTPS 方式启动

HTTPS 会对传输加密，生产环境建议使用。需准备已有 SSL 证书：

- `/data/certs/onlyoffice.key`
- `/data/certs/onlyoffice.crt`
- 确认`/data/certs`目录有证书存在（证书名称必须为`onlyoffice`），在执行下方命令启动

```bash
docker run -itd --name kodoffice -p 8443:443 \
-v /data/certs:/var/www/onlyoffice/Data/certs \
kodcloud/kodoffice:7.4.1.1
```

- 验证启动成功：
    - 等待1~3分钟，在浏览器访问`https://[域名]:8443/web/`会看到`success,运行正常`.

#### 更新证书

1. 替换证书文件`/data/certs/onlyoffice.key`、`/data/certs/onlyoffice.crt`，注意证书名称不能改变。
2. 重启容器内nginx服务`docker exec -it kodoffice service nginx restart`

### 3. 注意事项

- 快速启动使用 HTTP。若可道云站点已启用 HTTPS，OnlyOffice 也需用 HTTPS 部署，否则浏览器会拦截混合内容导致无法使用。
- 8001端口是可以改的，修改后记得填写解析地址到onlyoffice插件配置里面

## 3. 离线部署方式

> 提示：
>
> - 无公网环境部署 OnlyOffice 请联系可道云技术售后。

## 4. 配置到可道云

### 1. 安装插件

管理员登录 → **插件中心（全部）** → 找到 onlyoffice 插件 → 点击安装。

### 2. 配置插件

> 提示：
>
> - 若 OnlyOffice 与可道云在同一台服务器且使用 8001 端口，插件通常无需额外配置。

点击「配置插件」，将 OnlyOffice 所在服务器的 IP 填入图中位置（注意末尾 `/web/` 不可省略）：

点击「检测 office 服务器」。检测通过后刷新可道云页面，选中 Office 文件 → 右键 → 打开方式 → onlyoffice 编辑，即可体验在线编辑。

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

### 限制访问域名

配置网盘地址白名单，不允许其他站点调用onlyoffice.
```bash
docker exec -it kodoffice vim /var/www/onlyoffice/documentserver/web-apps/kod/allowhost.js
```

编辑文件，将允许访问的网盘域名填入以下配置：

```javascript
window.kod.allowHost = [
        // 'kodcloud.com','*.kod.com',
        /*allowHostAdd*/
];
```

### 插件检测说明

- **域名规则检测**: 为IP或域名地址，但不能为localhost;
- **静态资源访问状态**: 检测`[填写地址]/sdkjs/common/AllFonts.js`;
- **office服务器运行状态**: 检测`[填写地址]/check/`
    - 若检测失败，建议重启内部解析服务`docker exec -it kodoffice bash /app/ds/run-document-server.sh`;
    - 使用onlyoffice官方社区版可忽略此项检测；
- **office服务器请求kod**: 检测容器内是否能访问网盘地址
    - 若检测失败，建议容器内测试网盘连通性`docker exec -it kodoffice ping [网盘地址]`;
    - 使用onlyoffice官方社区版可忽略此项检测；
- **kod服务器请求office**: 检测网盘服务器是否能访问kodoffice地址。

### 重启、停止和删除

- `docker restart kodoffice`
- `docker stop kodoffice`
- `docker rm kodoffice`
    - 容器删除后仍有部分数据保留，全部清除需要执行`docker volume prune`

### 如何配置 https 访问

- 如果部署是以https方式启动，直接访问即可
- 如果部署是以http方式启动的，需要配置nginx反向代理来实现https转http，具体实现参考：

    ```bash
    server
    {
        listen 8443 ssl http2;
        server_name cloud.example.com;

        ssl_certificate    /etc/nginx/ssl/cloud.example.com.crt;
        ssl_certificate_key    /etc/nginx/ssl/cloud.example.com.key;
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
    ```bash
    sudo mkdir /etc/nginx/ssl
    sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/nginx-selfsigned.key -out /etc/nginx/ssl/nginx-selfsigned.crt
    ```
2. 更新证书到nginx反代配置
> 提示：
>
> 将onlyoffice服务地址（`https://[server]:[port]/web/`）配置到插件后，需单独访问一次onlyoffice服务地址，浏览器允许继续访问才可正常使用。

```nginx
    ssl_certificate    /etc/nginx/ssl/nginx-selfsigned.crt;
    ssl_certificate_key     /etc/nginx/ssl/nginx-selfsigned.key;
```
3. 修改容器配置，允许不安全访问
> 提示：
>
> 如果网盘站点使用了不安全证书，则需要进行以下配置。

```bash
docker exec -it kodoffice bash
sed -i.bak '/rejectUnauthorized/ s/true/false/g' /etc/onlyoffice/documentserver/default.json
bash documentserver-update-securelink.sh
```

### 重启系统后如何自启动

- 安装默认已经加入自启动了

### 自定义域名解析

重新运行容器，加上参数解析指定域名（示例） `--add-host test1.com:192.168.3.4`(或者指定dns如`--dns 192.168.1.1`)
```bash
docker run -itd -p 8001:80 --name kodoffice --restart always --add-host test1.com:192.168.3.4 kodcloud/kodoffice:7.4.1.1
```

### 修改`docker0`网口默认网段

> 提示：
>
> 请先删除所有已运行的容器，否则网段设置不会生效。

参考[docker官网文档](https://docs.docker.com/network/drivers/bridge/#configure-the-default-bridge-network)
`vim /etc/docker/daemon.json`

```yaml
{
  "bip": "172.26.0.1/16"
}
```

```bash
systemctl restart docker
```
<div>
