---
title: "PSD等设计图件格式在线预览组件安装"
keywords: 在线预览, cad在线预览, 在线流程图, office在线编辑, psd在线预览
description: 可道云企业网盘支持数百种常见办公文档格式的在线预览。
---

<div id="setup" class="tab-pane fade in active" markdown="1">

## 环境要求

- 操作系统: windows 7/8/10 以上, windows server 2008/2012/2016 以上
- 建议服务器内存4G以上
- 删除php禁用函数：`exec`、`shell_exec`

## 一、安装相关软件

- [下载安装ImageMagick](https://doc.kodcloud.com/tools/psd/ImageMagick-7.0.7-25-Q8-x64-dll.exe)
下载后双击安装；出现勾选的界面，将未勾选的所有项都勾选上;如下所示:
![imageMagic.png](/setup/images/imageMagic.png)

一直下一步，直到完成；

- [下载安装辅助软件okdo组件](https://doc.kodcloud.com/tools/psd/okdo-document-converter-professional.zip);（该软件用于提供ai,pdf生成缩略图）
一直下一步直到完成(如果提示重启则需要重启后生效)。安装成功默认会自动打开注册界面，不用管关闭即可。

## 二、修改php.ini 超时时间及内存限制

由于超过20M的psd,ai等文件，转换时可能会比较耗时间，所以建议php的超时时间及内存限制给大点(也可以不做调整)

```php.ini
max_execution_time = 3600
max_input_time = 3600
memory_limit = 512M
```

修改保存后，需要重启web服务器才能生效.
</div>
