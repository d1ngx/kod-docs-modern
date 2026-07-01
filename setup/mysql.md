---
title: "MYSQL的配置优化"
keywords: nginx, php, MySQL, redis
description: MySQL 5.7/8.0 参考配置参数（进阶调优）
---

<div id="others" markdown="1">

## MySQL

MySQL 是关系型数据库。以下为 `/etc/my.cnf` 参考配置，最大内存占用约 6GB。参数含义和计算方法可参考 [MySQL 最大内存占用计算](https://www.mysqlcalculator.com/)。

**MySQL 5.7** 建议调整以下参数：

```ini
skip_name_resolve
log_timestamps=SYSTEM
binlog_cache_size=192K
thread_stack=384K
join_buffer_size=4M

max_heap_table_size=2048M
key_buffer_size=256M
max_allowed_packet=512M
table_open_cache=2048
sort_buffer_size=2M
read_buffer_size=2M
read_rnd_buffer_size=1M
thread_cache_size=256
tmp_table_size=512M
max_connections=400
open_files_limit=65535

innodb_buffer_pool_size=1024M
innodb_log_file_size=2048M
innodb_log_buffer_size=512M
```

**MySQL 8** 建议调整以下参数：

```ini
skip_name_resolve
log_timestamps=SYSTEM
binlog_cache_size=192K
thread_stack=384K
join_buffer_size=4M

max_heap_table_size=2048M
key_buffer_size=256M
max_allowed_packet=512M
table_open_cache=2048
sort_buffer_size=2M
read_buffer_size=2M
read_rnd_buffer_size=1M
thread_cache_size=256
tmp_table_size=512M
max_connections=400
open_files_limit=65535
```

</div>
