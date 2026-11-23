---
title: "安装部署总览"
type: how-to
edition: ["开源版", "企业版", "teamOS"]
keywords: ["安装部署", "私有化部署", "Docker", "TeamOS", "NAS", "规划部署", "宝塔"]
redirect_from:
  - /setup/docker_win/
  - /setup/bt_win/
  - /setup/xampp/
  - /setup/thumbnail/
  - /setup/psd_win/
description: "可道云 KodBox 私有化部署总览：按「1. 规划部署 → 2. 选择部署方式 → 3. 上线必做」三步完成生产级搭建。"
---

本栏目面向负责安装、迁移与维护可道云服务器的 **IT 运维人员、NAS 玩家与系统管理员**。普通终端用户无需部署，请直接查阅 [终端用户快速入门](/user/quickstart/)。

> **重要提醒：请勿与 KodExplorer 混淆**
>
> 本手册面向新一代企业级网盘 **KodBox**（数据库 + 多云存储架构）。如果你寻找的是旧版零数据库单机文件管理器，请访问 [KodExplorer 仓库](https://gitee.com/kalcaddle/KODExplorer)。

## 三步部署路径（推荐）

生产环境优先使用 Linux 上的 Docker Compose，也可根据现有设备选择 NAS 或 teamOS。

1. **第一步：规划部署** — 先阅读 [规划部署](/setup/planning/)，确定部署形态（Docker / teamOS / 传统 LNMP）、数据库选型（避免 SQLite 高并发锁库）与硬件资源预算。
2. **第二步：部署到服务器** — 优先使用容器部署，或在传统环境/NAS 上按对应指南落地主程序。
3. **第三步：上线必做** — 配置 [HTTPS 反向代理与非标准端口](/setup/reverse-proxy/)、核对 [Docker 与 NAS 宿主机权限](/setup/nas-permissions/)、按需接入 [OnlyOffice 在线编辑](/setup/office/)，并制定 [备份与容灾 SOP](/operations/backup-migration/)。

## 按部署形态选择指南

为避免新老部署指令互相干扰，本文档将**容器优先路径**与**传统环境/一体化系统**清晰分离：

### 方式一：容器部署（通用首选）

| 场景 | 适用文档 | 说明 |
| --- | --- | --- |
| Linux 标准生产环境 | [Docker Compose 部署示例](/setup/docker/) | 官方推荐，预装 PHP 8.5.12（v1.70.03+）、Nginx 与常用扩展 |
| 群晖 / 铁威马 / Unraid 等 NAS | [Docker 与 NAS 宿主机权限指南](/setup/nas-permissions/) · [群晖 Docker 安装](/setup/dsm7_docker/) | 重点解决 PUID/PGID 映射与目录属主权限 |
| 无公网内网环境 | [Docker 离线部署](/setup/dockerOffline/) | 镜像打包导入与离线编排 |

### 方式二：teamOS 软硬一体系统（专机推荐）

适合将闲置物理服务器、工控机或独立虚拟机专用于企业网盘，开箱自带磁盘 RAID、网络配置与可道云运行环境：

- [teamOS 概览](/setup/2.0/) → [制作 U 盘启动盘](/setup/rufus/) → [系统安装](/setup/teamos/) → [初始配置](/setup/teamos2/)

### 方式三：传统 LNMP / 面板部署（已有 Web 服务器）

| 平台与方式 | 适用文档 | 说明 |
| --- | --- | --- |
| 环境依赖总览 | [Linux 依赖环境说明](/setup/environment/) | PHP 8.3/8.4/8.5 分支建议、必装扩展与 MySQL 要求 |
| 宝塔面板 | [Linux 宝塔面板](/setup/bt/) | 图形化环境部署 |
| 指定 Linux 发行版 | [Ubuntu 22.04](/setup/ubuntu/) · [OpenEuler](/setup/openeuler/) · [Anolis OS](/setup/anolis/) · [Kylin V10](/setup/kylin/) · [Loongnix](/setup/loongnix/) · [CentOS 7.9](/setup/centos/) | 含国产信创与龙芯架构示例 |

## 更多 NAS 与虚拟化平台入口

可道云亦可运行在各类商用与开源 NAS 平台上（第三方平台教程请以对应平台最新系统版本为准）：

| 平台 | 安装参考 |
| --- | --- |
| 群晖 Synology | [DSM 7 套件安装](/setup/dsm7/) · [群晖 Docker 安装](/setup/dsm7_docker/) · [NAS 权限排错](/setup/nas-permissions/) |
| 爱快 iKuai | [iKuai 虚拟机/容器部署](/setup/ikuai/) |
| 铁威马 / Unraid | 优先采用通用 Docker Compose，并按 [Docker 与 NAS 宿主机权限指南](/setup/nas-permissions/) 配置 `PUID`/`PGID` |
| 威联通 QNAP | [QNAP 社区教程](https://post.smzdm.com/p/ar0vpp8z/) |
| TrueNAS | [TrueNAS 社区参考](https://www.truenasscale.com/2021/12/18/303.html/) |
