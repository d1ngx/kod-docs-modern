---
title: "内网穿透插件"
keywords: 插件安装, 内网穿透, docnet
description: 内网穿透插件说明：通过 frp 为内网部署的可道云分配公网访问地址
---

<div id="docnet" class="tab-pane fade in active" markdown="1">

### 概述

内网穿透插件采用 frp 转发方案，通过 `kodview.com` 作为中转服务器，为每台可道云节点分配一个二级域名，外部用户可通过该域名访问内网部署的网盘。

### 配置插件

管理员登录后，点击左下角头像进入**后台管理**。

1. 在插件中心确认**内网穿透**插件已安装。

![docnet1](../images/docnet0.png){:width="650px"}
2. 进入**服务与设备 → 网络管理**
    - 未配置时，显示「配置并启用」
    - 已配置时，显示访问域名及服务运行状态
3. 填写穿透配置：
    - **二级域名**：自定义子域名前缀
    - **内网访问站点 URL**：默认可自动获取，也可手动填写

 ![docnet1](../images/docnet1.png){:width="800px"}

    点击立即启用，若运行状态显示正常，说明配置成功。

 ![docnet2](../images/docnet2.png){:width="650px"}

</div>
