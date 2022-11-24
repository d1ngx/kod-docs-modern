---
title: "可道云依赖环境的配置优化"
keywords: nginx, php, MySQL, redis
description: 可道云网盘的依赖环境优化
---

<div id="others" markdown="1">

## Redis

如果安装时未选择redis, 登录后在可道云后台 - 服务器管理, 可以进行`缓存切换`

- 选择redis进行检测
- 检测通过后可以执行切换, 切换后会自动跳转到登录页面
  ![swh_rds](../images/swh_rds.png){:width="550px"}

为增强安全性, 建议增加redis密码配置。

编辑redis配置文件, 通常是`/etc/redis.conf`, 添加如下配置, 将其中的`password`替换为您的redis密码。

```redis.conf
requirepass password
```

然后在`KodBox`的根目录下`./config/setting_user.php`文件中添加如下配置, 将其中的`password`替换为您的redis密码。

```php
$config['cache']['redis']['auth'] = 'password'; 
```

需要重启redis服务, 执行`systemctl restart redis`

## PSD

`KodBox`支持`PSD`、`AI`等文件预览, 还有`pdf`、视频文件的封面缩略图生成。

实现这些需要安装`ImageMagick`和`ffmpeg`。

在CentOS 7.9 上, 安装方式为

```console
$ yum install ImageMagick
$ yum install epel-release
$ yum install https://download1.rpmfusion.org/free/el/rpmfusion-free-release-7.noarch.rpm
$ yum install ffmpeg
```

对于`HEIC`格式的在线预览, 则需要手动编译`ImageMagick`以增加支持。

```console
$ export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig
$ yum remove ImageMagick -y
$ yum install gcc gcc-c++ autoconf automake libtool
$ yum install -y fftw fftw-devel fftw-devel bzip2-devel freetype-devel libjpeg-devel libpng-devel libtiff-devel giflib-devel zlib-devel ghostscript-devel djvulibre-devel libwmf-devel jasper-devel  libX11-devel libXext-devel libXt-devel lcms-devel libxml2-devel librsvg2-devel OpenEXR-devel openjpeg openjpeg-devel  openjpeg2 openjpeg2-devel openjpeg2-libs  gcc gcc-c++  make automake  libtool   libtool-ltdl-devel lcms2  lcms2-devel LibRaw LibRaw-devel

$ cd /usr/src/ 
$ git clone https://github.com/strukturag/libde265.git  
$ git clone https://github.com/strukturag/libheif.git
$ git clone --depth 1 --branch 7.1.0-46 https://github.com/ImageMagick/ImageMagick.git
$ cd libde265/ 
$ ./autogen.sh && ./configure && make && make install 
$ cd /usr/src/libheif/ 
$ ./autogen.sh && ./configure && make && make install 
$ cd /usr/src/ImageMagick
$ ./configure
$ make -j 8
$ make install
$ ldconfig /usr/local/lib
$ identify --version
```

</div>
