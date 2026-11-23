---
title: "Docker 与 NAS 宿主机目录权限指南"
type: how-to
edition: ["开源版", "企业版"]
minVersion: "1.70"
keywords: ["NAS", "群晖", "铁威马", "Unraid", "PUID", "PGID", "chown", "nginx", "权限不足", "该文档不存在！", "Docker 挂载"]
description: "解决 Docker 与群晖、铁威马（TOS）、Unraid 等 NAS 映射目录无法读写、迁移后目录属主错乱，以及本地挂载目录外链下载提示「该文档不存在！」的问题。"
---

本指南面向在 Linux Docker 或群晖（DSM）、铁威马（TOS）、Unraid 等 NAS 上部署 KodBox 的运维与个人用户，帮助你正确配置容器运行用户与宿主机目录权限，彻底消除上传失败、配置无法保存与外链下载异常。

## 为什么 Docker / NAS 容易出现目录权限报错

KodBox 官方容器内的 Nginx 与 PHP-FPM 进程默认以容器内部 `nginx` 用户（通常 UID=100、GID=101，或随 `PUID`/`PGID` 环境变量调整）运行。当通过 `-v` / `volumes` 将宿主机或 NAS 共享目录挂载进容器时，如果宿主机目录归属于 `root` 或其他 NAS 账号，容器进程就会因为无权读写而出现上传失败、插件无法安装或站点白屏。

## 1. 群晖 / 铁威马 / Unraid 获取正确的 PUID 与 PGID

在 NAS 宿主机通过 SSH 登录并查看目标共享文件夹的拥有者 UID/GID：

```bash
id <你的NAS账号>
ls -ldn /volume1/docker/kodbox
```

各主流 NAS 常见运行身份参考：

| NAS 平台 | 常见宿主机用户与组 | 建议配置策略 |
| --- | --- | --- |
| **群晖 Synology DSM 7** | 管理员账号通常 `UID=1026`，组 `users` 为 `GID=100` | 在 Compose 中传入 `PUID=1026`、`PGID=100`，或在 DSM 共享文件夹权限中对 `users` 组授予读写权 |
| **铁威马 TOS** | 常见 `UID=1000` 或管理员对应 UID，组 `GID=100` | 用 `id` 查出实际 UID/GID 后写入环境变量，并确保目标共享文件夹 ACL 已放行对应组 |
| **Unraid** | 标准用户 `nobody`（`UID=99`），组 `users`（`GID=100`） | 固定设置 `PUID=99`、`PGID=100`，并在挂载后执行一次宿主机权限同步 |
| **标准 Linux 主机** | 容器默认 `nginx`（`100:101`） | 保持默认或在容器内执行 `chown -R nginx:nginx /var/www/html` |

在 `compose.yml` 的 `app` 服务中显式指定 `PUID` 和 `PGID`：

```yaml
services:
  app:
    image: kodcloud/kodbox:latest
    environment:
      MYSQL_HOST: db
      REDIS_HOST: redis
      PUID: "1026"
      PGID: "100"
    volumes:
      - /volume1/docker/kodbox/site:/var/www/html
      - /volume1/share:/mnt/nas-share
```

> **注意：NAS 共享文件夹 ACL 覆盖问题**
>
> 群晖 DSM 与铁威马 TOS 默认启用高级 Windows ACL。即使 Linux 底层 `chmod 775` 显示有权限，若未在 NAS 面板的「共享文件夹 → 编辑 → 权限」中为对应用户或组勾选「可读写」，容器写入仍会被拒绝。

## 2. 迁移或复制数据后修复容器内目录属主

跨服务器迁移、解压备份包或从宝塔面板迁往 Docker 后，站点目录 `/var/www/html`（尤其是 `data/files`、`data/temp`、`config`）的属主常变为 `root:root`，导致登录后无法上传文件或报错写入失败。

在宿主机执行以下命令重置容器内站点目录属主（将 `kodbox-app-1` 替换为实际容器名）：

```bash
docker exec -it kodbox-app-1 chown -R nginx:nginx /var/www/html
```

若你还额外挂载了本地共享目录（例如 `/mnt/nas-share`），且该目录由 KodBox 独占托管，可按需修复对应子目录权限：

```bash
docker exec -it kodbox-app-1 chown -R nginx:nginx /mnt/nas-share
```

> **重要提醒**
>
> 如果 `/mnt/nas-share` 同时被 NAS 的 SMB/AFP 或 Synology Drive 使用，**切勿盲目把整个共享盘 `chown` 为 `nginx`**，以免导致其他 NAS 套件失去读写权。正确做法是让容器的 `PGID` 加入宿主机已有的共享用户组（如 `GID=100`），并赋予组读写权限（`chmod -R g+rwX`）。

## 3. 排查 Docker 本地挂载目录单文件外链下载返回「该文档不存在！」

在 Docker 部署环境下，部分用户在「后台管理 → 存储管理」挂载了宿主机本地目录（如 `/mnt/nas-share`）后，网盘内部浏览正常，但生成单个文件外链点击下载时却提示 **`该文档不存在！`**。

请按以下顺序逐项排查：

1. **核对挂载路径与大小写一致性**：确认容器内 `ls -l /mnt/nas-share` 能直接看到目标文件，且 KodBox 存储管理中填写的目录路径与容器内实际挂载点完全一致（不要误填宿主机路径 `/volume1/share`）。
2. **检查 Nginx `X-Accel-Redirect` 或内部路径映射**：若在宿主机额外使用了 Nginx 反向代理且开启了静态文件直出/别名转发，宿主机 Nginx 无法直接访问容器内 `/mnt/nas-share` 路径，会导致下载 404 或系统返回「该文档不存在！」。确保反代层只做普通 `proxy_pass`，不要在宿主机 Nginx 错误配置指向容器内部路径的 `alias`。
3. **验证文件读权限与符号链接**：容器内执行 `docker exec -it kodbox-app-1 su -s /bin/sh nginx -c "ls -la /mnt/nas-share"`，确认 `nginx` 进程对父目录具备执行权限（`x`）且对目标文件具备读权限（`r`）；避免使用指向容器外部的宿主机软链接（容器内无法解析软链接目标）。
4. **确认外部挂载存储未在宿主机被移动或重命名**：如果文件在宿主机被移动后未刷新目录缓存，也会在下载旧外链时提示「该文档不存在！」。

## 4. 验证权限配置是否生效（Success Check）

完成配置后，执行以下三项验证：

1. 在宿主机运行 `docker exec -it kodbox-app-1 ls -ld /var/www/html/data/files`，确认目录属主与 PHP-FPM 运行用户匹配。
2. 在 KodBox 网页端向默认空间和额外挂载目录各上传一个测试文件，并执行重命名、删除操作，均无权限报错。
3. 为挂载目录中的单个文件创建公开外链，在浏览器无痕窗口中打开并点击下载，确认正常下载而非提示「该文档不存在！」。

## 相关延伸

- 核心原理：[虚拟文件系统与存储托管原理](/concepts/storage-architecture/)（解释为何挂载目录无法触发 Synology Drive 同步及去重权衡）
- 反代配置：[HTTPS 反向代理与非标准端口配置](/setup/reverse-proxy/)
- 报错字典：[告警与报错字典](/operations/error-dictionary/)
