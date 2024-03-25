---
title: "适用于DSM 7.1的KodBox套件"
keywords: 群晖, DSM7, nas, spk
---

<div id="dsm7" class="tab-pane fade in active" markdown="1">

## 1. 安装依赖套件

可道云KodBox套件的安装会依赖以下4个套件，请先在套件中心搜索并安装。

- Apache 2.4
- PHP 8.2
- Web Station
- MariaDB 10 （安装时注意需要设置root密码，后面会用到）

## 2. 安装KodBox套件

- 下载最新[KodBox版本spk安装包](https://github.com/KodCloud-dev/dsm/releases/)
- 在套件中心选择**手动安装**并上传`KodBox`的spk安装包
- 由于是第三方套件会有风险提示，这里点击同意（`KodBox`不会影响其他应用，但仍建议提前备份好重要数据）
![warn](../images/dsm/warn.png){:width="650px"}
- 然后输入MariaDB 套件安装时设置的`root`账号密码
![mysql1](../images/dsm/mysql1.png){:width="650px"}
- 数据库名称和用户默认是`kodbox`和`kodbox_user`, 这里设置数据库用户密码，可以自定义填写
![mysql2](../images/dsm/mysql2.png){:width="650px"}
- 配置填写完成，开始安装
![confirm](../images/dsm/confirm.png){:width="650px"}
- 安装完成，点击**打开**即可访问
![access](../images/dsm/access.png){:width="650px"}
- 这里设置可道云初始管理员账号和密码，可以自定义填写，点击**确定**即设置成功，一个全新的可道云站点就安装完成了![admin](../images/dsm/admin.png){:width="650px"}

## 3. 更多设置

### 修改存储位置

- 建议将默认存储位置设置在站点目录之外，这样更安全，也会减少套件更新时间（套件更新时，站点目录会经历2次拷贝）。
- 这里假设已设置好**存储空间2**，并绑定到共享文件夹`data`
![data_add](../images/dsm/data_add.png){:width="650px"}
- 在`File Station`中查看共享文件夹`data`的实际位置是`/volume2/data`
![data_locate](../images/dsm/data_locate.png){:width="650px"}
- 修改`data`的权限，新增用户选择`KodBox`并赋予全部读写权限
![data_priv](../images/dsm/data_priv.png){:width="650px"}
- 打开`WebStation` -> **脚本语言设置** , 选中`KodBox`并编辑`open_basedir`, 这里需要勾选**自定义路径** ，前面不变，并在默认路径后面补充`:/volume2/data`，所以应该填写`/var/services/web_packages/kodbox:/tmp:/var/services/tmp:/volume2/data`
![open_base](../images/dsm/open_base.png)
- 在上述的自定义`open_basedir`保存后，打开可道云后台 -> 存储管理 -> 新增本地存储，分别填写
  - 名称：可自定义填写
  - 空间大小：请根据实际填写
  - 存储目录：`/volume2/data`，这里是`data`共享文件夹的路径，不能填错
  - 设为默认：**一定勾选**，然后新的文件上传都会存储到这里
![storage](../images/dsm/storage.png){:width="650px"}
- 然后保存，如下显示即设置成功
![storage2](../images/dsm/storage2.png){:width="450px"}

### 配置`redis`缓存

- `redis`能极大提高读写效率和访问体验，强烈建议安装。由于默认的套件中心没有`redis`，这里需要添加一个社区源.
- 点击设置-> 套件来源 -> 编辑，名称自定义填写，地址填写`https://packages.synocommunity.com/`
![synoce](../images/dsm/synoce.png){:width="650px"}
- 然后就可以搜到`redis`并安装了
![redis](../images/dsm/redis.png){:width="650px"}
- 接着进入可道云后台 -> 服务器管理 -> 缓存切换，在**检测**通过后点击 **开始执行**即可，这里需要重新登录!
![redis2](../images/dsm/redis2.png){:width="650px"}

### 文件封面生成&视频转码

- 由于群晖默认的`ffmpeg`编码不支持libx264，这里还是需要上述的社区源，搜索并安装`ffmpeg 6`
![ffmpeg2](../images/dsm/ffmpeg.png){:width="650px"}
- 安装完成后，在可道云后台 -> 文件封面生成&视频转码，修改`ffmpeg`调用地址为`/var/packages/ffmpeg6/target/bin/ffmpeg`，这里先**保存**，然后进行**连接测试**，通过即正常。
![ffmpeg2](../images/dsm/ffmpeg2.png)

</div>
