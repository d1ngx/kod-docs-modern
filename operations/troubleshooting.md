---
title: "分层排错手册（日志路径与排查清单）"
type: how-to
edition: ["开源版", "企业版", "teamOS"]
minVersion: "1.70"
keywords: ["排错手册", "日志路径", "Nginx 日志", "PHP 日志", "Docker 日志", "故障排查", "安全检查清单"]
description: "借鉴生产级分层运维方法：先通过 Web/PHP/应用三层日志精准拿到报错原文，再按安全检查清单与六大场景定位根因。"
---

遇到未知异常或 500/502 页面时，盲目重启或反复重装往往会掩盖现场。请先通过**三层日志定位路径**拿到确切错误原文，再对照 [告警与报错字典](/operations/error-dictionary/) 精准修复。

## 一、三层日志定位路径

排查任何服务端异常时，按「请求从外到内」的三层顺序依次查看日志：

### 第 1 层：Web 服务器 / 反向代理日志（排查 403 / 404 / 413 / 502 / 504 / WebDAV 拦截）

- **宿主机 Nginx（Linux）**：
  ```bash
  tail -n 100 /var/log/nginx/error.log
  tail -n 100 /var/log/nginx/access.log
  ```
- **宝塔面板**：`/www/wwwlogs/<你的站点域名>.error.log`
- **Nginx Proxy Manager**：查看 NPM 容器 `/data/logs/` 下的对应 `proxy-host-*_error.log`。

### 第 2 层：PHP-FPM 与容器运行日志（排查 500 空白页、内存溢出、超时、扩展缺失）

- **Docker 部署**：
  ```bash
  docker compose logs --tail=200 app
  docker compose logs --tail=100 db
  docker compose logs --tail=100 redis
  ```
- **传统 Linux PHP-FPM**：常见位于 `/var/log/php-fpm/www-error.log` 或 `/var/log/php8.4-fpm.log`。

### 第 3 层：KodBox 应用内部日志（排查插件回调、权限拒绝、存储驱动与计划任务）

- **磁盘应用日志目录**：站点根目录下 `data/temp/log/`（按日期目录归档，例如 `data/temp/log/error/`、`data/temp/log/task/`）。
- **管理后台界面查看**：登录超级管理员 → **后台管理 → 日志审计（操作日志 / 登录日志）** 及 **计划任务执行记录**。

## 二、高危运维操作前的安全检查清单

在执行数据目录迁移、权限修改、升级或磁盘扩容前，请逐项核对：

- **先停写再动数据**：迁移或备份物理文件前，务必暂停应用写入与计划任务（Cron），确保数据库与 `data/files` 状态一致。
- **保留隐藏文件与配置**：跨机拷贝站点目录时，确保隐藏文件（如 `.htaccess`）与 `config/setting_user.php` 完整保留。
- **先核对属主再上线**：Docker / Linux 迁移后核验容器内 `/var/www/html` 属主为 `nginx:nginx`（或 NAS 对应 `PUID:PGID`）。
- **切勿在宿主机直接改托管文件**：不要手工增删改默认存储的 `data/files/` 内容。
- **核对磁盘剩余空间**：执行 `df -h` 与 `df -i`（同时检查 inode 是否耗尽），确保数据盘与系统盘均有充足余量。

## 三、六大高频故障快速分流路径

| 故障现象 | 优先检查层 | 直达专题文档 |
| --- | --- | --- |
| 上传报错权限不足 / 无法保存配置 / 挂载目录外链报「该文档不存在！」 | 第 2/3 层 + 宿主机 `ls -ldn` | [Docker 与 NAS 宿主机权限指南](/setup/nas-permissions/) |
| 并发上传目录卡死 / `database is locked` | 第 2/3 层日志 | [1. 规划部署（SQLite 警示）](/setup/planning/) |
| 网页正常但 PC 客户端/APP 登录失败 / 日志 IP 全是网关 IP | 第 1 层 Nginx 反代头与证书链 | [HTTPS 反向代理与非标准端口](/setup/reverse-proxy/) |
| OnlyOffice 白屏 / 令牌错误 / 检测最后一步失败 | 第 1 层 + `docker logs kodoffice` | [OnlyOffice 集成与排错](/setup/office/) |
| 对象存储上传报 CORS / 分片合并失败 / 删文件空间不降 | 浏览器 F12 Network + Bucket 策略 | [多云对象存储实战](/admin/storage-s3/) · [存储托管原理](/concepts/storage-architecture/) |
| WebDAV 连不上 / 多级目录 401 / WPS 保存清空 | 第 1 层反代方法放行 + 客户端日志 | [WebDAV 服务端与外部挂载指南](/admin/webdav/) |

## 相关延伸

- 按报错原文精确查询：[告警与报错字典](/operations/error-dictionary/)
- 大文件上传全链路参数核对：[大文件上传与性能调优参考](/reference/performance-tuning/)
