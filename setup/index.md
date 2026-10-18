---
title: "概览"
keywords: 功能特性, 快捷键
description: 可道云企业网盘私有化部署概览，包含安装步骤、环境要求与多平台入口
---

<div id="setup" class="tab-pane fade in active" markdown="1">

## 1 手册适用

### 1.1 适用对象

- 本手册面向有一定服务器部署经验的 **IT 人员**。
- 若您是初次接触，建议优先阅读 [TeamOS 一键安装](/setup/2.0/) 或 [Docker](/setup/docker/)、[宝塔面板](/setup/bt/) 等入门方式。
- 普通用户如需使用网盘，请联系管理员获取账号，无需自行部署。

### 1.2 版本及更新

| 手册版本 | 适用系统版本 | 更新日期 | 更新内容
| --- | --- |--- |--- |
| v1.34 | Kodbox v1.09 + |2022年09月 | 优化部分内容 |

> 提醒
>
> 可道云旗下有KODBOX和KODExplorer两款产品，本手册更偏向于KODBOX系统的安装部署。点击获取更多KODExplorer信息：
> [**KODExplorer**](https://gitee.com/kalcaddle/KODExplorer){:.newissue.button.btn-primary btn-sm }
{: .important}

## 2 部署速览

要让可道云企业网盘完整可用，通常需要完成以下三部分：

1. 可道云主程序的安装
2. 可选功能组件的安装（文件预览与在线编辑）
3. 管理后台的基础配置

### 2.1 可道云主程序的安装

可道云支持解压安装包后通过浏览器完成部署。Web 服务、PHP 和数据库版本要求以所部署安装包的环境检测结果为准。简要步骤：

1. 搭建 PHP 运行环境（Web 服务器 + PHP + 数据库）
2. 下载最新可道云安装包
3. 将安装包解压到目标目录
4. 为安装目录设置可读写权限（否则无法上传、保存文件）
5. 在浏览器中打开安装向导，按提示配置数据库
6. 完成初始化，使用管理员账号登录

### 2.2 可选功能组件的安装

这些组件用于在浏览器中**预览或编辑** Office、PSD 等文件，可按需安装：

- **OnlyOffice**：Office 文件（Word、Excel、PPT）在线编辑
- **PSD/AI 预览组件**：设计图文件在线预览

### 2.3 管理后台的基础配置

主程序安装完成后，管理员可在后台进行以下设置：

- 导入用户与部门
- 系统参数优化
- 存储空间与权限配置
- 插件配置（如 AD 域、历史版本、水印等）

## 3 私有化部署

根据运行环境选择安装方式：

| 平台 | 部署方式 | 说明 |
| --- | --- | --- |
| Windows | [Docker Desktop 部署](/setup/docker_win/) | 通过图形化工具管理容器 |
| Linux | [运行环境说明](/setup/environment/) · [Docker 部署](/setup/docker/) | 按实际服务器环境选择部署方式 |

## 4 更多平台体验

可道云也可部署在 NAS 等设备上。以下保留平台安装入口；第三方教程的版本与设备要求请以其原文为准。

| 平台 | 安装参考 |
| --- | --- |
| 群晖 | [群晖 DSM 7 安装](/setup/dsm7/) |
| 爱快 | [iKuai 部署](/setup/ikuai/) |
| 威联通 | [QNAP 社区教程](https://post.smzdm.com/p/ar0vpp8z/) |
| 华芸 | [平台部署参考](https://zhuanlan.zhihu.com/p/346247009) |
| 铁威马 | [平台部署参考](https://zhuanlan.zhihu.com/p/346247009) |
| FreeNAS | [社区安装教程](https://www.truenasscale.com/2021/12/18/303.html/) |
| OpenMediaVault | [视频教程](https://www.bilibili.com/video/av714546349) |
| Unraid | [社区安装说明](https://forums.unraid.net/topic/145072-unraid/) |
