---
title: "可道云数据备份"
keywords: 数据备份
description: 如何完成可道云数据的完整备份和恢复
---

# 可道云备份

可道云备份分为两部分：
> 需要注意：物理数据和MySQL数据库备份时间不能相隔太久，因为数据库中存储着物理文件记录，两者备份时间相隔太久可能出现记录不一致，会导致文件无法下载等问题。

1. 物理数据备份
    * 建议做整站备份，也就是备份整个网站目录。
    * 默认情况下，数据都存放在站点下./data/files目录，如果还有其他存储，也要一并备份。
2. MySQL数据库备份
    * 逻辑备份：导出sql是最快的备份方式。

## 1. 物理数据备份

### 1.1 备份到Linux

### 1.2 备份到Windows

1. 下载[cwrsync_6.2.4_x64_free.zip](https://itefix.net/dl/free-software/cwrsync_6.2.4_x64_free.zip)，解压内容拷贝到目录 `C:\cwrsync`
2. 打开powershell窗口，执行rsync同步命令

    ```bash
    #其中root@172.28.x.x代表服务器地址账号，/var/www/html 代表可道云目录，/d/backup/ 代表windows备份目录d:\backup
    c:\cwrsync\bin\rsync.exe -e 'c:\cwrsync\bin\ssh.exe' -avP root@172.28.x.x:/var/www/html /cygdrive/d/backup/
    ```

## 2. MySQL数据库备份

### 2.1 逻辑备份

mysqldump 是 MySQL自带的备份工具，比较常见。

* 备份一次，其中
  * `BACKUP_DB`：数据库名称
  * `BACKUP_USER`：数据库用户名
  * `BACKUP_PWD`：数据库密码
  * `BACKUP_DIR`：备份指定目录

    ```sql
    mysqldump --single-transaction -u BACKUP_USER -p'BACKUP_PWD' BACKUP_DB > BACKUP_DIR/kodbox.sql
    ```

* 使用脚本定时备份
  * 脚本内容

    ```bash
    #!/bin/bash
    # Set the backup date
    BACKUP_TIME=`date +%Y%m%d%H%M%S`
    BACKUP_DIR=/var/mysql_backups
    BACKUP_HISTORY=3
    BACKUP_USER=xxx
    BACKUP_PWD=xxx
    BACKUP_DB=xxx

    [ -d ${BACKUP_DIR} ] || mkdir ${BACKUP_DIR}

    # Dump database kodbox. 
    mysqldump --single-transaction -u ${BACKUP_USER} -p'${BACKUP_PWD}' ${BACKUP_DB} | gzip -9 > ${BACKUP_DIR}/BACKUP_DB_${BACKUP_TIME}.sql.gz
    if [ $? -ne 0  ];then
        echo "${BACKUP_TIME} mysqldump error " >>  ${BACKUP_DIR}/dump.log
        exit 1
    fi

    # restore with:
    # zcat xxx.sql.gz | mysql -u username -p your_db_name

    find ${BACKUP_DIR} -name "*.sql.gz" -mtime +${BACKUP_HISTORY} |xargs rm -f;
    exit 0
    ```

  * 写入Linux系统计划任务，其中`${BAK_SCRIPT}`换成脚本位置
  
    ```bash
    crontab -l | { cat; echo "0 1 * * * ${BAK_SCRIPT} "; } | crontab -
    ```
