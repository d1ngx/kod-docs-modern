---
title: "Samba插件"
keywords: samba, SMB, 网络共享
description: Samba 局域网共享插件的安装与配置说明，在局域网内共享文件
---

<div id="samba" class="tab-pane fade in active" markdown="1">

## 环境要求

- 此 Samba 插件仅适用于安装了基于 openEuler 的 TeamOS 系统（默认已包含）。
- [TeamOS 系统安装参考](https://bbs.kodcloud.com/d/3789)

## 插件介绍

Samba（也称 SMB/CIFS）是一种局域网文件共享协议。启用后，局域网内的电脑、手机、电视等设备可以直接访问共享目录中的文件。

> **注意**
>
> - SMB 共享目录与网盘部门数据相互独立，是单独的存储空间。
> - SMB 用户首次登录前需单独设置 SMB 密码，与网盘登录密码不通用。
> - SMB 管理员账号名称带有 `smb-` 前缀，如 `smb-admin`；其他 SMB 用户名与网盘一致。
{: .important}


## 配置说明

按以下步骤完成配置：

1. 进入后台 **服务与设备 → 文件服务 → Samba 服务** 页面

    ![samba0](./images/samba0.png){:width="800px"}

2. 手动选择或创建一个 Samba 存储目录

    ![smb1](/admin/images/smb1.png)

3. 连接测试成功后，点击应用保存插件配置

    ![smb3](./images/smb3.png){:width="600px"}
4. 进入文件管理页，在左侧菜单打开 SMB 页面，新建共享目录（如 `share1`）并设置访问权限

    ![smb4](./images/smb4.png)
5. SMB 用户首次登录前需设置密码

    ![smb5](./images/smb5.png){:width="500px"}
6. 在个人 PC 上连接 SMB 共享

    ![smb6](./images/smb6.png){:width="400px"}

</div>
