---
title: "PSD 等设计图文件在线预览组件安装"
keywords: 在线预览, cad在线预览, 在线流程图, office在线编辑, psd在线预览
description: 在 Windows 服务器上安装 ImageMagick 等组件，支持 PSD/AI 预览
---

<div id="psd_win" class="tab-pane fade in active" markdown="1">

## 环境要求

- 操作系统：Windows 7/8/10 及以上，或 Windows Server 2008/2012/2016 及以上
- 建议服务器内存 4GB 以上
- 需在 PHP 配置中删除禁用函数：`exec`、`shell_exec`（PSD 转换需要调用外部程序）

## 一、安装相关软件

- [下载安装 ImageMagick](https://doc.kodcloud.com/tools/psd/ImageMagick-7.0.7-25-Q8-x64-dll.exe)

  双击安装；在组件选择界面，将未勾选的项全部勾选，如下所示：
![imageMagic.png](/setup/images/imageMagic.png)

一直下一步，直到完成。

- [下载安装 okdo 辅助组件](https://doc.kodcloud.com/tools/psd/okdo-document-converter-professional.zip)（用于 AI、PDF 缩略图生成）

  一直下一步直到完成（若提示重启则重启后生效）。安装成功可能自动打开注册界面，关闭即可。

## 二、修改 php.ini 超时时间及内存限制

超过 20MB 的 PSD、AI 等文件转换较耗时，建议适当增大 PHP 超时时间和内存限制（也可保持默认）：

```php.ini
max_execution_time = 3600
max_input_time = 3600
memory_limit = 512M
```

修改保存后，需要重启web服务器才能生效。
</div>
