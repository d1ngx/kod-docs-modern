---
title: "MYSQL的配置优化"
keywords: nginx, php, MySQL, redis
description: 可道云网盘的依赖环境优化
---

<div id="others" markdown="1">

## MySQL

`/etc/my.cnf`参考配置，最大内存占用`6G`左右，参考计算方法[MySQL最大内存占用计算](https://www.mysqlcalculator.com/)

`MySQL5.7`建议调整以下参数

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

`MySQL8`建议调整以下参数

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
