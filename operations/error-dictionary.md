---
title: "告警与报错字典（按报错原文索引）"
type: reference
edition: ["开源版", "企业版", "teamOS"]
minVersion: "1.70"
keywords: ["database is locked", "该文档不存在！", "文档安全令牌的格式不正确", "This XML file does not appear to have any style information", "401", "413", "502", "504", "Access denied", "CORS", "白屏", "闪退", "报错字典", "故障排查"]
description: "按界面与日志报错原文精确索引的 KodBox 排错字典：复制报错字符串即可直达根因与修复命令。"
---

本字典按用户在实际界面、浏览器控制台或容器日志中看到的**原始报错字符串**编排。直接按 `Ctrl+K` 搜索报错原文，即可直达根因与可执行修复方案。

---

## `database is locked`（数据库被锁定） {: #database-is-locked}

- **常见触发场景**：个人或 NAS 用户在默认 **SQLite** 环境下，批量并发上传多文件目录、开启相册自动备份，或同时运行缩略图/定时任务时报错上传中断或页面卡死。
- **根因**：SQLite 采用单文件库级写锁，无法承受 KodBox 多请求并发写入元数据。
- **修复方案**：
  1. **长期根治（强烈推荐）**：按 [1. 规划部署](/setup/planning/) 与 [Docker Compose 部署示例](/setup/docker/) 将数据库切换为 **MySQL / MariaDB（开启 `--transaction-isolation=READ-COMMITTED`）** 并启用 **Redis** 缓存。
  2. **临时缓解**：在「后台管理 → 上传设置」中调低客户端上传并发数，避免同时执行批量扫描任务。

---

## `该文档不存在！`（Docker 本地挂载目录单文件外链下载失败）

- **常见触发场景**：Docker 部署并在后台挂载了宿主机本地目录，网盘内部预览正常，但分享单个文件外链点击下载时提示 **`该文档不存在！`**。
- **根因**：宿主机 Nginx 误配了内部静态直出/别名转发（宿主机找不到容器内路径）、挂载路径填写成宿主机路径而非容器内路径、或容器内 `nginx` 用户对挂载目录/软链接无读权限。
- **修复方案**：
  1. 确认存储管理填写的是**容器内挂载点**（如 `/mnt/nas-share`）而非宿主机路径。
  2. 宿主机反代仅使用 `proxy_pass`，移除指向容器路径的 `X-Accel-Redirect` / `alias`。
  3. 完整排查步骤见：[排查本地挂载目录外链下载「该文档不存在！」](/setup/nas-permissions/#3-排查-docker-本地挂载目录单文件外链下载返回该文档不存在)。

---

## `文档安全令牌的格式不正确`（OnlyOffice 打开或保存失败）

- **常见触发场景**：数据迁移、重建 OnlyOffice 容器或重新安装 OnlyOffice 插件后，打开 Word/Excel/PPT 弹出 **`文档安全令牌的格式不正确`**。
- **根因**：KodBox OnlyOffice 插件中保存的 JWT 开关状态或密钥，与 OnlyOffice 容器环境变量 `JWT_ENABLED` / `JWT_SECRET` 不一致。
- **修复方案**：
  1. 执行 `docker exec kodoffice env | grep JWT` 核对容器实际生效的密钥。
  2. 进入 **后台管理 → 插件中心 → onlyoffice**，确认 JWT 开关与密钥和容器完全一致并保存。
  3. 若改过 `compose.yml` 中的 `JWT_SECRET`，执行 `docker compose up -d --force-recreate` 重建容器，清浏览器缓存后重试。详见 [OnlyOffice 集成与排错](/setup/office/#提示文档安全令牌的格式不正确)。

---

## OnlyOffice 插件检测失败（同机回环 / HTTPS 混合内容）

- **常见触发场景**：浏览器打开 OnlyOffice 地址正常，但插件自检最后一步（`kod服务器请求office` 或 `office服务器请求kod`）失败；或开启 HTTPS 后编辑页白屏。
- **根因**：
  1. KodBox 启用了 HTTPS 而 OnlyOffice 仍使用 HTTP（浏览器拦截混合内容）。
  2. 同物理机部署时，路由器/安全组不支持 NAT 回环，导致容器无法通过公网 IP 访问同机服务。
- **修复方案**：
  1. 按 [OnlyOffice HTTPS 二级目录反代](/setup/office/#office-subpath) 为 OnlyOffice 配置同级 HTTPS。
  2. 在两个容器的 `compose.yml` 中配置 `extra_hosts` 将域名指向内网 IP，或利用 v1.70+ 插件的**内网优先地址保留**特性（见 [内网回环优化](/setup/office/#42-同物理机部署回环失败与内网优先地址保留)）。

---

## `This XML file does not appear to have any style information`（浏览器访问 WebDAV）

- **常见触发场景**：在 Chrome/Edge 浏览器地址栏直接打开 `https://域名/index.php/dav/`，页面显示 **`This XML file does not appear to have any style information associated with it. The document tree is shown below.`**。
- **根因**：**这不是故障！** WebDAV 协议返回的是标准 XML 目录报文，浏览器仅提示该 XML 无样式表，恰恰说明服务端 WebDAV 接口工作正常。
- **正确用法**：将该地址粘贴到 Windows「添加网络位置」、macOS 访达或 **RaiDrive** 中挂载使用（详见 [WebDAV 实战指南](/admin/webdav/)）。

---

## WebDAV 多级目录 `401 Unauthorized` 或非标端口无法连接

- **常见触发场景**：Windows 原生挂载在非 80/443 端口连接失败；或根目录能打开但点进深层子目录偶发 `401` 鉴权失败。
- **根因**：Windows WebClient 对 HTTP 与非标端口支持极差；或 Nginx 反代未透传 `Authorization` 头与带端口的 `Host $http_host`；或旧版 KodBox 存在深层目录遍历 Bug。
- **修复方案**：
  1. Nginx 反代务必配置 `proxy_set_header Host $http_host;` 与 `proxy_set_header Authorization $http_authorization;`。
  2. Windows 非标端口强烈建议改用 **RaiDrive**。
  3. 升级 KodBox 至 **v1.70+**（已同步修复深层目录遍历与 RaiDrive + WPS 编辑清空文件问题）。详见 [WebDAV 排查](/admin/webdav/#三nginx-反向代理与多级目录-401-鉴权排查)。

---

## `Access denied for user`（迁移后数据库密码正确却报鉴权失败）

- **常见触发场景**：跨服务器或从宝塔迁移到 Docker 后，确认密码无误但站点报错数据库连接鉴权失败。
- **根因**：MySQL 账号的授权主机（Host）仍限制为 `localhost`，而 Docker 容器间连接来源为容器内网网段（如 `172.18.0.x`）。
- **修复方案**：在目标 MySQL 中为对应容器网段（或内网隔离环境下的 `'%'`）重新授权并执行 `FLUSH PRIVILEGES;`，核对 `config/setting_user.php` 中的主机名为 `db`（详见 [备份与迁移恢复三项必检](/operations/backup-migration/#恢复验收三项必检动作success-check)）。

---

## `413 Request Entity Too Large` 或大文件（≥ 1 GB）上传中断 / `504 Gateway Timeout`

- **常见触发场景**：上传几百 MB 或 1 GB 以上单个大文件时进度条报错 `413`、超时 `504` 或合并失败。
- **根因**：反向代理 `client_max_body_size`、读写超时、PHP-FPM `upload_max_filesize` / `post_max_size` / `max_execution_time` 或分片上传配置存在短板。
- **修复方案**：逐层对照 [大文件上传全链路参数核对表](/reference/performance-tuning/#一大文件上传全链路参数核对表)，并在反代层设置 `client_max_body_size 0;` 与 `proxy_request_buffering off;`。

---

## 对象存储直传 `CORS policy` / `Access-Control-Allow-Origin` 或分片合并失败

- **常见触发场景**：对接阿里云 OSS、腾讯云 COS、Cloudflare R2、移动云等 S3 兼容存储后，浏览器直传卡住或控制台报跨域拦截、分片合并失败。
- **根因**：Bucket 未配置 CORS 策略，或漏填 `PUT` 方法及 `ExposeHeaders: ["ETag"]`。
- **修复方案**：直接复制 [多云对象存储 CORS 模板](/admin/storage-s3/#一通用-cors-跨域配置模板解决-90-的直传报错) 写入目标 Bucket 的 CORS 设置。

---

## 非标端口反代后，浏览器能打开但 PC 客户端 / 手机 APP 无法登录

- **常见触发场景**：运营商封锁 80/443 后改用 `4433`、`8443` 等端口，网页端一切正常，但 PC 客户端或手机 APP 登录超时、跳转错误端口或证书报错。
- **根因**：Nginx 反代误用 `proxy_set_header Host $host;` 丢弃了非标端口号，或 SSL 证书缺少中间证书链（未使用 `fullchain.pem`）。
- **修复方案**：改为 `proxy_set_header Host $http_host;` 并补全完整证书链，详见 [非标准端口反代排查](/setup/reverse-proxy/#non-standard-port)。

---

## Windows 11 PC 客户端首次打开白屏或闪退

- **常见触发场景**：Windows 11 安装 KodBox PC 客户端后，双击启动出现纯白窗口、一直转圈或直接闪退。
- **根因**：旧版缓存目录损坏、后台残留僵尸进程，或杀毒软件/Windows Defender 拦截客户端内嵌组件。
- **修复方案**：
  1. 打开任务管理器，彻底结束所有 `kodcloud` / 可道云相关后台进程。
  2. 按 `Win + R` 输入 `%APPDATA%`，若有 `kodcloud` 文件夹，将它重命名为 `kodcloud.bak`。
  3. 检查安全软件是否拦截了客户端。详见 [Windows 客户端白屏或闪退](/user/PC/windows-troubleshooting/)。

## 没找到你的报错？

请前往 [分层排错手册](/operations/troubleshooting/) 按三层日志定位原始错误栈，或在文档仓库提交反馈帮助我们将其补充进本字典。
