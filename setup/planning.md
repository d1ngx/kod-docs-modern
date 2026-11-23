---
title: "规划部署（架构选型、数据库与资源评估）"
type: how-to
edition: ["开源版", "企业版", "teamOS"]
minVersion: "1.70"
keywords: ["规划部署", "SQLite", "database is locked", "MySQL", "MariaDB", "Redis", "PHP 8.5", "硬件配置", "架构选型"]
description: "部署 KodBox 前的关键架构决策：横向对比部署形态、规避 SQLite 高并发锁库风险、评估 Redis 与硬件资源。"
---

在执行任何安装命令前，请先花 3 分钟完成架构规划。合理的部署形态、数据库引擎与缓存选型，能直接避免日后出现 `database is locked` 锁库报错、迁移困难和性能瓶颈。

## 一、部署形态横向对比

根据你的服务器条件与运维习惯，选择最契合的一种部署形态：

| 对比维度 | Docker Compose（首选） | Docker 单容器 | teamOS 整机系统 | 传统 LNMP / 宝塔面板 |
| --- | --- | --- | --- | --- |
| **内置运行栈** | 官方镜像内置 Nginx + 修复版 PHP 8.5.12（v1.70.03+），编排独立 MariaDB + Redis | 仅含 Nginx + PHP，默认易误用 SQLite 或需外连数据库 | 完整 OS + 磁盘 RAID + 预调优服务栈 | 需手动安装 Nginx/PHP/MySQL/Redis 及扩展 |
| **升级与回滚** | 拉取新镜像重建容器，极快且环境一致 | 同左，但依赖组件需单独维护 | 后台一键系统与网盘升级 | 需分别维护 PHP 版本与安全补丁 |
| **隔离与排错** | 依赖不污染宿主机，支持内网互联 OnlyOffice | 适合已有独立 MySQL/Redis 集群的场景 | 适合无 Linux 基础的企业专机 | 适合复用既有 Web 面板与主机 |
| **推荐场景** | 90% 以上的 Linux 服务器、VPS、群晖/铁威马/Unraid NAS | 已有外部云数据库（RDS）的环境 | 独立物理机 / 裸金属 NAS | 已有成熟宝塔/LNMP 运维体系 |

## 二、官方推荐生产技术栈

- **应用运行环境**：PHP 8.1 及以上（传统环境优先 **PHP 8.4** 或 **PHP 8.3**；容器部署直接使用最新官方镜像，例如 `kodcloud/kodbox:1.70.03` 已内置含安全修复的 **PHP 8.5.12**）。
- **数据库（必选生产级）**：**MySQL 5.7+ / 8.0+** 或 **MariaDB 10.6+ / LTS**，且强烈建议配置 `--transaction-isolation=READ-COMMITTED`。
- **缓存服务（强烈推荐）**：**Redis 6.x / 7.x / Alpine**。

> **严重警告：切勿在生产环境或并发上传场景使用 SQLite**
>
> SQLite 采用单文件库级写锁，**仅适合单人临时试用**。个人 NAS 或团队用户一旦在默认 SQLite 环境下并发上传包含大量文件的目录，或同时运行缩略图/定时任务，极易触发 **`database is locked`** 锁库报错，导致上传中断、任务卡死甚至数据状态不一致。正式部署请务必选择 **MySQL / MariaDB**，若已误用 SQLite 遇到锁库，请参考 [告警与报错字典：database is locked](/operations/error-dictionary/#database-is-locked)。

### 为什么强烈建议开启 Redis 缓存？

- 未配置 Redis 时，KodBox 会退化为本地文件缓存（写入 `data/temp`），高并发会话与高频文件元数据查询会带来大量磁盘小文件 I/O，在机械硬盘 NAS 上尤为明显。
- 启用 Redis 后，会话锁、分片上传状态、权限缓存与缩略图队列响应显著加快，且支持多实例扩展。

## 三、存储策略前置决策

部署前务必先确定文件的存放方式，切勿在导入 TB 级数据后再临时返工：

1. **托管默认存储（推荐）**：文件由 KodBox 写入 `data/files` 或独立对象存储 Bucket，完整支持**双哈希秒传、COW 去重、回收站与历史版本**。注意：**禁止在宿主机直接手动增删改托管目录下的文件**。
2. **外部目录挂载（本地目录 / NFS / SMB）**：适合纳管宿主机或 NAS 已有共享文件夹，可与外部程序共享读写，但会放弃部分去重/秒传能力，且文件变动不会自动触发外部套件（如 Synology Drive）的原生索引。
3. **多云对象存储（OSS / COS / MinIO / R2 / S3）**：适合跨地域访问与海量冷热分层，部署前需提前规划好 **CORS 跨域规则**与**内外网 Endpoint**（详见 [存储策略选型总表](/admin/storage-matrix/)）。

深入理解底层权衡请阅读：[虚拟文件系统与存储托管原理](/concepts/storage-architecture/)。

## 四、硬件与资源规划参考

| 规模等级 | 并发活跃用户 | 建议 CPU / 内存 | 关键组件资源预算 |
| --- | --- | --- | --- |
| **个人 / 家庭 NAS** | 1–5 人 | 2 核 / 2–4 GB | KodBox + MariaDB + Redis 约占 500 MB–1 GB |
| **小微团队** | 10–50 人 | 4 核 / 8 GB | 接入 OnlyOffice 需额外预留 ≥ 2–4 GB 内存 |
| **中大型企业** | 50–300+ 人 | 8 核+ / 16 GB+ | OnlyOffice（4 GB+）+ Milvus RAG 独立部署 |

- **系统盘容量预警**：切勿把站点目录 `data/files` 或数据库与极小的系统根分区放在一起。系统盘写满会导致数据库与 PHP 无法写入临时文件而直接崩溃（紧急抢救方案见 [系统盘爆满紧急数据抢救](/operations/backup-migration/#disk-full-rescue)）。

## 验证规划是否完备（Success Check）

在进入下一步安装前，请逐项勾选确认：

- 已确定部署形态（推荐 Docker Compose）并预留独立数据磁盘目录。
- 已选定 MySQL / MariaDB（而非 SQLite）及 Redis 缓存。
- 已明确是否需要同时规划 HTTPS 域名、OnlyOffice 在线编辑或对象存储 Bucket。
- 已规划好网络端口放行范围（可对照 [网络端口与反向代理总表](/reference/ports-and-proxy/)）。

## 下一步

- Linux 容器标准部署：[Docker Compose 部署示例](/setup/docker/)
- 群晖 / 铁威马 / Unraid NAS 部署：[Docker 与 NAS 宿主机权限指南](/setup/nas-permissions/)
- 传统 Linux / 面板部署：[Linux 依赖环境说明](/setup/environment/)
