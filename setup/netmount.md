---
title: "如何挂载网络文件系统到可道云"
keywords: 网络挂载, smb, nfs
description: 挂载网络文件系统到可道云
---

<div id="netmount" class="tab-pane fade in active" markdown="1">

## 概述

通过**网络共享协议**, 可以将其他服务器的数据目录**挂载**到可道云服务器, 当成本地存储使用, 常见协议有 `NFS/SMB`。

这里假设有 2 台服务器, 需要将**服务器 A** 数据目录共享给**服务器 B**：

- **服务器 A**：原服务器  `192.168.1.100`, 上面有待共享数据, 操作系统可以是 `Linux/Windows/NAS`。
- **服务器 B**：可道云服务器 `192.168.1.101`, 已按官网教程完成可道云部署, 操作系统默认是 `Linux`。

## 挂载NFS目录到可道云

**服务器A**如果是`Linux`操作系统, 推荐使用NFS协议共享, 可以[参考其他教程](https://blog.csdn.net/Duke147/article/details/87810417)部署NFS服务端。

在可道云**服务器 B**需要完成NFS挂载, 首先安装客户端。

```console
$ yum install nfs-utils rpcbind
```

查看nfs服务端共享的目录

```console
$ showmount -e 192.168.1.100
Export list for 192.168.1.100:
/share 192.168.1.101
```

执行挂载命令

```console
$ mkdir /data
$ mount -o nolock 192.168.1.100:/share /data
```

设置开机自动挂载, 并验证无误.

```console
$ cp /etc/fstab /etc/fstab.bak
$ echo "192.168.1.100:/share /data nfs nolock 0 0" >> /etc/fstab
$ systemctl daemon-reload
$ umount /data && mount -a
```

> **提示**：
>
> 若挂载的`/data`目录没有`nginx`的读写权限, 则无法被可道云使用, 需确认`nginx`的`uid/gid`, 并在NFS服务器赋权。
>
> - 在**服务器 B**执行`id nginx`, 假设得到`uid=997(nginx) gid=996(nginx)`
> - 在**服务器 A**执行`chown -R 997:996 /data && chmod -R 755 /data`赋权.

在网页登录可道云管理员, 在文件路径输入挂载的`/data`目录回车, 可以看到NFS目录已经共享成功。
![nfs_box](../images/nfs_box.png){:width="800px"}

服务器物理路径只有管理员可见, 但可以内部协作分享的方式分享给其他用户。

### 挂载SynologyNAS的NFS共享

在`SynologyNAS`上共享NFS目录, 需要进入`控制面板-共享文件夹`, 对指定存储空间右键`编辑-NFS权限`：

- **服务器IP**：NFS客户端地址, 这里填可道云服务器IP;
- **权限**： 可读写, 保持默认即可;
- **Squash**: 映射所有用户为admin;
![nas_nfs](../images/nas_nfs.png){:width="600px"}

其他选项保持默认即可, 然后在可道云**服务器 B**需要完成NFS挂载, 执行挂载命令同上

```console
$ mkdir /data
$ mount -o nolock 192.168.1.231:/volume1/web /data
```

在挂载后, 同样浏览器里只有可道云管理员可见, 但可以内部协作分享的方式分享给其他用户。

## 挂载SMB目录到可道云

`SMB` 作为Windows自带的网络传输协议，主要用于局域网资源共享。

打开数据目录-属性-共享, 编辑共享使用的用户并保存。
![win_smb](../images/win_smb.png){:width="600px"}

然后在可道云**服务器 B**上完成SMB挂载, 在终端执行挂载命令

```console
$ mkdir /data
$ mount -t cifs -o username=test,password=123456,file_mode=0777,dir_mode=0777 //192.168.1.100/share /data
```

设置开机自动挂载, 并验证无误.

> **提示**：
>
> - `file_mode=0777`权限过于开放, 生产环境建议设为755, 并指定拥有者为nginx.
> - 在**服务器 B**执行`id nginx`, 假设得到`uid=997(nginx) gid=996(nginx)`

```console
$ cp /etc/fstab /etc/fstab.bak
$ echo "//192.168.1.100/share /data cifs username=test,password=123456,file_mode=0755,dir_mode=0755,uid=997,gid=996 0 0" >> /etc/fstab
$ systemctl daemon-reload
$ umount /data && mount -a
```

在网页登录可道云管理员, 在文件路径输入挂载的`/data`目录回车, 可以看到SMB目录已经共享成功。同样浏览器里只有可道云管理员可见, 但可以内部协作分享的方式分享给其他用户。
![nfs_box](../images/nfs_box.png){:width="800px"}
</div>
