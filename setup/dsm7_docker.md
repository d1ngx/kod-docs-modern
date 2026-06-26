---
title: "使用Docker安装示例"
keywords: 群晖, docker, dsm7, Container, compose
---

<div id="dsm7_docker" class="tab-pane fade in active" markdown="1">

### 1 安装 Docker 套件

Docker 套件已更名为 `Container Manager`

![container_m](/setup/images/container_m.png){:width="800px"}

### 2 准备 compose 配置

- 打开`File Station`文件管理器，在`docker`下新建`kodbox`目录。
- 在本地新建一个文件`db.env`,修改内容如下(为了安全，请将`your_password`替换为复杂密码):

  ```bash
  MYSQL_ROOT_PASSWORD=your_password
  MYSQL_PASSWORD=your_password
  MYSQL_DATABASE=kodbox
  MYSQL_USER=kodbox
  ```

- 在本地新建一个文件`compose.yml`并拷贝以下配置：

``` yaml
version: '3.5'

services:
  db:
    image: mariadb:lts
    command: --transaction-isolation=READ-COMMITTED
    restart: always
    volumes:
      - "./db:/var/lib/mysql"
    environment:
      - MARIADB_AUTO_UPGRADE=1
      - MARIADB_DISABLE_UPGRADE_BACKUP=1
    env_file:
      - db.env

  app:
    image: kodcloud/kodbox
    restart: always
    ports:
      - 8000:80                 #左边8000是站点使用端口，可以修改
    volumes:
      - "./site:/var/www/html"
    environment:
      - MYSQL_HOST=db
      - REDIS_HOST=redis
    env_file:
      - db.env
    depends_on:
      - db
      - redis

  redis:
    image: redis:alpine
    restart: always

  office:
    image: kodcloud/kodoffice:7.4.1.1
    restart: always
    ports:
      - 8001:80
    environment:
      - PRODUCTION_EDITION=true
      - REDIS_ENABLED=false
      - REDIS_SERVER_HOST=localhost
```

- 将`compose.yml`、`db.env` 上传到kodbox目录，并新建2个空文件夹`site`、`db`.

![file_s](/setup/images/file_s.png){:width="800px"}

### 3 运行 kodbox 项目

1. 进入`Container Manager`，打开**项目** - **新增** - **设置路径** - **选择kodbox目录** - **确定**.

  ![compose0](/setup/images/compose0.png){:width="800px"}
2. 填写项目名称，保持默认继续点击下一步。

  ![compose1](/setup/images/compose1.png){:width="600px"}

  ![compose2](/setup/images/compose2.png){:width="600px"}

  ![compose3](/setup/images/compose3.png){:width="600px"}
3. 项目启动中，等待镜像拉取运行，最后运行有4个容器。

  ![container_all](/setup/images/container_all.png)
4. 等待`3~5分钟`容器内部服务完全启动，在网页从`8000端口`(`compose.yml`中定义) 访问站点，设置新的管理员账号完成初始化。

  ![kodbox_init](/setup/images/kodbox_init.png){:width="800px"}

### 4 验证 onlyoffice 解析服务

登录进入网盘**插件中心**，安装**onlyoffice 插件**

点击**配置插件** - **检测服务器**，验证解析服务运行正常。

  ![onlyoffice](/setup/images/onlyoffice.png)
</div>
