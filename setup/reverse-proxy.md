---
title: "HTTPS 反向代理、非标准端口与 CDN 真实 IP 配置"
type: how-to
edition: ["开源版", "企业版"]
minVersion: "1.70"
keywords: ["反向代理", "HTTPS", "Nginx", "Nginx Proxy Manager", "非标准端口", "4433", "try_files", "伪静态", "CDN", "真实 IP", "PC 客户端登录失败"]
description: "生产级 Nginx 与 Nginx Proxy Manager 反向代理配置模板，完整覆盖根目录/二级目录伪静态、非 80/443 端口客户端登录修复与 CDN 真实 IP 透传。"
---

本指南提供可直接复制的 Nginx 与 Nginx Proxy Manager（NPM）反向代理配置，系统解决可道云启用 HTTPS、家宽运营商封锁 80/443 端口改用非标准端口（如 `4433`、`8443`）以及套用 CDN 后的登录、上传与真实 IP 识别问题。

## 前置条件

- KodBox 已通过 Docker（例如监听 `127.0.0.1:8080`）或传统 LNMP 正常运行。
- 已准备好有效 SSL 证书（强烈建议使用 Let's Encrypt 或商业 CA 签发的**完整证书链 fullchain**，避免自签名证书导致移动端/桌面端校验证书失败）。

## 1. 标准 HTTPS 反向代理配置（Nginx）

将以下配置保存为 `/etc/nginx/conf.d/kodbox.conf`（按需修改 `server_name`、证书路径与后端端口）。配置已同步放行大文件上传与 WebDAV 协议请求：

```nginx
server {
    listen 80;
    server_name cloud.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name cloud.example.com;

    ssl_certificate     /etc/nginx/ssl/cloud.example.com.fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/cloud.example.com.key;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 10m;

    # 放开大文件上传体积限制并关闭代理缓冲
    client_max_body_size 0;
    proxy_buffering off;
    proxy_request_buffering off;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Connection "";

        # 关键：必须使用 $http_host 而非 $host，以保留非标准端口号
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $http_host;

        proxy_connect_timeout 3600;
        proxy_send_timeout    3600;
        proxy_read_timeout    3600;
    }
}
```

## 2. 根目录与二级目录的 `try_files` 伪静态规则（非反代 / 直接 PHP-FPM）

当直接使用宿主机 Nginx + PHP-FPM 运行 KodBox（而非反向代理 Docker）时，正确配置 `try_files` 伪静态可确保外链、分享与 WebDAV 路由正常解析：

### 根目录部署

```nginx
location / {
    try_files $uri $uri/ /index.php?$query_string;
}
```

### 二级目录部署（例如 `/kodbox/`）

```nginx
location /kodbox/ {
    try_files $uri $uri/ /kodbox/index.php?$query_string;
}
```

> **提示**
>
> 若使用反向代理将 KodBox 挂载到二级目录 `/kodbox/`，请在后端确认 `proxy_pass` 末尾斜杠与 `X-Forwarded-Prefix` 一致，且当同时部署 OnlyOffice 时，务必核对 [OnlyOffice 二级目录反代配置](/setup/office/#office-subpath)。

## 3. 非标准端口（如 4433 / 8443）反代与客户端登录失败排查 {: #non-standard-port}

家庭宽带或内网端口映射场景下，运营商常封锁 `80`/`443` 端口，管理员通常改为监听 `4433`、`8443` 等非标准 HTTPS 端口。社区最高频的问题是：**浏览器打开 `https://cloud.example.com:4433` 一切正常，但 PC 客户端或手机 APP 无法登录、反复跳转或接口超时**。

请逐项核对以下四条关键配置：

1. **必须透传带端口的 `$http_host`**：
   - 错误写法：`proxy_set_header Host $host;`（`$host` 会丢弃 `:4433` 端口号，导致 KodBox 生成的重定向、API 回调与外链丢失端口，客户端请求回落到被封锁的 443 端口）。
   - 正确写法：`proxy_set_header Host $http_host;`。
2. **使用 Nginx Proxy Manager（NPM）时的配置要点**：
   - 在 NPM 的 Proxy Host → **Advanced** 自定义配置框中显式补充：
     ```nginx
     client_max_body_size 0;
     proxy_request_buffering off;
     proxy_set_header Host $http_host;
     proxy_set_header X-Forwarded-Proto $scheme;
     proxy_read_timeout 3600;
     ```
   - 勾选 **WebSockets Support**（同时保障在线办公与实时通知）。
3. **补全 SSL 中间证书链（fullchain）**：
   - 桌面浏览器常能自动补全缺失的中间证书，但 PC 客户端与 Android/iOS 原生网络栈校验更严格。务必将服务端证书设为包含中间 CA 的 `fullchain.pem`，切勿只放单张叶子证书。
4. **Windows 原生 WebDAV 端口限制**：
   - Windows 自带 WebClient 对非 80/443 端口及 HTTP 协议限制较多。非标端口用户挂载 WebDAV 时请务必启用 HTTPS，或直接使用 RaiDrive（详见 [WebDAV 插件连接与使用](/admin/webdav/)）。

## 4. 套用 CDN / 多层反代后获取客户端真实 IP

当站点前方套用了 Cloudflare、阿里云 CDN 或企业 WAF 时，KodBox 后台登录日志与登录管控若全显示 CDN 节点 IP 或 `172.x.x.x`，请在 Nginx 层配置可信上游网段还原真实客户端 IP：

```nginx
# 仅信任实际 CDN 或前级反代服务器的 IP / 网段，切勿信任 0.0.0.0/0
set_real_ip_from 127.0.0.1;
set_real_ip_from 172.16.0.0/12;
# 示例：若使用 Cloudflare，请替换为官方文档公布的最新 IPv4/IPv6 回源段
# set_real_ip_from 173.245.48.0/20;

# Cloudflare 可改为 CF-Connecting-IP；常规代理使用 X-Forwarded-For 或 X-Real-IP
real_ip_header X-Forwarded-For;
real_ip_recursive on;
```

同时确保 KodBox 所在反向代理将还原后的 `$remote_addr` 通过 `proxy_set_header X-Real-IP $remote_addr;` 传递给容器，避免客户端伪造请求头绕过 [登录管控 IP 规则](/admin/6/)。

## 5. 验证配置是否生效（Success Check）

1. **检查 Nginx 语法并重载**：
   ```bash
   nginx -t && nginx -s reload
   ```
2. **核对证书链与端口头**：在浏览器访问 `https://cloud.example.com:4433/`（或 443 端口），点击地址栏锁图标确认证书链有效，且页面所有静态资源与分享外链均保持相同协议与端口号。
3. **验证客户端登录与真实 IP**：使用 KodBox PC 客户端或手机 APP 输入完整地址（含 `https://` 与非标端口）成功登录；进入 **后台管理 → 登录日志**，确认记录的 IP 为你的公网/局域网真实 IP 而非 `127.0.0.1` 或 CDN 节点 IP。
4. **验证大文件分片上传**：上传一个 ≥ 500 MB 文件确认不会触发 `413 Request Entity Too Large` 或 `504 Gateway Timeout`。

## 相关延伸

- 参数核对：[大文件上传全链路参数核对与性能调优](/reference/performance-tuning/)
- 端口总表：[网络端口与反向代理配置总表](/reference/ports-and-proxy/)
- 报错速查：[告警与报错字典](/operations/error-dictionary/)
