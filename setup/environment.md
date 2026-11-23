---
title: "可道云依赖环境说明"
keywords: kodbox, 环境, 依赖, PHP, nginx, mysql, redis
description: 安装可道云所需的 PHP、Nginx、MySQL 等软件版本与 PHP 扩展清单
---

<div id="environment" markdown="1">

## 概述

可道云 KodBox 是一款由 PHP 语言开发的 Web 应用，可在经典的 LNMP 架构（Linux + Nginx + MySQL/MariaDB + PHP）下部署。

本文档提供了使用[kodbox服务端安装包](https://kodcloud.com/download/)在带有 Nginx 和 MySQL 的 Ubuntu 22.04 LTS 服务器上安装可道云的完整教程。

本安装指南概述了所需的依赖项及其配置。有关特定Linux发行版的安装示例，请参考

- [Anolis OS 8.8 安装可道云示例](./anolis.md)
- [Loongnix-Server 8.4 安装可道云示例](./loongnix.md)
- [Kylin V10 安装可道云示例](./kylin.md)
- [OpenEuler 22.03 LTS 安装可道云示例](./openeuler.md)
- [Ubuntu 22.04 LTS 安装可道云示例](./ubuntu.md)
- [CentOS 7.9 安装可道云示例](./centos.md)

若希望更自动化的安装方式，可参考[使用宝塔面板搭建可道云网盘示例](./bt.md)。

### 软件环境要求

- 数据库：MySQL 5.7+ / **MySQL 8.0+** (推荐) / MariaDB 10.2+
- Web服务器软件: Apache2.4+ / **Nginx1.18+** (推荐)  + `php-fpm`
- PHP 运行环境：7.0 及以上可运行。新部署请使用仍在官方维护的分支，优先 **PHP 8.4**，其次 **PHP 8.3**。

### PHP 分支 {: #php-branches}

PHP 按主版本分支发布安全更新。补丁号会持续增加，下表为整理时的分支状态；最新版本以 [PHP 支持版本](https://www.php.net/supported-versions.php) 为准。

| 分支 | 最新版本 | 官方状态 | 建议 |
| --- | --- | --- | --- |
| PHP 8.5 | 8.5.12 | 最新稳定版 | 可以用于新装。上线前确认 `redis`、`imagick` 等扩展已有对应构建 |
| PHP 8.4 | 8.4.27 | 稳定维护 | 新部署优先选择 |
| PHP 8.3 | 8.3.36 | 安全维护 | 发行版尚未提供 8.4 时选用；已有环境可继续使用 |
| PHP 8.2 | 8.2.35 | 安全维护 | 已有环境可继续使用，并安装安全更新 |
| PHP 8.1 及以下 | — | 已停止官方支持 | 含 8.0 与 7.x。请升级到 8.2 及以上后再用于生产 |

建议：

- 新机器安装 **PHP 8.4**。软件源只有 8.3 时，安装 **PHP 8.3**。
- **PHP 8.5** 是当前最新稳定版。常用扩展齐全后再放到生产环境。
- 已经跑在 **PHP 8.2** 或 **8.3** 上的站点保持当前分支，跟进该分支的安全更新即可。
- **PHP 8.1、8.0 和 7.x** 已停止官方支持，不再获得安全补丁。Ubuntu 22.04 默认的 8.1、宝塔示例里的 8.0、CentOS 7 示例里的 7.4 都属于这一范围，只适合按原步骤对照，生产环境请换到 8.3 或 8.4。

### 依赖的 PHP 扩展

本节列出了所有必需和可选的 PHP 模块。有关模块的更多信息，请参阅 [PHP 手册](https://php.net/manual/en/extensions.php)。你的 Linux 发行版应该包含所有必需模块的软件包。可以通过键入 `php -m | grep -i <module_name>` 来检查模块的存在。如果有返回结果，则说明该模块存在。

必需扩展：

- php-curl
- php-dom
- php-gd
- php-json
- php-libxml
- php-mbstring
- php-openssl
- php-session
- php-xml
- php-zip
- php-zlib

数据库连接扩展 (基于数据库选择)

- pdo_sqlite (由于性能原因不建议使用)
- pdo_mysql (MySQL/MariaDB)
- mysqli (MySQL/MariaDB)

建议扩展：

- php-intl (解压缩和css文件解析用到，提高性能)
- php-exif (用于图片信息获取)

用于指定功能(可选)：

- php-ldap (LDAP插件对接)
- php-ftp (后台存储管理添加FTP)

用于提高服务器性能(可选，需运行对应服务)：

- php-memcached
- php-redis

</div>
