---
title: "概览"
keywords: 功能特性, 快捷键
description: 可道云企业网盘私有化部署概览，包含安装步骤、环境要求与多平台入口
---

<div id="setup" class="tab-pane fade in active" markdown="1">

## 1 手册适用

### 1.1 适用对象

- 本手册面向有一定服务器部署经验的 **IT 人员**。
- 若您是初次接触，建议优先阅读 [TeamOS 一键安装](/setup/2.0/) 或 [Docker](/setup/docker/)、[宝塔面板](/setup/bt/) 等入门方式。
- 普通用户如需使用网盘，请联系管理员获取账号，无需自行部署。

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

要让可道云企业网盘完整可用，通常需要完成以下三部分：

1. 可道云主程序的安装
2. 可选功能组件的安装（文件预览与在线编辑）
3. 管理后台的基础配置

### 2.1 可道云主程序的安装

可道云采用「解压到文件夹即可部署」的方式，服务器需安装 **PHP 5.3 及以上**（推荐 PHP 8.0+）。简要步骤：

1. 搭建 PHP 运行环境（Web 服务器 + PHP + 数据库）
2. 下载最新可道云安装包
3. 将安装包解压到目标目录
4. 为安装目录设置可读写权限（否则无法上传、保存文件）
5. 在浏览器中打开安装向导，按提示配置数据库
6. 完成初始化，使用管理员账号登录

### 2.2 可选功能组件的安装

这些组件用于在浏览器中**预览或编辑** Office、PSD 等文件，可按需安装：

- **OnlyOffice**：Office 文件（Word、Excel、PPT）在线编辑
- **PSD/AI 预览组件**：设计图文件在线预览

### 2.3 管理后台的基础配置

主程序安装完成后，管理员可在后台进行以下设置：

- 导入用户与部门
- 系统参数优化
- 存储空间与权限配置
- 插件配置（如 AD 域、历史版本、水印等）

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

得益于可道云良好平台适应性和兼容性，以及高度的可扩展性，除了常见的以PC、服务器为载体的Windows、Linux系统，您可将其搭建在从百元级别的智能路由器和盒子产品，到NAS网络存储等多系统平台设备上。以下是我们从网络搜集的一些其他平台的搭建方式，供您参考。

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
