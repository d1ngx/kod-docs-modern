---
title: "概览"
keywords: 功能特性, 快捷键
description: 可道云企业网盘的功能特性、常见问题、操作技巧等
---

<div id="setup" class="tab-pane fade in active" markdown="1">

## 1 手册适用

### 1.1 适用对象

- 本手册用于对网站部署及存储系统相对了解的IT从业人员、专业人士或爱好者。
- 普通用户建议联系官网或第三方直接购买相关产品和服务。

### 1.2 版本及更新

| 手册版本 | 适用系统版本 | 更新日期 | 更新内容
| --- | --- |--- |--- |
| v1.34 | Kodbox v1.09 + |2022年09月 | 优化部分内容 |

> 提醒
>
> 可道云旗下有KODBOX和KODExplorer两款产品，本手册更偏向于KODBOX系统的安装部署。点击获取更多KODExplorer信息：
> [**KODExplorer**](https://gitee.com/kalcaddle/KODExplorer){:.newissue.button.btn-primary btn-sm }
{: .important}

## 2 部署速览

可道云企业网盘达到完整可用状态 ，必要的安装部署工作主要包含三个部分：

1. 可道云的安装部署
2. 支持组件/解析服务器的安装部署
3. 管理后台/插件的基本配置

### 2.1 可道云的安装部署

可道云当前版本采用轻量的文件夹目录部署方式，仅需满足PHP 5.3+环境皆可轻松部署。简要安装步骤如下：

1. PHP服务器搭建
2. 下载最新可道云安装包
3. 将可道云文件包解压到您想要放置的目录
4. 设置可道云安装目录为读写权限
5. 配置数据库信息，完成安装导引
6. 浏览器访问

### 2.2 支持组件/解析服务器的安装部署

支持组件主要是指辅助网盘实现文件预览/在线编辑的模块，主要包括：

- OFFICE在线编辑功能模块
- PSD/AI文件预览支持模块

### 2.3 管理后台/插件配置

网盘主体程序安装完成后，用户可以在管理后台进行一些基础设置，包含但不限于：
用户导入

- 配置优化
- 空间、权限配置
- 插件的基础配置（如AD域、历史版本、水印等）
- ...

## 3 私有化部署

<div class="component-container">
    <!--start row-->
    <div class="row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-4 block">
            <div class="component">
                <div class="component-icon">
                    <a href="/setup/docker_win/"><img src="/assets/images/windows_48.svg" alt="For Windows" width="70" height="70"></a>
                </div>
                <h2 id="docker-for-windows/install/"><a href="/setup/docker_win/">Windows</a></h2>
                <p>具备良好的可视化操作环境，设备易得，部署和运维简单明快。</p>
            </div>
        </div>
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-4 block">
            <div class="component">
                <div class="component-icon">
                    <a href="/setup/environment/"><img src="/assets/images/linux_48.svg" alt="or Linux" width="70" height="70"></a>
                </div>
                <h2 id="linux"><a href="/setup/environment/">Linux</a></h2>
                <p>Linux系统有多个分支系统，是在服务器领域应用广泛的操作系统。</p>
            </div>
        </div>
    </div>
</div>

## 4 更多平台体验

得益于可道云良好平台适应性和兼容性，以及高度的可拓展性，除了常见的以PC、服务器为载体的Windows、Linux系统，您可将其搭建在从百元级别的智能路由器和盒子产品，到NAS网络存储等多系统平台设备上。以下是我们从网络搜集的一些其他平台的搭建方式，供您参考。

<div class="component-container">
    <!--start row-->
    <div class="row" style="display: flex; align-items: center; flex-wrap: nowrap;">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-4" style="margin: 0 10px;box-shadow: 0 3px 6px #0b214a17, 0 -2px 2px #0b214a08; height: 140px; display: flex; align-items: center">
        <a href="/setup/dsm7/"><img src="/setup/images/qunhui.png" alt="群晖"></a>
        </div>
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-4" style="margin: 0 10px;box-shadow: 0 3px 6px #0b214a17, 0 -2px 2px #0b214a08; height: 140px; display: flex; align-items: center">
            <a href="/setup/ikuai/"><img src="/setup/images/aikuai.png" alt="爱快"></a>
        </div>
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-4" style="margin: 0 10px;box-shadow: 0 3px 6px #0b214a17, 0 -2px 2px #0b214a08; height: 140px; display: flex; align-items: center">
            <a href="https://post.smzdm.com/p/ar0vpp8z/"><img src="/setup/images/qnap.png" alt="威联通"></a>
        </div>
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-4" style="margin: 0 10px;box-shadow: 0 3px 6px #0b214a17, 0 -2px 2px #0b214a08; height: 140px; display: flex; align-items: center">
            <a href="https://zhuanlan.zhihu.com/p/346247009"><img src="/setup/images/asustor.jpg" alt="华芸"></a>
        </div>
    </div>
</div>
<div class="component-container">
    <!--start row-->
    <div class="row" style="display: flex; align-items: center; flex-wrap: nowrap;">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-4" style="margin: 0 10px;box-shadow: 0 3px 6px #0b214a17, 0 -2px 2px #0b214a08; height: 140px; display: flex; align-items: center">
        <a href="https://zhuanlan.zhihu.com/p/346247009"><img src="/setup/images/tie.png" alt="铁威马"></a>
        </div>
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-4" style="margin: 0 10px;box-shadow: 0 3px 6px #0b214a17, 0 -2px 2px #0b214a08; height: 140px; display: flex; align-items: center">
            <a href="https://www.truenasscale.com/2021/12/18/303.html/"><img src="/setup/images/freenas.png" alt="FreeNAS"></a>
        </div>
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-4" style="margin: 0 10px;box-shadow: 0 3px 6px #0b214a17, 0 -2px 2px #0b214a08; height: 140px; display: flex; align-items: center">
            <a href="https://www.bilibili.com/video/av714546349"><img src="/setup/images/omv.png" alt="openmediavault (omv)"></a>
        </div>
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-4" style="margin: 0 10px;box-shadow: 0 3px 6px #0b214a17, 0 -2px 2px #0b214a08; height: 140px; display: flex; align-items: center">
            <a href="https://forums.unraid.net/topic/145072-unraid/"><img src="/setup/images/unraid.png" alt="unraid"></a>
        </div>
    </div>
</div>

</div>
