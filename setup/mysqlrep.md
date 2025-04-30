---
title: "MySQL主从双机部署方案"
keywords: MySQL, replication, 双机, NFS
description: MySQL主从双机部署方案
---

<div id="mysqlrep" markdown="1">

## 需求和实现逻辑

- 在A,B 2台机器上配置 MySQL主从同步
- 在A,B 2台机器同时部署网盘应用, 并且站点目录相同( A站点目录通过NFS共享挂载到B)

### 一 环境准备

#### 1. 节点规划

- 主节点（Master）: IP 192.168.xx.10（示例，需替换为实际IP）
- 备节点（Backup）: IP 192.168.xx.11（示例）
- 系统要求: 确保两台服务器时间同步（chronyd服务），防火墙开放相关端口包括`80/443/3306/6379`

```bash
# 若无法联网更新时间，可配置局域网时间同步
yum install chrony -y
firewall-cmd --permanent --add-service=ntp
firewall-cmd --reload

# 服务端打开 /etc/chrony.conf 文件，添加或修改以下内容
# 允许局域网内的客户端访问
allow 192.168.0.0/16

# 本地时间源
local stratum 10

# 记录系统时钟的漂移
driftfile /var/lib/chrony/drift

# 启用内核同步
rtcsync

# 客户端打开 /etc/chrony.conf 文件，添加或修改以下内容
# 指定时间服务器的 IP 地址
server 192.168.1.1 iburst

# 记录系统时钟的漂移
driftfile /var/lib/chrony/drift

# 启用内核同步
rtcsync

# 验证
systemctl restart chronyd
chronyc sources -v  # 应显示服务端IP为同步源
timedatectl         # 确认已同步
```

#### 2. 修改主机名（可选）

```bash
# 主节点
hostnamectl set-hostname master
# 备节点
hostnamectl set-hostname backup
```

### 二 NFS共享目录挂载

#### NFS服务端

```bash
# 关闭selinux
setenforce 0
sed -i "s/SELINUX=enforcing/SELINUX=disabled/g" /etc/selinux/config
sestatus # 确认状态

yum install nfs-utils rpcbind

# cat /etc/exports # 假设/var/www/html 是站点目录
/var/www/html 192.168.xx.1/24(rw,async,no_subtree_check,no_root_squash)

exportfs -rv
systemctl enable rpcbind nfs  # or nfs-server
systemctl restart rpcbind nfs

firewall-cmd --permanent --add-service=nfs
firewall-cmd --permanent --add-service=rpc-bind
firewall-cmd --permanent --add-service=mountd
firewall-cmd --reload
```

#### NFS客户端

```bash
yum install nfs-utils rpcbind
mount -t nfs -o nolock,rw 192.168.xx.10:/var/www/html /var/www/html

#nfsstat 命令可以显示有用的 NFS 信息。例如，以下命令显示 NFS 客户端当前挂载的内容
nfsstat -m

/var/www/html from 192.168.xx.10:/var/www/html
 Flags: rw,relatime,vers=4.2,rsize=524288,wsize=524288,namlen=255,hard,proto=tcp,timeo=600,retrans=2,sec=sys,clientaddr=192.168.xx.11,local_lock=none,addr=192.168.xx.11

# 开机自动挂载
echo "192.168.xx.10:/var/www/html /var/www/html nfs nolock,rw" >> /etc/fstab
umount /var/www/html
mount -a
```

### 三 MySQL主从同步

> 提示：
> 
> - 同步之前确保数据库状态一致，若数据库已创建，就需要同步到到从库。

```sql
-- 主库操作
mysqldump kodbox -u root -p"xxx" > backup_db.sql

-- 从库操作
mysql -u root -p"xxx" kodbox < backup_db.sql
```

- 主库配置文件

```ini
[mysqld]
server-id = 1
log_bin = mysql-bin
binlog_format = ROW
expire_logs_days = 7
max_binlog_size = 100M
```

- 从库配置文件

```ini
[mysqld]
server-id = 2
relay_log = relay-bin
read_only = 1
```

#### 1. 主库操作：创建复制账号

```sql
-- 创建用于复制的用户
GRANT REPLICATION SLAVE ON *.* TO 'repl_user'@'%' IDENTIFIED BY 'repl_password';
FLUSH PRIVILEGES;

-- 查看主库状态（记录 File 和 Position）
SHOW MASTER STATUS;
-- 输出示例：
-- +------------------+----------+--------------+------------------+
-- | File             | Position | Binlog_Do_DB | Binlog_Ignore_DB |
-- +------------------+----------+--------------+------------------+
-- | mysql-bin.000003 |      785 |              |                  |
-- +------------------+----------+--------------+------------------+
```

#### 2. 从库操作：配置主从连接

```sql
-- 设置主库信息（替换 MASTER_HOST 为 master 的IP）
CHANGE MASTER TO
  MASTER_HOST='master',
  MASTER_USER='repl_user',
  MASTER_PASSWORD='repl_password',
  MASTER_PORT=3306,
  MASTER_LOG_FILE='mysql-bin.000003',  -- 替换为 SHOW MASTER STATUS 中的 File
  MASTER_LOG_POS=785;                  -- 替换为 SHOW MASTER STATUS 中的 Position

-- 启动从库复制
START SLAVE;

-- 检查从库状态（Slave_IO_Running 和 Slave_SQL_Running 应为 Yes）
SHOW SLAVE STATUS\G

-- 如果需要重置
-- stop slave;
-- reset slave;
```

#### 3. 验证主从同步

- 在主库创建测试数据,在从库查询数据.
- 故障排查命令

```bash
# 主库确认二进制日志正常
mysql -uroot -pmaster_root_password -e "SHOW BINARY LOGS;"

# 从库查看复制错误
mysql -uroot -pslave_root_password -e "SHOW SLAVE STATUS\G" | grep "Last_IO_Error\|Last_SQL_Error"
```

#### 4. 配置到kodbox

> 注意：
>
> - 数据库主从
> - 指定redis服务器

```php
// 在站点下 config/setting_user.php 文件后新增以下配置
// mysql集群
$config['database']=array(
    'DB_DEPLOY_TYPE'=>1,    //设置分布式数据库支持
    'DB_RW_SEPARATE'=>true, //分布式数据库的读写是否分离
    'DB_TYPE'=>'mysqli',    //数据库类型
    'DB_HOST'=>'192.168.xx.10,192.168.xx.11',//数据库服务器地址
    'DB_NAME'=>'kodbox',    //数据库名称
    'DB_USER'=>'kodbox,kodbox',//数据库用户名
    'DB_PWD'=>'xxx',        //数据库密码
    'DB_PORT'=>'3306,3306', //数据库端口
    'DB_PREFIX'=>'',        //数据表前缀
    'DB_SLAVE_NO' => '',
    //'DB_MASTER_NUM'=>2
);

$config['cache']['sessionType'] = 'redis';
$config['cache']['cacheType'] = 'redis';
$config['cache']['redis']['host'] = '192.168.xx.10';
$config['cache']['redis']['port'] = '6379';
$config['cache']['redis']['auth'] = 'xxx';
```

</div>
