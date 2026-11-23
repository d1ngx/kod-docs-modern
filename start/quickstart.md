---
title: "5 分钟快速上手体验（Docker Compose）"
type: tutorial
edition: ["开源版", "企业版"]
minVersion: "1.70"
keywords: ["快速上手", "quickstart", "Docker Compose", "体验", "首次部署", "kodbox"]
description: "沿着唯一推荐的 Docker Compose 路径，5 分钟内启动包含 MariaDB 与 Redis 的 KodBox 实例，并完成首次登录与文件在线预览。"
---

本教程只保留一条官方推荐路径：通过 **Docker Compose** 一键拉起 `KodBox + MariaDB + Redis` 生产级组合，帮助你用 5 分钟跑通云桌面与首次文件在线预览，无需纠结复杂的传统环境或存储选项。

> **准备用于正式生产环境？**
>
> 完成本页体验后，请继续阅读 [1. 规划部署](/setup/planning/)、[HTTPS 反向代理与非标准端口](/setup/reverse-proxy/) 与 [数据备份与迁移 SOP](/operations/backup-migration/)，补齐 HTTPS 证书、宿主机权限与备份策略。

## 前置准备

- 一台已安装 Docker 与 `docker compose` 插件的 Linux 主机（建议内存 ≥ 2 GB，可用磁盘 ≥ 10 GB）。
- 若尚未安装 Docker，可执行：

```bash
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
systemctl enable --now docker
```

## 第 1 步：创建项目目录与数据库密码文件

新建独立目录 `/opt/kodbox`，并在 `db.env` 中设置你的强密码（请将示例密码替换为随机字符串）：

```bash
mkdir -p /opt/kodbox && cd /opt/kodbox
cat > db.env <<'EOF'
MYSQL_ROOT_PASSWORD=ChangeMe_Root_2026!
MYSQL_DATABASE=kodbox
MYSQL_USER=kodbox
MYSQL_PASSWORD=ChangeMe_KodBox_2026!
EOF
```

## 第 2 步：编写 compose.yml 并启动服务

在 `/opt/kodbox/compose.yml` 中写入以下配置（使用官方镜像与推荐的 `READ-COMMITTED` 事务隔离级别，避免高并发锁表）：

```yaml
services:
  db:
    image: mariadb:lts
    command: --transaction-isolation=READ-COMMITTED
    restart: unless-stopped
    volumes:
      - ./db:/var/lib/mysql
    environment:
      MARIADB_AUTO_UPGRADE: "1"
      MARIADB_DISABLE_UPGRADE_BACKUP: "1"
    env_file:
      - db.env

  redis:
    image: redis:alpine
    restart: unless-stopped

  app:
    image: kodcloud/kodbox:latest
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      - ./site:/var/www/html
    environment:
      MYSQL_HOST: db
      REDIS_HOST: redis
    env_file:
      - db.env
    depends_on:
      - db
      - redis
```

> **提示**
>
> 若国内拉取 Docker Hub 较慢，可将上述三个镜像前缀替换为阿里云镜像：`registry.cn-hangzhou.aliyuncs.com/kodcloud/kodbox`、`registry.cn-hangzhou.aliyuncs.com/kodcloud/mariadb:lts` 与 `registry.cn-hangzhou.aliyuncs.com/kodcloud/redis:alpine`。需要锁定最新修复版 PHP 8.5.12 环境时，可使用 `kodcloud/kodbox:1.70.03`。

启动容器并查看状态：

```bash
docker compose up -d
docker compose ps
```

当 `app`、`db`、`redis` 三个服务状态均显示 `Up`（运行中）时，服务已启动完毕。

## 第 3 步：完成浏览器初始化向导

1. 在浏览器中打开 `http://<你的服务器IP>:8080/`。
2. **环境检测**：确认所有必需扩展均为绿色通过，点击下一步。
3. **数据库与缓存配置**：由于 `compose.yml` 已自动注入环境变量，页面会自动填充 MariaDB 与 Redis 连接参数；若需手动核对，请确保数据库类型为 **MySQL / MariaDB**（切勿在高并发场景下退回 SQLite）、主机为 `db`、缓存类型为 **Redis**（主机为 `redis`）。
4. **设置管理员账号**：设置超级管理员账号与强密码，点击完成即可进入 KodBox 云桌面。

## 验证体验是否成功（Success Check）

完成以下三项操作，确认你的 KodBox 已正常工作：

- **文件上传与预览**：在个人空间拖拽上传一张图片或 PDF 文件，双击能够正常预览，且无权限报错。
- **持久化验证**：检查宿主机 `/opt/kodbox/site/data/files/` 目录已生成数据文件，且 `/opt/kodbox/db/` 目录非空。
- **后台自检**：点击右上角头像进入 **后台管理 → 概览**，确认系统运行状态正常、数据库与 Redis 缓存均为已连接状态。

## 接下来做什么

1. **上线配置 HTTPS 与域名**：参考 [HTTPS 反向代理与非标准端口配置](/setup/reverse-proxy/)。
2. **部署在线 Office 编辑**：参考 [OnlyOffice 组件部署与集成](/setup/office/)。
3. **理解存储与去重原理**：阅读 [虚拟文件系统与存储托管原理](/concepts/storage-architecture/)，在正式导入海量数据前规划好存储策略。
4. **分发给团队同事**：将 [终端用户快速入门](/user/quickstart/) 发给普通员工，无需让他们看部署手册。
