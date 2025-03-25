---
title: "全文搜索插件"
keywords: 全文搜索, 内容搜索
description: 关于全文搜索插件的配置说明
---

<div id="docsearch" class="tab-pane fade in active" markdown="1">

## 环境要求

- 本节仅适用于单独购买该插件的企业用户。免费用户请忽略本环节。

## 插件介绍

在网盘文件管理页面搜索文件时，若勾选**更多-文件内容**，默认支持对txt等各种纯文本内容搜索，但若需要对PDF,office等文件进行内容搜索，则需要安装此扩展插件。

> **注 意**
> 
> - 需要在插件中心启用，并且**连接测试正常**后方可使用。
> - 全文搜索插件实现逻辑是提取文件内容到数据库，并通过对数据库增加`fulltext`索引实现的。
> - 全文搜索文件内容提取默认每分钟执行一次，在后台服务器管理-计划任务中可以查看。
{: .important}


## 配置说明

1. 在插件中心安装**全文搜索**插件。
2. 在服务器端安装必要支持环境JAVA

   ```bash
   yum install java-11-openjdk
   ```

3. 连接到MySQL数据库，增加`fulltext`索引

   ```sql
   -- 移除旧的索引(不存在报错正常)
    ALTER TABLE `comment` DROP INDEX `content`;
    ALTER TABLE `user` DROP INDEX `name`;
    ALTER TABLE `user_meta` DROP INDEX `value`;
    ALTER TABLE `group` DROP INDEX `name`;
    ALTER TABLE `group_meta` DROP INDEX `value`;
    ALTER TABLE `io_source` DROP INDEX `name`;
    ALTER TABLE `io_source_meta` DROP INDEX `value`;
    ALTER TABLE `io_file_contents` DROP INDEX `content`;

    -- 创建全文索引
    ALTER TABLE `comment` ADD FULLTEXT(`content`);
    ALTER TABLE `user` ADD FULLTEXT(`name`);
    ALTER TABLE `user_meta` ADD FULLTEXT(`value`);
    ALTER TABLE `group` ADD FULLTEXT(`name`);
    ALTER TABLE `group_meta` ADD FULLTEXT(`value`);

    ALTER TABLE `io_source` ADD FULLTEXT(`name`);
    ALTER TABLE `io_source_meta` ADD FULLTEXT(`value`);
    ALTER TABLE `io_file_contents` ADD FULLTEXT(`content`);
   ```

4. 在站点下`config/setting_user.php`文件后新增配置

    ```php
    $config['settingSystemDefault']['searchFulltext'] = 1;  // like%% 转为全文索引  
    $config['settingSystemDefault']['searchFulltextForce'] = 1; // 完整匹配; (否则会对$words进行分词,包含一部分也作为结果;会多出结果)   
    $config['settingSystemDefault']['searchFulltextInnodb'] = 1;
    ```

5. 在插件中心进入**全文搜索**插件配置，检查连接测试是否正常。

</div>
