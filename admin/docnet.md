---
title: "内网穿透插件"
keywords: 插件安装, 内网穿透, docnet
description: 关于内网穿透插件安装、配置的相关说明
---

<div id="docnet" class="tab-pane fade in active" markdown="1">

### 概述

采用frp转发方案，`kodview.com` 作为转发域名中转服务器，给每台kod节点分配二级域名，根据二级域名路由转发。

### 配置插件

管理员登录后，点左下头像进入**后台管理**。

1. 在插件中心确认**内网穿透**插件已安装。

![docnet1](../images/docnet0.png){:width="650px"}
2. 在**服务与设备**--**网络管理**
    - 未配置时，显示"配置并启用"
    - 已配置时，显示访问域名及服务运行状态。
3. 启用穿透配置: 填写二级域名,内网访问站点url(默认自动获取填写)

 ![docnet1](../images/docnet1.png){:width="800px"}
    立即启用，运行状态如下则正常

 ![docnet2](../images/docnet2.png){:width="650px"}

</div>
