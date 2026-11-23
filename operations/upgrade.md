---
title: "版本升级与变更注意"
type: how-to
edition: ["开源版", "企业版", "teamOS"]
minVersion: "1.70"
keywords: ["版本升级", "镜像升级", "PHP 8.5.12", "1.70.03", "破坏性变更", "废弃配置", "升级指南"]
description: "KodBox 容器与传统环境标准化升级流程，汇总 v1.69–v1.70.03 核心行为变更、底层安全修复与废弃配置项。"
---

本指南提供 Docker 与传统 LNMP 环境的无损升级步骤，并集中记录各版本间的行为变更与废弃配置项，避免跨版本升级后出现插件失灵或配置不生效的问题。

## 一、升级前安全检查清单

在执行任何版本升级前，务必完成以下三步：

1. **完成双一致性备份**：备份站点目录（含 `config/setting_user.php`、`data/files/`）与完整数据库快照（详见 [数据备份与迁移 SOP](/operations/backup-migration/)）。
2. **查阅版本变更与插件兼容性**：确认目标版本是否存在 PHP 版本要求提升、OnlyOffice JWT 默认策略变更或存储/Samba 插件行为调整。
3. **选择低峰期维护窗口**：暂停大批量文件同步与计划任务，减少升级期间锁表风险。

## 二、Docker Compose 镜像升级步骤（推荐）

以升级至内置修复版 PHP 8.5.12 的 `kodcloud/kodbox:1.70.03`（或最新稳定版 `latest`）为例：

1. 进入 `compose.yml` 所在目录，确认镜像标签已更新为目标版本（推荐锁定具体版本号便于回滚）：
   ```yaml
   services:
     app:
       image: kodcloud/kodbox:1.70.03
   ```
2. 拉取新镜像并重建应用容器（数据卷 `./site` 与 `./db` 保持不动）：
   ```bash
   docker compose pull app
   docker compose up -d --no-deps app
   ```
3. 查看启动日志确认无报错：
   ```bash
   docker compose logs -f --tail=100 app
   ```
4. 若升级后出现局部权限异常，执行权限修正：
   ```bash
   docker compose exec app chown -R nginx:nginx /var/www/html
   ```

> **提示：程序代码热更新 vs 镜像底层升级**
>
> KodBox 支持在管理后台「系统设置 → 在线升级」一键升级主程序 PHP 代码；但**后台在线升级不会更新容器内的 PHP / Nginx / 系统安全补丁**。为获取如 PHP 8.5.12 等底层安全修复，仍需定期拉取新版官方 Docker 镜像并重建容器。

## 三、传统 LNMP / 宝塔环境升级步骤

1. **升级主程序**：优先在 KodBox 管理后台 **后台管理 → 系统设置 → 检查更新** 中一键在线升级；无公网环境可下载官方更新包覆盖源码目录（**切勿覆盖 `config/setting_user.php` 与 `data/` 目录**）。
2. **升级 PHP 分支**：若服务器仍在使用已停止官方支持的 PHP 7.x / 8.0 / 8.1，建议按 [PHP 分支建议](/setup/environment/#php-branches) 升级至 PHP 8.3 / 8.4 / 8.5，并确认 `pdo_mysql`、`redis`、`gd`、`mbstring`、`zip`、`fileinfo` 等必需扩展已在新版本 PHP 中重新安装。

## 四、v1.69–v1.70.03 重点行为变更与废弃项汇总

跨版本升级至 `v1.70.x` 时，请重点关注以下行为变化并逐项核对：

| 模块 | 版本 | 变更内容与应对动作 |
| --- | --- | --- |
| **官方 Docker 镜像 PHP** | `v1.70.03` | 内置升级至修复版 **PHP 8.5.12**；自定义扩展或第三方非官方插件需提前核对 PHP 8.5 兼容性 |
| **OnlyOffice 插件** | `v1.70+` | 新增显式 **JWT 开关**、回调端点鉴权与**二级目录/内网优先地址保留**；升级后如遇「文档安全令牌的格式不正确」，请核对插件 JWT 开关与容器 `JWT_SECRET` 一致性 |
| **Samba 插件回收站** | `v1.70+` | **破坏性路径变更**：原全局统一回收站重构为各共享目录内独立的 `.recycle` 目录，依赖旧全局回收站路径的清理脚本需同步修改 |
| **二次验证（2FA）与越权校验** | `v1.70.03` | 强化 2FA 校验限流防爆破与后端部门级越权校验；确保反代已正确透传真实客户端 IP，避免限流误伤全员 |
| **AI 助手与 `aiRag`** | `v1.70.03` | 新增多模态调用统一配置与优化 `aiRag` 向量检索的文件权限隔离；升级后建议检查模型服务配置与 Milvus 连接状态 |
| **WebDAV 兼容性** | `v1.70+` | 修复深层子目录遍历与 RaiDrive + WPS 编辑保存清空文件问题 |
| **ImageMagick 缩略图** | `v1.70+` | 优化临时目录隔离、命令转义与转换失败重试逻辑；如曾手工修改旧版脚本规避临时目录撑爆，可恢复官方默认策略 |

### 废弃与不再推荐的做法汇总

- **废弃生产环境使用 SQLite**：新装与高并发环境一律使用 MySQL / MariaDB，否则并发上传极易触发 `database is locked`。
- **废弃 PHP 7.x / 8.0 / 8.1**：已过官方安全生命周期（EOL），不再提供安全补丁。
- **废弃 `docker-compose.yml` 中的 `version:` 顶层字段**：Docker Compose v2 已弃用 `version` 属性，新编排文件可直接省略。
- **废弃旧版独立域名文档引用**：原 `doc.kodcloud.com/` 为上一代 KodExplorer 文档，原 `doc.kodcloud.com/v2/#/help/options` 调优参数已统一收编至本站 [技术参考与开发者](/reference/)。

## 五、升级后验收（Success Check）

1. 打开 **后台管理 → 概览**，确认主程序版本号、PHP 版本、数据库与 Redis 连接均显示正常。
2. 抽检 **OnlyOffice 在线编辑并保存**、**图片/PDF 预览**、**WebDAV 挂载** 与 **AI 助手对话**。
3. 查看 **后台管理 → 计划任务**，确认定时清理与索引任务正常运行无报错。

## 相关延伸

- 完整版本特性清单：[版本更新日志归档](/reference/changelog/)
- 出现升级异常快速定位：[告警与报错字典](/operations/error-dictionary/)
