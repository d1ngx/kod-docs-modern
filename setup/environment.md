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
- PHP运行环境: 7.0+ / **8.0+** (推荐)

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
