---
title: "插件机制与多端同步架构"
type: explanation
edition: ["开源版", "企业版"]
minVersion: "1.70"
keywords: ["插件机制", "多端同步", "WebDAV", "客户端", "Samba"]
description: "解析 KodBox 插件扩展体系、WebDAV 服务端与外部挂载的双向区分，以及网页端、PC/移动端与第三方同步生态的选型定位。"
---

KodBox 的核心主程序保持轻量，将在线办公（OnlyOffice）、协议网关（WebDAV / Samba）、企业认证（AD/LDAP/企微/钉钉）与 AI 助手全部以**插件化**形态解耦。同时，面向桌面与移动设备提供多种访问与同步协议，理解各自边界能帮你为团队选出最稳定的多端工作流。

## 一、插件体系的四大类别

进入 **后台管理 → 插件中心**，KodBox 插件主要分为四类：

1. **文件预览与编辑插件**：如 `onlyoffice`、`officeLive`、`pdfjs`、`yzOffice`。它们按文件扩展名与优先级钩子接管打开动作。
2. **协议与外部存储插件**：如 `webdav`（对外提供 WebDAV 服务）、`samba`（v1.70 起已将全局回收站重构为共享目录内独立 `.recycle`）。
3. **企业认证与集成插件**：如 AD/LDAP 域认证、钉钉、企业微信、飞书同步与文档审批。
4. **智能检索与 AI 增强插件**：如传统数据库全文检索插件（`docsearch`）与 v1.69–v1.70 升级的多模态 AI 助手与 `aiRag` 语义检索（`aidoc`）。

## 二、WebDAV 的两个方向：务必先分清

社区提问中最容易混淆的概念是「挂载 WebDAV」。在 KodBox 中它存在**完全相反的两个方向**：

| 方向 | 配置入口 | 数据流向 | 典型用途 |
| --- | --- | --- | --- |
| **KodBox 作为 WebDAV 服务端被挂载** | 插件中心启用 **WebDAV 插件** → 账号中心获取 `/index.php/dav/` 地址 | Windows 资源管理器 / macOS 访达 / RaiDrive / 手机 App → 访问 KodBox | 把 KodBox 网盘映射为电脑本地磁盘，或供第三方笔记/播放器读写 |
| **KodBox 挂载外部 WebDAV 存储** | 后台管理 → **存储管理 → 新增 → WebDAV** | KodBox → 读取外部 NAS / 第三方网盘（如 123 云盘） | 将外部已有 WebDAV 空间聚合进 KodBox 统一浏览与中转 |

两个方向的排错路径与限制完全不同，详细实战配置请参见 [WebDAV 服务端与外部挂载指南](/admin/webdav/)。

## 三、多端客户端与同步方案如何选型

| 方案 | 同步模式 | 适用人群与场景 | 已知边界 |
| --- | --- | --- | --- |
| **Web 网页端** | 实时在线（零本地占用） | 全部用户；日常协作、在线编辑、AI 对话、管理后台 | 依赖浏览器网络 |
| **官方 PC 客户端** | 在线虚拟盘（自动挂载 WebDAV）+ 指定目录同步 + 本地程序打开 | Windows / macOS 办公用户；需要用本地 Photoshop/CAD/Office 直接编辑并回写 | 非标端口反代须保证完整证书链与 `$http_host` 透传 |
| **官方移动 App（iOS / Android）** | 按需浏览 + 手机相册自动备份 | 移动办公、外勤查阅与个人相册备份 | 同样受非标端口与证书链影响 |
| **WebDAV + RaiDrive** | 在线映射磁盘（不占本地空间） | Windows 非 80/443 端口、需要比系统自带 WebClient 更稳定挂载体验的用户 | v1.70 已修复 RaiDrive + WPS 编辑清空文件等兼容问题 |

## 相关实战

- WebDAV 服务端与外部挂载：[WebDAV 插件连接与使用](/admin/webdav/)
- 官方 PC 客户端与同步：[PC 客户端安装与文件同步](/user/PC/6.1/)
- [Windows 客户端白屏或闪退](/user/PC/windows-troubleshooting/)
- [可道云开发文档](https://doc.kodcloud.com/v2/)
