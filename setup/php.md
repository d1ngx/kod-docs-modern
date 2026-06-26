---
title: "PHP的配置优化"
keywords: nginx, php, MySQL, redis
description: 可道云网盘的依赖环境优化
---

<div id="php" markdown="1">

## PHP

开启pathinfo, 支持webdav协议传输

```console
$ echo "cgi.fix_pathinfo=1" >> /etc/php.ini
```

建议调整`/etc/php.ini`中的如下参数，以实现更好的上传体验

> 提示：
>
> KodBox采用分片上传，这里设置的参数不会影响上传大文件。

```php.ini
max_execution_time = 3600
max_input_time = 3600
memory_limit = 512M
post_max_size = 512M
upload_max_filesize = 512M
```

php-fpm的配置文件位置通常位于`/etc/php/7.4/fpm/`或者`/etc/php-fpm.d/`

以下参数控制php-fpm进程数量，建议根据实际情况适当调整，参考[计算PHP内存消耗](https://spot13.com/pmcalculator/)

```www.conf
pm = dynamic
pm.max_children = 50
pm.start_servers = 20
pm.min_spare_servers = 10
pm.max_spare_servers = 30
pm.max_requests = 500
```

在调整php-fpm配置后，执行`php-fpm -t`检查语法，确定无误后重启服务

```console
$ php-fpm -t
[22-Sep-2022 18:12:21] NOTICE: configuration file /etc/php-fpm.conf test is successful
$ systemctl restart php-fpm
```

</div>
