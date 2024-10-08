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
![menu](/setup/images/menu.png){:width="600px"}

使用PC端也能搜索到局域网内的teamOS服务器地址([参考](../findteamos/))。

首次访问服务器`IP`地址可以设置KodBox的管理员账号和密码。

## 2 设置管理员账号

使用服务器 `IP`地址在浏览器访问可道云, 或者是 `http://kod.local/` (kod是主机名)访问, 会出现系统安装界面。在这里设置可道云管理员账号密码, 点击“确定”保存, 然后就可以登录了。
![设置管理员](/setup/images/5.3/1.png){:width="600px"}

## 3 设置默认存储

登陆后会看到一个弹窗, 提示 **为了您的数据安全, 请指定默认存储位置到非系统盘！**, 需要完成以下步骤：
![强制提示](/setup/images/5.3/start.png){:width="600px"}

点击弹窗中的链接`创建存储池`, 进入磁盘管理页面
![disk_mgr](../images/disk_mgr.png){:width="800px"}

用户可自由选择使用单磁盘存储池或者RAID存储池。

### 创建单磁盘存储池

1. 选中其他一块磁盘进入
![disk_info](../images/disk_info.png){:width="700px"}

2. 点击 **格式化**, 出现二次确认弹窗, 该操作将会清除所有磁盘数据
![disk_format](../images/disk_format.png){:width="600px"}

3. **格式化** 正在进行, 很快便完成
![confirm](../images/confirm.png){:width="600px"}

4. **格式化** 完成, 可以看到自动新增了一个存储池
![storage](../images/storage.png){:width="600px"}

5. 点击存储池进入, 右侧有个`管理磁盘`的链接
![storage_link](../images/storage_link.png){:width="800px"}

6. 点击`管理磁盘`, 进入磁盘详情页, 可以看到挂载点就是存储池的实际存储目录。
![storage_info](../images/storage_info.png){:width="800px"}

### 创建RAID存储池

> **提 示**
>
> - 这里以3块硬盘组建RAID5为例, 用户可以根据实际自行选择RAID级别

1. 进入 **存储管理 - 磁盘管理** 页面, 点击 **创建RAID设备**
    ![raid_add](../images/raid_add.png){:width="650px"}

2. 进入RAID设置页面, 勾选已有硬盘组建RAID阵列, 其中
    - **名称**: 可自定义填写
    - **RAID级别**: 可选0/1/4/5/6/10,这里以RAID5举例(至少需3块盘, 其中一块作为校验盘)
    - **区块大小**: 建议选择64KiB
    - **磁盘**: 勾选添加到RAID阵列的磁盘
    ![raid5_3](../images/raid5_3.png){:width="600px"}

3. 添加完成后开始创建
    ![raid_start](../images/raid_start.png){:width="600px"}

4. 点击进入RAID阵列, 可以看到阵列状态为 **同步中** (若有一块显示降级, 在`RAID5`中这是正常的初始化), 还有预估完成时间
    ![raid_info](../images/raid_info.png){:width="600px"}

5. 在存储页面会发现自动新增了一个RAID存储池
![storage2](../images/storage2.png){:width="600px"}

6. 点击存储池进入, 右侧有个`管理磁盘`的链接
![storage_link](../images/storage_link2.png){:width="850px"}

7. 点击`管理磁盘`, 进入磁盘详情页, 可以看到挂载点就是存储池的实际存储目录。
![raid_info2](../images/raid_info2.png){:width="650px"}

### 设置默认存储

存储池添加后并不会被使用, 还需要将其设为默认。

在存储池页面, 点击指定存储池文件管理右侧的倒三角 - **设为默认**
![set_default](../images/set_default.png){:width="600px"}

将存储池设置为默认存储后, 新上传的文件都存储到这里（之前的存储可以继续保留, 文件读写不受影响）。
![storage_default](../images/storage_default.png){:width="650px"}

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
> 请确认修改无误再进行保存，如果IP相关设置不对，可能无法在浏览器访问网页。
{: .important}

## 5 激活企业版授权

> **提 示**
>
> 如果是购买硬件的用户, 不需要使用授权码, 登录管理员刷新页面后即可自动激活。
>

管理员用户登录以后, 使用授权码激活授权的步骤：

1. 先点击左下方头像 -> **免费版**
2. 然后根据提示点击 **激活授权**
3. 在出现的页面输入授权码, 然后点击 **注册授权** (如果不能联网, 请点击 **离线激活**) 。
![激活授权](../images/5.3/12.png){:width="800px"}

</div>
