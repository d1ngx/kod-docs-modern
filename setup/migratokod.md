---
title: "迁移数据到可道云"
keywords: 迁移,可道云
description: 如何将其他系统的现有数据导入到可道云
---

<div id="migratokod" class="tab-pane fade in active" markdown="1">

## 概述

迁移数据到可道云主要分为两个步骤：

1. 搭建好一个全新的可道云站点
2. 将待迁移数据同步至可道云所在服务器, 然后由可道云管理员将服务器上文件移动到个人空间/部门空间

### 迁移NAS数据到可道云

第一步搭建站点可以参考安装教程, 第二步这里以NAS为例。

假设NAS上需要迁移的目录是 `/volume1/web`, 可道云服务器地址为 `root@172.28.10.10` , 服务器站点目录为 `/var/www/html`

1. 开启NAS上的`ssh`和`rsync`功能
2. 通过`ssh`登录NAS终端, 然后执行同步命令

    ```bash
    # 因为有用sudo, 先输入NAS的管理员密码, 弹出ssh连接输入yes后再输远程服务器密码
    sudo rsync -av /volume1/web root@172.28.10.10:/var/www/html
    ```

3. 可道云管理员登录后打开文件管理页面, 文件地址栏输入地址 `./` 回车进入站点根目录, 找到`web`目录并右键剪切, 进入文件管理 -> 个人空间 并右键**粘贴**, 等待执行完成即可。

</div>
