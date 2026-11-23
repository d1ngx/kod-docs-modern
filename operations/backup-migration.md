---
title: "数据备份、容灾与迁移 SOP"
type: how-to
edition: ["开源版", "企业版", "teamOS"]
minVersion: "1.70"
keywords: ["备份", "恢复", "迁移", "data/files", "mysqldump", "SQLite", "宝塔迁 Docker", "KodExplorer 迁移", "系统盘爆满", "抢救数据", "主机白名单", "chown"]
description: "防误操作的 KodBox 备份与迁移标准化 SOP：强调文件与数据库双一致原则，覆盖 KodExplorer 迁移、跨形态迁移、系统盘爆满紧急抢救及恢复三项必检。"
---

本 SOP 旨在彻底杜绝迁移或灾难恢复后出现「数据库记录存在但文件打不开」「密码正确却报鉴权失败」或「站点无权写入」等事故。无论采用哪种迁移方式，都必须严格遵守**物理文件与数据库双重一致性原则**。

## 黄金原则：物理文件 + 数据库双重一致性备份

KodBox 采用「数据库元数据 + 物理文件实体」分离架构（详见 [虚拟文件系统与存储托管原理](/concepts/storage-architecture/)）。**只备份 `data/files` 不备份数据库，或只导出 SQL 不备份文件，恢复后都会导致严重损坏或文件无法打开！**

执行正式备份或迁移前，请务必按以下顺序操作：

1. **暂停写入流量与计划任务**：先在反向代理开启维护页，或停止 Web/PHP 容器（如 `docker compose stop app`）及宿主机 Cron，防止备份期间新增上传导致文件与数据库时间点错位。
2. **备份物理文件与配置**：完整打包站点目录（核心为 `data/files/` 物理文件目录与 `config/setting_user.php` 配置文件；若挂载了其他本地目录，也需一并备份）。
3. **备份完整数据库**：
   - **MySQL / MariaDB（生产推荐）**：使用 `--single-transaction` 保证一致性快照导出：
     ```bash
     docker exec kodbox-db-1 mysqldump --single-transaction -u kodbox -p'<你的密码>' kodbox > kodbox_$(date +%Y%m%d).sql
     ```
     （传统宿主机 MySQL 直接运行 `mysqldump --single-transaction -h 127.0.0.1 -u kodbox -p kodbox > kodbox_backup.sql`；数据库连接参数可在 `config/setting_user.php` 查看。）
   - **内置 SQLite（仅限轻度试用环境）**：务必先停止 PHP-FPM/容器进程释放文件锁，再完整拷贝站点 `data/system/` 下的 SQLite 数据库文件（含同名的 `-wal`、`-shm` 文件）。

---

## 场景一：从旧版 KodExplorer 迁移至 KodBox

由于 KodExplorer 直接按原始目录存放文件、无数据库表结构，而 KodBox 需要入库建立元数据索引，**不能直接覆盖安装**。标准流程如下：

1. 独立部署一套全新 KodBox（推荐使用 MySQL/MariaDB + Redis）。
2. 将原 KodExplorer 的用户数据目录复制到新服务器（或挂载为 KodBox 的本地存储目录）。
3. 通过后台 **数据导入插件**（[数据导入插件说明](/admin/stoimport/)）或管理员在存储管理中将原目录文件批量复制到 KodBox 托管空间，由系统自动计算哈希并建立数据库索引。
4. 历史详细图文步骤可对照：[迁移数据到可道云](/setup/migratokod/)。

---

## 场景二：跨服务器或跨形态迁移（如宝塔面板迁至 Docker / teamOS）

将已有 KodBox 从宝塔面板/传统 LNMP 迁移至 Docker Compose 或 teamOS 时，按以下五步执行：

1. **源站停写并双备份**：停止源站 Nginx/PHP 或进入维护状态，打包 `config/setting_user.php`、`data/files/`（以及自定义插件目录 `plugins/`），并导出完整 MySQL SQL 文件。
2. **目标端先初始化基础服务**：在新服务器拉起 `db` 与 `redis` 容器，创建空库 `kodbox`（字符集 `utf8mb4_general_ci`）并导入备份 SQL：
   ```bash
   docker exec -i kodbox-db-1 mysql -u root -p'<Root密码>' kodbox < kodbox_backup.sql
   ```
3. **还原站点文件并核对 `config/setting_user.php`**：将源站文件放入目标映射目录（如 `./site`），编辑 `config/setting_user.php`，确认其中数据库主机（Docker 内通常改为 `db`）、端口、库名、用户名、密码与 Redis 主机（改为 `redis`）与新环境一致。
4. **修正容器内目录属主权限**：启动 `app` 容器后立即重置目录属主：
   ```bash
   docker exec -it kodbox-app-1 chown -R nginx:nginx /var/www/html
   ```
5. **切换域名解析与反向代理**，并完成下文「恢复验收三项必检」。迁往 teamOS 另可参考 [可道云数据迁移到 teamOS](/setup/migrateamos/)。

---

## 场景三：系统盘爆满导致无法启动的紧急数据抢救 {: #disk-full-rescue}

当系统根分区 `/` 使用率达到 100% 时，MySQL/MariaDB、Redis 与 PHP-FPM 会因为无法写入临时文件或 binlog 直接崩溃，网盘页面报 500 或数据库连接失败。**切勿直接重装系统或盲目执行 `rm -rf` 删库！** 请按以下步骤紧急抢救：

1. **先停止应用与数据库服务，防止写入截断损坏表结构**：
   ```bash
   docker compose stop app db redis
   ```
2. **安全腾出临时空间（仅清理可再生文件）**：
   - 检查磁盘占用：`df -h` 与 `du -sh /* /var/lib/docker/* 2>/dev/null | sort -h`。
   - 清理无用日志与系统缓存（如 `journalctl --vacuum-size=100M`、清理旧 Docker 悬空镜像 `docker image prune -f`、清理 KodBox 临时目录 `site/data/temp/*`——**切勿删除 `site/data/files/`**）。
   - 若 MariaDB 开启了 binlog 占满磁盘，可在确认无主从复制需求后，拉起数据库后通过 `PURGE BINARY LOGS` 安全清理，切勿直接手工删正在使用的 `.ibd` 表空间文件。
3. **腾出至少 2–5 GB 可用空间后立即导出抢救备份**：
   - 先仅拉起数据库容器 `docker compose start db`，把数据库导出到**容量充足的外部数据盘**（如 `/mnt/data/rescue_kodbox.sql`）。
   - 使用 `rsync -avP` 将 `site/data/files/` 与 `site/config/` 同步至外部大容量数据盘。
4. **迁移目录至独立数据盘并恢复服务**：修改 `compose.yml` 中的 `volumes` 指向新数据盘，确认权限后重新启动服务。

---

## 恢复验收三项必检动作（Success Check）

每次备份恢复或迁移完成后，必须按顺序完成以下三项验收，全部通过方可对外开放访问：

1. **数据库账号权限与主机白名单核验（解决“密码正确却报鉴权失败”）**：
   - 跨机或迁入 Docker 后，常见报错是 `Access denied for user 'kodbox'@'172.18.0.x'`。原因是原库只授权了 `'kodbox'@'localhost'`，容器间访问来自内网网段。
   - 在 MySQL 中显式核验并放行容器网段（或 `'%'` 配合仅内网暴露数据库端口）：
     ```sql
     CREATE USER IF NOT EXISTS 'kodbox'@'%' IDENTIFIED BY '<你的密码>';
     GRANT ALL PRIVILEGES ON kodbox.* TO 'kodbox'@'%';
     FLUSH PRIVILEGES;
     ```
2. **容器内目录属主权限重置与读写测试**：
   - 确认已执行 `docker exec -it kodbox-app-1 chown -R nginx:nginx /var/www/html`（NAS 挂载环境核对 `PUID`/`PGID`）。
   - 登录网页端成功上传、预览并删除一个测试文件，检查历史旧文件也能正常下载。
3. **第三方插件（尤其是 OnlyOffice 令牌）重连验证**：
   - 迁移或重装后，进入 **后台管理 → 插件中心**，重新测试 **OnlyOffice**、**对象存储**、**WebDAV** 与 **AI 助手 / Milvus** 连通性。
   - 若 OnlyOffice 提示「文档安全令牌的格式不正确」，请按 [OnlyOffice JWT 重置步骤](/setup/office/#提示文档安全令牌的格式不正确) 重新对齐密钥。

## 相关延伸

- 传统备份命令详述：[可道云数据备份和恢复](/setup/backup/)
- 容器权限修复：[Docker 与 NAS 宿主机目录权限指南](/setup/nas-permissions/)
- 报错速查：[告警与报错字典](/operations/error-dictionary/)
