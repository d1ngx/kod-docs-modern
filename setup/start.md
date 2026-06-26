---
title: "可道云安装向导"
keywords: kodbox, 环境检测, 初始化, 管理员账号, 安装向导
description: 可道云网盘的安装引导说明
---

<div id="start" markdown="1">

## 快速开始

当满足可道云的先决条件(LNMP环境), 并下载和解压kodbox的服务器端安装包后，完成安装的最后一步是运行安装向导。具体包含以下步骤：

1. 打开Web 浏览器并访问服务器IP地址：`http://[IP]`
2. 确认环境检测无误，点击**下一步**

    ![环境检测](../images/env_chk.png){:width="600px"}

3. 完成数据库配置，点击**确定**

    ![sqlite](../images/db_sqlite.png){:width="650px"}

4. 设置所需管理员的账号和密码，点击**确定**

    ![init_adm](../images/init_adm.png){:width="650px"}

这样就完成了所有步骤，并可以开始使用新的 kodbox 服务器。

当然，你可以做更多的设置来使 kodbox 服务器获得最佳性能和安全性。在以下部分中，我们将介绍重要的安装和安装后步骤。

- [数据库选择](#数据库选择)
- [修改data目录](#修改data目录)
- [文件存储加密](#文件存储加密)

## 数据库选择

`SQLite` 是 kodbox 的默认数据库，它仅适用于测试环境和轻量级单用户体验，我们推荐使用 `MySQL/MariaDB`，需要确保PHP扩展`mysqli`或者`pdo_mysql`其中一个已安装。

这里默认以 root 为数据库登录用户名，是因为 root 有新建数据库的权限，你可以在**数据库**一栏输入任何想要的名称。你也可以提前创建好**数据库**和有相应权限的**数据库用户**，这样就不必使用 root 账号。

系统缓存类型推荐选择 `redis`，需要确保 `redis` 服务已启动，并且PHP扩展`php-redis`已经安装。

    ![db_mysql](../images/db_mysql.png){:width="650px"}

然后设置所需管理员的账号和密码即可完成安装。

## 修改 data 目录

为了安全可以考虑将 kodbox 数据目录定义在 Web 根目录之外，或者出于其他原因，比如想要把数据存储在不同的位置。

这样的需求可以在后台**存储管理**中，添加一个新的存储，并通过指定**存储目录**、**设为默认**来实现。

    ![add_stg](../images/add_stg.png){:width="750px"}

站点下的 data 目录也可也整体迁移至其他位置，比如移动到`/data/`，然后需要在config文件夹下新建`define.php` 并新增一行

```php
<?php define('DATA_PATH','/data/');
```

这里的 `/data/` 可以是任意目录，需要确保 Web 服务器对此有读写权限。

## 文件存储加密

可道云 kodbox 的物理文件默认存储于Web 根目录下的 `./data/files/` 目录，并且保留了原文件格式。

在后台**系统设置** - **安全设置**中，建议将**文件存储加密**调整为**全部加密**。

    ![encrypt_dt](../images/encrypt_dt.png){:width="850px"}

</div>
