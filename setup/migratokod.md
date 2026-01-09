---
title: "迁移数据到可道云"
keywords: 迁移,可道云
description: 如何将其他系统的现有数据导入到可道云
---

<div id="migratokod" class="tab-pane fade in active" markdown="1">

## 1. 迁移说明

可道云 kodbox 存储数据的目录通常为站点下 `data/files` 目录, 但由于采用了文件去重/秒传的逻辑, 实际存储结构与网页看到的目录并不相同, 因此在服务器上移动文件到可道云存储目录是无法实现迁移的。

这里假设有 2 台服务器, 需要从**服务器 A** 迁移数据到**服务器 B**：

- **服务器 A**：原服务器  `192.168.1.100`, 上面有待迁移数据, 操作系统可以是 `Linux/Windows/NAS`。
- **服务器 B**：可道云服务器 `192.168.1.101`, 已按官网教程完成可道云部署, 操作系统默认是 `Linux`。

迁移数据到可道云主要分为两个步骤：

1. 通过 `rsync` 命令同步, 将**服务器 A** 的文件同步到**服务器 B**;
2. 在网页登录可道云管理员账号, 将**服务器 B** 的本地文件剪切到可道云。

## 2. Rsync目录同步

### 迁移Linux数据到可道云服务器

> **提示**：
>
> 当待迁移**服务器 A** 为Linux时
>
> - 安装 `rsync`的方式为 `yum install -y rsync`.
> - 假设待迁移数据位于`/data`目录.

在**服务器 A** 执行同步命令:

```console
$ rsync -avP /data/* --chown=nginx:nginx root@192.168.1.101:/data
```

将**服务器A** 的 `/data` 目录同步到**服务器B**的 `/data` 目录.
![rsync_linux](../images/rsync_linux.png){:width="500px"}

### 迁移Windows数据到可道云服务器

> **提示**：
>
> 当待迁移**服务器 A** 为Windows时
>
> - 可以使用`cwrsync`, 命令中目录要以`/cygdrive/` 开头，盘符后面没有`:`.
> - 假设待迁移数据位于`D:\data`目录.
> - `--chown=nginx:nginx`同步修改文件所有者为nginx，若服务器B没有nginx用户请省略.

1. 下载[cwrsync_6.2.9_x64_free.zip](https://static.box.kodcloud.com/plugins/cwrsync_6.2.9_x64_free.zip), 解压并重命名到`c:\cwrsync`目录;
2. 打开`powershell`终端, 执行同步命令:

    ```powershell
    C:\cwrsync\bin\rsync.exe -e 'c:\cwrsync\bin\ssh.exe' -avP --chown=nginx:nginx /cygdrive/d/data/* root@192.168.1.101:/data
    ```

    将**服务器A**的 `D:\data` 目录同步到**服务器B**的 `/data` 目录.
![rsync_win](../images/rsync_win.png){:width="900px"}

### 迁移NAS数据到可道云服务器

> **提示**：
>
> 当待迁移**服务器 A** 为NAS时
>
> - 默认已有`rsync`命令, 需要开启`ssh`功能, 通过管理员账号可以登录。
> - 假设待迁移数据位于`/volume1/web/data`目录.

这里以群晖DSM7.2为例：

通过`ssh`登录NAS, 然后执行同步命令(需要注意命令加了`sudo`,回车后要输一次管理员密码):

```console
$ sudo rsync -avP /volume1/web/data/* --chown=nginx:nginx root@192.168.1.101:/data
```

将**服务器A** 的 `/volume1/web/data` 目录同步到**服务器B**的 `/data` 目录
![rsync_nas](../images/rsync_nas.png){:width="600px"}

## 3. 将服务器本地文件写入可道云

当前所有数据已经迁移到可道云服务器的`/data`目录, 若让这些文件在可道云页面可读写, 需要赋予`nginx`的读写权限。

```console
$ chown -R nginx:nginx /data/
$ chmod -R 755 /data/
```

![nginx_priv](../images/nginx_priv.png){:width="450px"}

在网页登录可道云管理员账号, 文件地址栏输入地址 `/data` 回车进入站点根目录, 找到已迁移数据。
![data_path](../images/data_path.png){:width="900px"}

可以选中文件夹右键**剪切**, 进入企业网盘并右键**粘贴**, 或者直接拖动文件夹**移动**到企业网盘, 等待执行完成即可。
![data_move](../images/data_move.png){:width="900px"}

若耗时较久, 可以查看下任务管理器中在后台执行的进度。
![getask](../images/getask.png){:width="600px"}
</div>
