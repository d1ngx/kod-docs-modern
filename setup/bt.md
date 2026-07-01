---
title: "使用宝塔面板搭建可道云网盘示例"
keywords: bt, 宝塔面板
description: 通过宝塔面板一键部署 kodbox，含 LNMP 环境、Redis 缓存与 PHP 参数调整
---

<div id="bt" class="tab-pane fade in active" markdown="1">

## 安装宝塔面板

宝塔面板是 Linux 服务器可视化运维工具，可一键安装 Nginx、MySQL、PHP 等环境。安装方式请[参考宝塔官网](https://www.bt.cn/new/download.html)。

安装宝塔面板后，首次登录会弹出环境安装向导。推荐选择 LNMP 套件，勾选 Nginx、MySQL 和 PHP 即可。

![bt_lnmp](../images/bt_lnmp.png){:width="550px"}

若首次未安装，也可在「应用商店」中搜索并安装：

- **nginx** 1.22
- **php** 8.0
- **MySQL** 8.0
- **redis** 7.0

### 1.安装 KodBox

1. 安装步骤
    - 打开宝塔面板的应用商店
    - 应用分类选择<span class="badge badge-info">一键部署</span>
    - 在列表中找到<span class="badge badge-info">可道云KODBOX</span>, 并点击<span class="badge badge-info">一键部署</span>
    ![一键部署](/setup/images/2/1.png){:width="800px"}

2. 在点击<span class="badge badge-info">一键部署</span>后，会出现填写弹窗
    - **域名**: 填写访问域名，没有的话可以填写服务器IP
    - **根目录**: 可道云站点的安装目录
    - **数据库**: 宝塔会自动创建数据库账号密码，并在提交时自动初始化KodBox数据库
    - **PHP版本**: PHP7.0+版本即可，推荐8.0

    ![部署信息](/setup/images/2/2.png){:width="400px"}

3. 访问上一步填写的域名或服务器地址，设置新账号，然后可以登录

![部署完成](/setup/images/2/3.png){:width="600px"}

### 2.Redis 缓存切换

1. 在应用商店确认redis已安装

    ![bt_rds](/setup/images/bt_rds.png){:width="800px"}

2. PHP设置安装Redis扩展

    ![redis扩展环境图](/setup/images/2/4.png){:width="450px"}

3. 进入kodbox后台管理-服务器管理-缓存切换

    ![redis缓存切换](/setup/images/2/5.png){:width="750px"}

### 3.其他设置

1. 调整PHP参数
    - php.ini

    ![PHP参数](../images/bt_php.png){:width="500px"}

    ```php.ini
    post_max_size = 512M;
    upload_max_filesize = 512M;
    memory_limit = 512M;
    max_execution_time = 3600;
    max_input_time = 3600;
    ```

    - 调整php-fpm超时设置(`request_terminate_timeout = 3600`)

    ![bt_fpm](../images/bt_fpm.png){:width="500px"}

2. PHP开启shell_exec、exec函数（解压等操作会用到），在‘禁用函数’中删除对应项即可。

</div>
