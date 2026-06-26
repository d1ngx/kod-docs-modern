---
title: "5 可道云数据迁移"
keywords: 迁移,可道云
description: 如何迁移teamOS系统数据
---

<div id="migrateamos" class="tab-pane fade in active" markdown="1">

## 1. 迁移说明

可道云站点的数据有2部分，数据库和物理存储。

- 数据库在后台存储/文件-备份管理，通常会自动备份。
- 物理存储一般是独立硬盘。

在数据库已备份的情况下，拔出独立硬盘到其他 teamOS 系统可以恢复可道云站点。

## 2. 迁移步骤

1. 检查备份文件是否存在，打开当前默认存储位置（通常是独立硬盘），从文件管理进入 `database/backup`能看到有当天产生的数据库备份文件夹`2026xxx`。

![backup1](../images/backup1.png){:width="800px"}
2. 查看当前默认存储目录路径（一般为`/kdisk/volume1/files`）

![sto_dir](../images/sto_dir.png){:width="800px"}
3. 在旧站点系统关机后拔出磁盘，插入新系统开机。进入新站点磁盘管理，找到磁盘归属的逻辑卷点击挂载，输入`/kdisk/volume1`（对应上一步查到的位置，省略 files）并挂载

![mount1](../images/mount1.png){:width="800px"}

![mount2](../images/mount2.png){:width="800px"}
4. 从新站点进入存储管理，能看到自动多了一个`存储空间 1`

![sto1](../images/sto1.png){:width="800px"}
5. 从新站点进入备份管理，选择系统还原-数据库还原，进入备份目录选择`存储空间 1`-`database/backup`的最新备份文件夹`2026xxx`。

![recover1](../images/recover1.png){:width="800px"}

![bkp_dir1](../images/bkp_dir1.png){:width="800px"}
6. 危险操作需要二次确认，等待导入执行完成，关闭后重新登录站点。（使用旧站点的账号）

![recover2](../images/recover2.png){:width="800px"}

![recover3](../images/recover3.png){:width="800px"}

</div>
