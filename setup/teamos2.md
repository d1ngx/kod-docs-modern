---
title: "4 可道云系统设置"
keywords: kodbox
description: 完成上述装机步骤之后, 可道云相关服务会在开机时候自启
---

<div id="setup" class="tab-pane fade in active" markdown="1">

## 1 概述

> 注意:
>
> - Root用户默认被禁止远程(/etc/ssh/sshd_config).
> - 可道云管理员用户(admin)登录时, 会在linux系统创建同名用户(有sudo权限).
> - 可道云管理员用户(admin)改密码时, 会同步修改Root用户密码.
> - 如果有用到端口转发, 只需要映射2个端口：`80`(站点访问) 和 `8001`(onlyoffice解析服务).
{: .important}

完成上述装机步骤之后, 可道云相关服务会在开机时候自启, 不需要额外的设置。若连接有网线, 系统默认以`dhcp`模式自动获取`IP`, 并在开机界面显示。

使用`root`登录终端后, 可以使用`menu`命令回车, 获取常用服务器命令菜单:
![menu](/setup/images/menu.png){:width="400px"}

使用PC端也能搜索到局域网内的teamOS服务器地址([参考](../findteamos/))。

首次访问服务器`IP`地址可以设置KodBox的管理员账号和密码。

## 2 设置管理员账号

使用服务器 `IP`地址在浏览器访问可道云, 或者是 `http://kod.local/` (kod是主机名)访问, 会出现系统安装界面。在这里设置可道云管理员账号密码, 点击“确定”保存, 然后就可以登录了。
![设置管理员](/setup/images/set_admin.png){:width="600px"}

## 3 设置默认存储

> 提示:
>
> - 若系统盘空间充足, 点击`保持默认`即可。
> - 使用定制硬件设备时, 会显示硬盘位置等信息。

登陆后会看到一个弹窗, 提示 **为了您的数据安全, 请指定默认存储位置到非系统盘！**, 需要完成以下步骤：
![强制提示](/setup/images/5.3/start.png){:width="600px"}

点击弹窗中的链接`创建存储池`, 进入磁盘管理页面
![disk_mgr](../images/disk_mgr1.png){:width="800px"}

### 一键构建存储空间

> 提示:
>
> - 这里构建的是软件RAID, 底层由`mdadm`命令管理。

在磁盘管理界面点击`一键构建存储空间`,其中RAID级别有多种选择(可用空间假设有N块盘)
![mraid](../images/mraid.png){:width="600px"}
- `Basic` 将多个磁盘构建成一个lvm卷组, 无备份, 可用空间`N`.
- `RAID 0` 条带, 无备份, 加速读写, 任意盘损失会导致所有数据丢失, 可用空间`N`.
- `RAID 1` 镜像, 可用空间`N/2`.
- `RAID 5` 奇偶检验, 最多能处理1个磁盘故障, 可用空间`N-1`.
- `RAID 6` 双倍奇偶检验, 最多可处理2个磁盘故障, 可用空间`N-2`.
- `RAID 10` 条带镜像，同时有冗余和容错能力, 加速读写, 可用空间`N/2`.

这里以RAID5为例, 至少选择3块磁盘, 点击**创建**即会自动构建RAID阵列并格式化和挂载。
![raid5](../images/raid5.png){:width="600px"}

然后可以看到**存储空间**出现新增的存储
![storage1](../images/storage1.png){:width="800px"}

刚开始点开**RAID设备**会看到警告`MDRAID 设备处于降级状态`, 这是正常的。由于此时RAID阵列还在同步中, 下方可以看到**恢复MDRAID设备**的预估耗时, 警告会在同步完成时自动消失。
![raid_warn](../images/raid_warn.png){:width="800px"}

### 设置默认存储

存储池添加后并不会被使用, 还需要将其设为默认。

在存储池页面, 点击指定存储池文件管理右侧的倒三角 - **设为默认**
![set_default](../images/set_default.png){:width="400px"}

将存储池设置为默认存储后, 新上传的文件都存储到这里（之前的存储可以继续保留, 文件读写不受影响）。
![storage_default](../images/storage_default.png){:width="450px"}

## 4 设置固定IP

1. 进入 **服务器管理**，打开 **网络管理** 页面，可以看到正在使用的网口；
  ![网络管理](../images/ip_addr.png){:width="800px"}

2. 找到已连接的网卡接口，点击进入设置:

    1. IPv4地址默认是自动获取（DHCP）；
    ![网口设置](../images/ip_dhcp.png){:width="600px"}
    2. 点击 **IPV4 自动（DHCP）** 的 **编辑** 按钮，在配置中改成 **手动**，填写IP、网络掩码和网关，然后应用保存。
    ![设置网络](../images/ip_set1.png){:width="500px"}
        - **地址**: 手动
        - **IP**：根据实际填写
        - **网络掩码**：根据实际填写
        - **网关**：根据实际填写, 如下图
    ![ip_set2](../images/ip_set2.png){:width="500px"}
    3. 点击应用保存, 静态IP地址设置成功
    ![ip_static](../images/ip_static.png){:width="600px"}

> **注 意**
>
> - 请确认修改无误再进行保存, 如果IP相关设置不对, 可能无法在浏览器访问网页, 需要在终端使用`menu` 命令重置。
{: .important}

</div>
