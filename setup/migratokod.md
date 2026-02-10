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

## 4. 迁移TB级数据说明

> **提示**：
>
> 当待迁移有TB级别时
>
> - 手动执行 rsync 已不再适合，建议通过脚本方式实现自动化与可控迁移。
> - 简单的数据拷贝方式效率和可靠性不足，应改为使用系统提供的数据导入功能来完成迁移。

1. 自动化脚本同步参考，并设置每小时自动执行`crontab -e`添加`0 * * * * /usr/local/bin/rsync_auto.sh`

    ```bash
    #!/bin/bash

    # ===== 配置 =====
    SRC="admin@192.168.1.100:/data/"
    DST="/kdisk/volume1/mgfiles/data/"
    LOG="/var/log/rsync.log"
    LOCK="/tmp/rsync.lock"
    RSYNC_CMD=(rsync -av --ignore-existing --partial --exclude='.*')

    # ===== 时间窗口 =====
    # 0 = 允许运行
    in_time_window() {
        local HOUR WEEKDAY
        HOUR=$(date +%H)
        WEEKDAY=$(date +%u)

        # 周末
        [ "$WEEKDAY" -ge 6 ] && return 0

        # 工作日 18:00–09:59
        [ "$HOUR" -ge 18 ] || [ "$HOUR" -lt 10 ]
    }

    # ===== rsync PID =====
    get_rsync_pids() {
        pgrep -f "$RSYNC_CMD $SRC $DST"
    }

    RSYNC_PIDS=$(get_rsync_pids)

    # ===== 主逻辑 =====
    if in_time_window; then
        # ===== 允许时间 =====
        if [ -n "$RSYNC_PIDS" ]; then
            # rsync 在跑
            [ ! -f "$LOCK" ] && touch "$LOCK"
            echo "$(date '+%F %T') allowed window, rsync running: $RSYNC_PIDS" >> "$LOG"
            exit 0
        fi

        # rsync 不在跑
        if [ -f "$LOCK" ]; then
            echo "$(date '+%F %T') stale lock found, removing." >> "$LOG"
            rm -f "$LOCK"
        fi

        # ===== 启动 rsync =====
        echo "$(date '+%F %T') allowed window, starting rsync." >> "$LOG"
        touch "$LOCK"

        stdbuf -oL -eL "${RSYNC_CMD[@]}" "$SRC" "$DST" >> "$LOG" 2>&1 &
        RSYNC_PID=$!

        echo "$(date '+%F %T') rsync started, pid=$RSYNC_PID" >> "$LOG"
    else
        # ===== 禁止时间 =====
        if [ -n "$RSYNC_PIDS" ]; then
            echo "$(date '+%F %T') forbidden window, killing rsync: $RSYNC_PIDS" >> "$LOG"
            kill -9 $RSYNC_PIDS
        fi

        if [ -f "$LOCK" ]; then
            rm -f "$LOCK"
            echo "$(date '+%F %T') forbidden window, lock removed." >> "$LOG"
        fi
    fi

    exit 0
    ```

2. 确认同步完成，如`tail /var/log/rsync.log`不再更新，同时`du -sh /kdisk/volume1/mgfiles/data`与原始目录比较大小一致。

3. 进入后台存储管理，使用迁移目录创建新存储**新迁移文件**，这是数据导入的条件之一。

    ![mgfiles](../images/mgfiles.png){:width="600px"}
    ![mgfiles1](../images/mgfiles1.png){:width="300px"}

4. 在存储管理右上方，点击**存储导入**, 选择目录位置后确定开始。

    - 原始数据目录  **新迁移文件**`/data`
    - 网盘存储目录  **企业网盘**`/data`

![migrate1](../images/migrate1.png){:width="900px"}

> **注 意**
> 
> - 网盘文件需通过存储路径访问，因此在导入之前，需将待导入的原始数据目录（或父级目录）添加为存储。
> - 此操作不会对原始数据做改动，只构建文件索引映射到网盘，在导入之后，不能对原始数据做任何改动，避免索引失效。
> - 导入数据与网盘默认存储数据的路径结构不同，建议将导入数据的存储作为附加存储（而非系统默认存储）使用，以维护数据结构统一。
> - 导入之前建议对数据库进行备份，以免出现意外。
> - 文件路径长度超过256个字符会被限制导入，相关日志放在网盘存放目录下的“导入失败日志-长度超256字符”文件夹中，可在导入完成后自行查看并处理。
{: .important}

</div>
