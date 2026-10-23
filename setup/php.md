---
title: "PHP的配置优化"
keywords: nginx, php, MySQL, redis
description: PHP 与 php-fpm 参数调优（上传大文件、并发进程）
---

<div id="php" markdown="1">

## PHP

PHP 是可道云的运行语言。以下配置用于优化上传体验和并发处理能力。

开启 pathinfo 支持（WebDAV 协议传输需要）：

```bash
echo "cgi.fix_pathinfo=1" >> /etc/php.ini
```

建议调整 `/etc/php.ini` 中的以下参数，提升大文件上传和处理体验：

> 提示：
>
> KodBox 采用分片上传，这里的 `upload_max_filesize` 限制的是单次请求大小，不影响整体大文件上传。

```php.ini
max_execution_time = 3600
max_input_time = 3600
memory_limit = 512M
post_max_size = 512M
upload_max_filesize = 512M
```

php-fpm 是 PHP 的进程管理器，配置文件通常位于 `/etc/php/7.4/fpm/` 或 `/etc/php-fpm.d/`。

以下参数控制 php-fpm 进程数量，建议根据服务器内存适当调整，参考[计算 PHP 内存消耗](https://spot13.com/pmcalculator/)：

```www.conf
pm = dynamic
pm.max_children = 50
pm.start_servers = 20
pm.min_spare_servers = 10
pm.max_spare_servers = 30
pm.max_requests = 500
```

修改 php-fpm 配置后，用 `php-fpm -t` 检查语法，确认无误再重启服务：

```bash
php-fpm -t
```

示例输出：

```text
[22-Sep-2022 18:12:21] NOTICE: configuration file /etc/php-fpm.conf test is successful
```

继续执行：

```bash
systemctl restart php-fpm
```

</div>
