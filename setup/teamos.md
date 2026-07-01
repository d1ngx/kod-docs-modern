---
title: "2 操作系统安装"
keywords: 系统安装
description: 使用 U 盘安装 teamOS（基于 openEuler）的分步说明
---

<div id="setup" class="tab-pane fade in active" markdown="1">

## 1 要求

- 在 BIOS 中将 U 盘设为第一启动项（BIOS 是主板固件设置界面，用于调整启动顺序）
- 服务器使用网线连接（便于通过 DHCP 自动获取 IP 地址）
- 安装时需连接显示器、鼠标和键盘

## 2 步骤

### 2.1 初始化

1. 将用 Rufus 刻录好的 U 盘插入服务器，开机；
2. 按方向键 **上** 选择第一项 `Install teamOS`，回车开始安装（选第二项会先检测环境，耗时更久）：

  ![开始安装](/setup/images/install1.png){:width="600px"}
3. 等待进入安装界面，选择语言并**继续**

  ![选择语言](/setup/images/install2.png){:width="600px"}

### 2.2 安装过程的主要设置项

在 **安装信息摘要** 页面，**软件选择** 保持默认的 **最小安装** 即可，只需处理带感叹号的必设项。

> 安装过程中有 3 项需要注意：
>
>  1. 安装位置
>  2. 网络和主机名
>  3. Root密码设置

  ![主要设置](/setup/images/install3.png){:width="600px"}

#### 1. 安装位置

选择一块磁盘作为系统盘。

推荐选择自动分区（`Automatic`），至少准备 80GB 空间。

如需手动分区（`Custom`）：

![Custom](/setup/images/diskpart.png)

可点击 `+` 依次创建以下分区（供参考）：
  - `/boot/efi`：600M（UEFI 引导分区）
  - `/boot`：1024M（系统引导）
  - `swap`：8G（虚拟内存交换区）
  - `/`：根分区，大小留空表示使用所有剩余空间

如果提示磁盘被使用过，没有剩余空间，**需要先清除磁盘已有数据**

![回收空间](/setup/images/reclaim.png)
- 点击 **回收空间**，然后点击 **删除所有分区**，然后确认回收即可。

#### 2. 网络和主机名

> 提示:
>
> - 即使此处不设置网络，系统初始化时也会自动开启网口 DHCP 模式（DHCP 即由路由器自动分配 IP）。
> - 当主机名设为 `kod` 时，可在局域网内通过 `kod.local` 访问（其他主机名同理，格式为 `xxx.local`）。

点击**网络和主机名(Network & HostName)**设置，可以提前设置好IP和主机名。

![net_host](/setup/images/net_host.png){:width="600px"}

#### 3. Root 密码

设置 **ROOT密码**，修改全部完成如下图所示

![install4](/setup/images/install4.png){:width="600px"}

### 2.3 开始安装

点击右下角 **开始安装**，系统会自动安装 Nginx、PHP、MySQL、Redis、Docker 等可道云运行所需的依赖环境。

![install5](/setup/images/install5.png){:width="600px"}

等待所有软件安装完成，点击“重启”, **注意及时拔出U盘**(完全黑屏时)。

  ![install5](/setup/images/install6.png){:width="600px"}

#### 设置固定 IP

重启完成后，终端页面会显示服务器 IP 地址（由 DHCP 自动获取）。在浏览器访问该地址即可开始系统初始化，也可使用 PC 客户端的[发现功能](./findteamos.md)。

动态 IP 可能会变化，建议改为固定 IP。使用 `root` 登录终端后，输入 `menu` 打开命令菜单，选择编号 `2` 开始设置，依次输入：

- `网口名称 (连接网线时会自动列出，或`ip a`查看已有网口)`
- `IP`
- `子网掩码prefix (输入完整4位)`
- `网关地址gateway`
- `DNS (回车默认114.114.114.114)`

![static_ip](/setup/images/static_ip.png){:width="600px"}
然后回车确认即可。

</div>
