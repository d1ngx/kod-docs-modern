---
title: "可道云数据备份和恢复"
keywords: 数据备份,数据库备份,站点迁移,恢复
description: 如何完成可道云数据的完整备份和恢复
---

<div id="backup" class="tab-pane fade in active" markdown="1">

## 一 数据备份

> **提示:**
>
> 物理数据和MySQL数据库备份时间不能相隔太久，因为数据库中存储着物理文件记录，两者备份时间相隔太久可能出现记录不一致，会导致文件无法下载等问题。

可道云备份分为两部分:

1. 物理数据备份
    - 建议做整站备份，也就是备份整个网站目录。
    - 默认情况下，数据都存放在站点下`./data/files`目录，如果还有其他存储，也要一并备份。
2. MySQL数据库备份
    - 逻辑备份：导出sql是最快的备份方式。

### 1. 物理数据备份

`Rsync` 是`Linux/Unix`系统中最常用的远程/本地复制和同步文件夹的命令, 在`windows`上也有基于`Rsync`实现的[cwRsync](https://itefix.net/cwrsync-client).

环境说明:

- 在服务器上安装rsync `yum install rsync`
- 这里使用ssh的方式同步, 假设服务器连接地址为`root@172.28.10.10`
- 假设可道云网盘站点目录位于服务器上`/var/www/html`

#### 1.1 备份到Linux

登录Linux备份服务器, 也需要安装rsync, 然后执行同步命令, 将服务器站点目录同步到本地`/backup/`:

```console
$ mkdir /backup/
$ rsync -av root@172.28.10.10:/var/www/html /backup/
```

#### 1.2 备份到Windows

1. 下载[cwrsync_6.2.7_x64_free.zip](https://itefix.net/dl/free-software/cwrsync_6.2.7_x64_free.zip), 解压并拷贝到目录 `C:\cwrsync`
2. 打开powershell窗口，执行rsync同步命令

  ```powershell
  # /cygdrive/d/backup/ 代表windows备份目录d:\backup
  c:\cwrsync\bin\rsync.exe -e 'c:\cwrsync\bin\ssh.exe' -av root@172.28.10.10:/var/www/html /cygdrive/d/backup/
  ```

### 2. MySQL数据库备份

#### 2.1 逻辑备份

> **提示:**
>
> 如果不确定`kodbox`使用的数据库账号, 可以查看下站点下配置文件`./config/setting_user.php`

mysqldump 是 MySQL自带的备份工具。

从命令行执行备份, 其中替换下列值:

- `[server]`：服务器地址
- `[username]`：数据库用户名
- `[password]`：数据库密码
- `[db_name]`：数据库名称

```bash
mysqldump --single-transaction -h [server] -u [username] -p[password] [db_name] > kodbox_sqlbkp_`date +%Y%m%d`.bak
```

## 二 数据恢复

数据恢复时, 要求有 **物理数据备份** 和 **MySQL数据库备份** , 缺一不可.

### 1. 物理数据恢复

物理数据默认位于站点下`./data/files`目录, 所以在恢复站点时, 将站点目录的备份文件移动到`Web根目录` (`在Nginx中设置的root目录`)即可。

> **提示:**
>
> 此时若不导入数据库, 直接访问站点时会报错**数据库连接异常**

### 2. MySQL数据库恢复

假设目前已经有了:

- 一个新的MySQL数据库环境
- **MySQL数据库备份**文件`kodbox_sqlbkp_xxx.bak`

下面的步骤就是创建数据库和用户, 然后导入数据库备份:

```sql
mysql> CREATE USER 'username'@'localhost' IDENTIFIED BY 'password';
mysql> CREATE DATABASE IF NOT EXISTS kodbox CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
mysql> GRANT ALL PRIVILEGES ON kodbox.* TO 'username'@'localhost';
mysql> FLUSH PRIVILEGES;
mysql> use kodbox;
mysql> source /backup/kodbox_sqlbkp_xxx.bak;
```

数据库恢复后, 站点即可正常访问了。

> **提示:**
>
> 此时新建的数据库和用户名 如果和之前不一致, 请在站点下配置文件`./config/setting_user.php`修改相应内容。

</div>
