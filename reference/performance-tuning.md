---
title: "大文件上传与服务端调优"
type: reference
edition: ["开源版", "企业版", "teamOS"]
minVersion: "1.70"
keywords: ["大文件上传", "1GB", "413", "504", "分片上传", "ZIP 24GB", "PHP 调优", "Nginx 调优", "Redis"]
description: "核对上传限制、在线 ZIP 打包上限及 PHP、Nginx、Redis 参数。"
---

本参考页系统整合了原本分散在旧版 `doc.kodcloud.com/v2/#/help/options`中的全链路调优参数。遇到 **1 GB 以上大文件上传失败或上传合并超时** 时，请按层级逐项核对。

## 一、大文件上传全链路参数核对表

当单文件体积超过 1 GB（或处于弱网/代理环境）上传失败时，问题往往出在**反向代理 → PHP-FPM → KodBox 后台分片**三层链路中最短的那一块木板：

| 层级 | 关键配置项 | 推荐值 | 缺失或过小时的典型现象 |
| --- | --- | --- | --- |
| **1. 反向代理 / Nginx** | `client_max_body_size` | `0`（不限制）或 `30G` | 直接返回 `413 Request Entity Too Large` |
| **1. 反向代理 / Nginx** | `proxy_request_buffering` / `proxy_buffering` | `off` | 大文件先落反代临时盘，撑爆系统盘并拖慢合并 |
| **1. 反向代理 / Nginx** | `proxy_read_timeout` / `proxy_send_timeout` / `fastcgi_read_timeout` | `3600`（秒） | 大文件分片合并阶段触发 `504 Gateway Timeout` |
| **1. 云 WAF / CDN（如 Cloudflare）** | 单请求包体上限 | 务必确保 KodBox 分片大小**小于** CDN 上限（例如 Cloudflare 免费版为 100 MB，分片建议设 5–20 MB） | 走 CDN 时大文件进度条到固定百分比报错中断 |
| **2. PHP-FPM (`php.ini`)** | `upload_max_filesize` & `post_max_size` | `512M` 以上（至少显著大于单分片大小） | 单分片上传被 PHP 直接截断，提示参数为空或上传失败 |
| **2. PHP-FPM (`php.ini`)** | `max_execution_time` & `max_input_time` | `3600`（秒） | 大文件合并校验或批量压缩中断 |
| **2. PHP-FPM (`php.ini`)** | `memory_limit` | `512M`–`1024M` | 处理大表格、大图或海量目录列表时报内存溢出（OOM） |
| **2. PHP-FPM 进程池** | `pm.max_children` / `request_terminate_timeout` | 按内存估算并发（如 `30`–`100`）；超时 `3600` | 多人并发上传或缩略图渲染时出现 `502 Bad Gateway` |
| **3. KodBox 管理后台** | **基础设置 → 上传下载 → 分片大小** | 局域网 `10–50 MB`；公网/CDN `5–10 MB` | 分片过大在公网/CDN 易超时；过小会增加合并 I/O 开销 |
| **3. KodBox 管理后台** | **上传并发线程数** | 生产 MySQL `3–5`；机械盘 NAS 适当降至 `2–3` | 并发过高导致机械盘或旧数据库 I/O 阻塞 |

### 在线打包与压缩已知上限

- **文件夹在线 ZIP 压缩默认上限为 `24 GB`**：当用户选中超过 24 GB 的大目录在线打包下载时，会触发默认体积保护。超大数据集建议使用 **PC 客户端**、**WebDAV / RaiDrive** 或服务端直出方式传输，避免耗尽服务器临时磁盘空间。

## 二、数据库与 Redis 推荐调优参数

- **MySQL / MariaDB**：
  - 事务隔离级别必须设置为 `READ-COMMITTED`（Docker 启动参数 `--transaction-isolation=READ-COMMITTED`），大幅降低并发上传与目录移动时的间隙锁冲突。
  - `innodb_buffer_pool_size` 建议设为可用内存的 30%–50%（独立数据库机可设 60%）。
  - 详见 [MySQL 配置优化](/setup/mysql/)。
- **Redis**：
  - 强烈建议在所有生产环境中启用 Redis 替代本地文件缓存，配置合理的 `maxmemory` 与 `maxmemory-policy allkeys-lru`，避免缓存长期增长占满宿主机内存。
- **OPcache（传统 PHP-FPM）**：
  - 启用 `opcache.enable=1`，建议 `opcache.memory_consumption=256`、`opcache.interned_strings_buffer=32`、`opcache.max_accelerated_files=20000`。详见 [PHP 配置优化](/setup/php/)。

## 相关延伸

- Nginx 完整参考配置：[Nginx 配置优化](/setup/nginx/) · [HTTPS 反向代理模板](/setup/reverse-proxy/)
- PHP 与 MySQL 细项参考：[PHP 优化](/setup/php/) · [MySQL 优化](/setup/mysql/)
- 报错字典：[413 / 504 与大文件上传排错](/operations/error-dictionary/)
