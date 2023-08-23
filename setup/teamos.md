---
title: "5.2 操作系统安装"
keywords: 系统安装
description: 该系统安装步骤与一般openEuler系统安装过程一致
---

<div id="setup" class="tab-pane fade in active" markdown="1">

## 1 要求

- BIOS中设置U盘为第一启动项
- 服务器使用网线连接（方便自动获取IP）
- 服务器安装时需要连接一块显示器及鼠标、键盘

## 2 步骤

### 2.1 初始化

1. 将`rufus`刻录好的U盘插入服务器, 开机；
2. 按方向键 **上** 选择第一项`Install teamOS`, 回车 开始安装（选第二项会检测环境, 耗时更久）：
  ![开始安装](/setup/images/install1.png){:width="600px"}
3. 等待进入安装界面, 选择语言并**继续**
  ![选择语言](/setup/images/install2.png){:width="600px"}

### 2.2 安装过程的主要设置项

在 **安装信息摘要** 页面, **软件选择** 就用默认的 **最小安装** 不需要修改, 只有带感叹号的几项需要设置。

> 安装过程中有3项需要注意：
>
>  1. 安装位置
>  2. 网络和主机名
>  3. Root密码设置

  ![主要设置](/setup/images/install3.png){:width="600px"}

#### 1. 安装位置

> 注意:
>
> 快速分区时, 建议删除`home`分区, 将多余空间分配到根分区.
{: .important}

如果提示磁盘被使用过, 没有剩余空间, **请确认是否能清除数据**, 可以的话点击 **回收空间-全部删除**, 再点 **回收空间** 即可。

#### 2. 网络和主机名

**安装位置** 和 **网络和主机名** 两项设置好后, 继续点击 **开始安装**

#### 3. Root密码

设置 **ROOT密码**, 修改全部完成如下图所示
![install4](/setup/images/install4.png){:width="600px"}

#### 4. 开始安装

点击右下角 **开始安装**, 会自动安装包括 `Nginx/PHP/MySQL/Redis/Docker` 在内的依赖环境。
![install5](/setup/images/install5.png){:width="600px"}

#### 5. 安装完成

等待所有软件安装完成, 点击“重启”, **注意及时拔出U盘**。
  ![install5](/setup/images/install6.png){:width="600px"}

> 提示:
>
> 重启完成后, 登录终端页面会显示服务器 `IP` ( dhcp获取)地址, 在浏览器访问该地址即可开始系统初始化.
</div>
