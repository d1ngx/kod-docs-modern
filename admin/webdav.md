---
title: "WebDAV 服务端与外部挂载实战指南"
type: how-to
edition: ["开源版", "企业版"]
minVersion: "1.70"
keywords: ["WebDAV", "RaiDrive", "WPS", "401", "This XML file does not appear to have any style information", "123云盘", "非标准端口", "外部挂载"]
description: "清晰区分「KodBox 作为 WebDAV 服务端被挂载」与「KodBox 挂载外部 WebDAV 存储」，覆盖 Windows 原生限制、Nginx 反代配置、401 排查与 v1.70 兼容性修复。"
---

<div id="WebDAV" class="tab-pane fade in active" markdown="1">

本指南系统说明 KodBox 中 WebDAV 的**两个方向**——对外提供 WebDAV 服务供本地电脑/App 挂载，以及挂载外部 WebDAV 网盘作为扩展存储——并集中解决 Windows 非标端口限制、浏览器打开报错误解、Nginx 反代放行与多级目录 `401` 鉴权等高频问题。

> **先分清方向再配置**
>
> - **方向 A（本页第一至三节）**：把 KodBox 映射为 Windows / macOS / RaiDrive 的本地网络磁盘（在「插件中心 → WebDAV」启用）。
> - **方向 B（本页第四节）**：让 KodBox 去读取外部 NAS 或第三方网盘（如 123 云盘）的 WebDAV 空间（在「后台管理 → 存储管理 → 新增 → WebDAV」配置）。

## 一、开启 KodBox WebDAV 服务端

### 1. 启用 WebDAV 插件

依次进入 **后台管理 → 插件中心 → WebDAV → 配置插件 → 开启 WebDAV 服务**。确保目标用户的系统角色已勾选允许使用 WebDAV 权限。

![plugin-webdav](../images/plugin-webdav.png){:width="650px"}

### 2. 获取个人 WebDAV 连接地址

进入 **账号中心 → WebDAV 挂载**，可查看「个人空间」、「all」（全部有权限文件）等位置的 WebDAV 地址（通常形如 `https://cloud.example.com/index.php/dav/`）。

![dav](../images/dav.png)

> **常见误解：在浏览器直接打开 WebDAV 地址提示 `This XML file does not appear to have any style information`？**
>
> 当你在浏览器地址栏直接访问 `/index.php/dav/` 并看到 **`This XML file does not appear to have any style information associated with it. The document tree is shown below.`** 时，**这不是报错！** 这说明 WebDAV 接口已正常响应标准的 XML 协议报文。WebDAV 地址应当填入客户端工具（Windows 网络位置、macOS 访达、RaiDrive 等），而不是用浏览器直接打开。

> **提示**
>
> - 使用官方 PC 客户端登录时，系统会自动在本地挂载 WebDAV，挂载名称与站点标题一致。
> - WebDAV 协议返回的磁盘容量显示在部分操作系统上可能与网盘实际配额不一致，请以 KodBox 网页端配额为准。

![dav-win1](../images/dav-win1.png){:width="500px"}

## 二、客户端挂载方式与 Windows 限制说明

### 方式一：Windows 原生「添加网络位置」

1. 打开「此电脑」，右键空白处选择 **添加一个网络位置**。

![dav-net](../images/dav-net.png){:width="300px"}

2. 在 **指定网站的位置** 中填入从账号中心获取的 WebDAV 地址（如 `https://cloud.example.com/index.php/dav/`），输入网盘用户名和密码登录。

![dav-location](../images/dav-location.png){:width="500px"}

3. 为该网络位置命名并完成向导。

![dav-name](../images/dav-name.png){:width="500px"}

![dav-win](../images/dav-win.png){:width="500px"}

> **Windows 原生 WebClient 的三项已知限制**
>
> 1. **默认禁止非 HTTPS（HTTP）基础认证**：在纯内网 HTTP 下连接失败时，需在 **账号中心 → WebDAV 挂载 → 如何使用** 下载注册表修复脚本（将 `BasicAuthLevel` 设为 `2`）以管理员身份运行并重启 `WebClient` 服务。
> 2. **非 80/443 端口极易连接失败**：若运营商封锁 80/443 而改用 `4433`、`8443` 等非标准端口，Windows 原生 WebClient 经常无法识别或断开，请务必使用有效 HTTPS 证书，或直接改用 **RaiDrive**。
> 3. **单文件 50 MB 默认体积上限**：Windows 注册表 `FileSizeLimitInBytes` 默认限制 WebDAV 下载单文件约 50 MB，大文件读写建议改用 RaiDrive 或官方 PC 客户端。

### 方式二：使用 RaiDrive 挂载（Windows 推荐，支持非标端口）

RaiDrive 对非标准端口、大文件传输与断点续传的稳定性远高于 Windows 自带 WebClient：

1. 下载并安装 [RaiDrive](https://www.raidrive.com/)。
2. 点击 `+` 新增驱动器，选择 **NAS → WebDAV**。
3. 将域名与端口（如 `cloud.example.com` 和 `4433`）与路径（如 `/index.php/dav/`）分开填写；若使用 HTTP 非加密端口请取消勾选地址栏的 SSL 锁图标。
4. 填写网盘账号密码后点击连接。

![raidrive](../images/raidrive.png){:width="600px"}

![raidrive2](../images/raidrive2.png){:width="600px"}

![raidrive3](../images/raidrive3.png){:width="500px"}

> **v1.70 兼容性修复提醒**
>
> KodBox **v1.70+** 已重点修复两类高频 WebDAV 兼容问题：一是**深层嵌套子目录遍历异常**，二是使用 **RaiDrive 挂载后通过 WPS 直接编辑保存导致原文件被清空** 的问题。仍停留在旧版本的站点强烈建议升级至 `v1.70.03+`。

## 三、Nginx 反向代理与多级目录 `401` 鉴权排查

### 1. Nginx 反向代理放行 WebDAV 方法

如果 KodBox 前方存在 Nginx 反向代理，需确认未拦截 `PROPFIND`、`PROPPATCH`、`MKCOL`、`COPY`、`MOVE`、`LOCK`、`UNLOCK` 等 WebDAV 扩展方法，并透传 `Authorization` 与 `Destination` 请求头：

```nginx
location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    # 保留 WebDAV 认证头与移动/复制目标头
    proxy_set_header Authorization $http_authorization;
    proxy_pass_header Authorization;
    client_max_body_size 0;
    proxy_request_buffering off;
}
```

### 2. 多级目录浏览偶发 `401 Unauthorized` 排查

当根目录能正常打开，但进入二级、三级子目录时偶发 `401` 鉴权失败，请依次检查：

1. **检查 PHP-FPM / CGI 模式下 `Authorization` 头丢失**：Apache 或部分 Nginx FastCGI 配置默认不传递 HTTP Basic 认证头，需确保 PHP 能读到 `HTTP_AUTHORIZATION`。
2. **确认 `Host` 头保留端口号**：非 80/443 端口反代漏写 `Host $http_host` 会导致部分 WebDAV 客户端在跳转子目录时丢弃凭据域而触发 `401`。
3. **升级至 v1.70+**：修复旧版 WebDAV 驱动在深层路径与特殊字符目录名下的遍历与鉴权问题。

## 四、KodBox 挂载外部 WebDAV 存储（已知边界）

在 **后台管理 → 存储/文件 → 存储管理 → 新增 → WebDAV** 中，可将外部 NAS 或第三方网盘的 WebDAV 服务挂载到 KodBox。使用前请提前知悉以下已知边界：

- **视频与大图缩略图受限**：外部 WebDAV / FTP 挂载不支持直接本地磁盘扫描，生成大视频封面或批量缩略图时会消耗双倍中转流量，且受限于远端响应速度容易超时失败。
- **第三方个人网盘（如 123 云盘 WebDAV）的速率与分片限制**：第三方网盘的 WebDAV 网关通常对并发请求、单秒 QPS 和分片上传合并存在严格限制，批量上传或大文件写入时可能出现**速率瓶颈**或**上传校验合并失败**。此类挂载更适合轻度读取与按需中转，不建议设为系统「默认存储」。

## 五、验证配置是否生效（Success Check）

1. 使用 RaiDrive 或 macOS 访达成功连接 `https://域名/index.php/dav/`，进入三级以上子目录均无 `401` 报错。
2. 在挂载磁盘中新建一个 `.docx` / `.txt` 文档，写入内容后保存并重新打开，确认文件内容非空且同步出现在 KodBox 网页端。

</div>
