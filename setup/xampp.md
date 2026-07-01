---
title: "XAMPP环境可道云网盘的安装示例"
keywords: XAMPP, windows, apache, mariadb
description: 在 Windows 上用 XAMPP 本地搭建 kodbox（适合学习与测试）
---

<div id="xampp" class="tab-pane fade in active" markdown="1">

## 概述

XAMPP 是 Windows 集成环境，内置 Apache（Web 服务器）、MariaDB（兼容 MySQL 的数据库）和 PHP，适合本地学习与测试。

从官网下载最新 [XAMPP for Windows](https://www.apachefriends.org/zh_cn/index.html)：

![XAMPP for Windows](../images/xampp.png){:width="600px"}

安装时只需额外勾选`MySQL, PHP和phpMyAdmin`，其他的都用不到

![xmp_ist](../images/xmp_ist.png){:width="400px"}

## 部署步骤

### 1. 环境准备

#### 1.1 启动检查

打开`XAMPP Control Panel` 并启动`Apache` 和 `MySQL`

  ![xmp_start](../images/xmp_start.png){:width="500px"}

点击Apache右侧的Admin, 确认能正常访问欢迎页面

  ![xmp_dashb](../images/xmp_dashb.png){:width="500px"}

#### 1.2 设置 MySQL 密码

点击XAMPP面板右侧的`Shell`
    - 输入`mysqladmin -u root password`回车
    - 重复输入密码2次 [参考](https://kinsta.com/knowledgebase/xampp-mysql-password/)

    ![xmp_cp](../images/xmp_cp.png){:width="800px"}

#### 1.3 开启相关 PHP 扩展

开启`php-gd`扩展: 编辑`C:\xampp\php\php.ini`，将`extension=gd`前的注释取消

#### 1.4 关闭服务器目录展示

编辑apache配置文件`C:\xampp\apache\conf\httpd.conf`

- 在`<Directory "C:/xampp/htdocs">`下的`Options`这一行中，删除`Indexes`选项
- 修改后需重启apache服务

### 2. 安装 KodBox

点击XAMPP右侧的`Explorer`或直接进入XAMPP安装目录，找到`htdocs`文件夹

  ![xmp_dir](../images/xmp_dir.png){:width="550px"}

在`htdocs`目录下新建`kodbox`文件夹，并[下载kodbox服务端安装包](https://kodcloud.com/download/)解压至此

  ![box_dir](../images/box_dir.png){:width="550px"}

在浏览器访问`http://localhost/kodbox/`，数据库类型选择MySQL, 填写刚才设置的数据库密码，完成KodBox的安装向导

  ![xmp_box](../images/xmp_box.png){:width="500px"}

### 3. 扩展配置

#### 3.1 访问地址不带后缀

当前访问地址为`http://localhost/kodbox/`(或`http://[IP]/kodbox/`)

如果想去掉`/kodbox/`后缀访问，请编辑apache配置文件`C:\xampp\apache\conf\httpd.conf`

- 把`DocumentRoot "C:/xampp/htdocs">`这一行修改为`DocumentRoot "C:/xampp/htdocs/kodbox"`
- 修改后需重启apache服务

#### 3.2 Redis 缓存切换

[参考方法](https://gist.github.com/mtvbrianking/eb7e1dc54d4b85a0a3f27c21fe4d654f)

1. 下载redis的Windows版本 `https://github.com/tporadowski/redis/releases` 并安装，会生成系统服务redis
2. 根据PHP版本/线程安全，下载相应[php_redis.dll](https://pecl.php.net/package/redis/5.3.7/windows), 并拷贝`php_redis.dll`到
`C:\xampp\php\ext\`目录.(PHP8.2 redis扩展[github下载地址](https://github.com/phpredis/phpredis/actions/runs/5916330188#artifacts), )

![php_redis](../images/php_redis.png)
3. 编辑`C:\xampp\php\php.ini`，添加`extension=redis`
4. 重启apache服务
5. 登录后在可道云后台 - 服务器管理，选择`缓存切换`
    - 选择redis进行检测
    - 检测通过后可以执行切换，切换后会自动跳转到登录页面

    ![swh_rds](../images/swh_rds.png){:width="550px"}

</div>
