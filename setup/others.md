---
title: "可道云依赖环境的配置优化"
keywords: nginx, php, MySQL, redis
description: Redis 缓存切换、PSD 预览与 ImageMagick 编译说明
---

<div id="others" markdown="1">

## Redis

Redis 是内存数据库，常用作缓存以加速可道云读写。若安装时未配置 Redis，可在可道云后台 **服务器管理** 中进行「缓存切换」：

- 选择 Redis 并点击检测
- 检测通过后可执行切换，切换完成后会自动跳转到登录页面

  ![swh_rds](../images/swh_rds.png){:width="550px"}

为增强安全性，建议为 Redis 设置访问密码。

编辑 Redis 配置文件（通常为 `/etc/redis.conf`），添加以下配置，将 `password` 替换为实际密码：

```redis.conf
requirepass password
```

然后在 KodBox 站点目录下 `./config/setting_user.php` 中添加相同密码：

```php
$config['cache']['redis']['auth'] = 'password';
```

修改后需重启 Redis 服务：`systemctl restart redis`

## PSD 预览

KodBox 支持 PSD、AI 等设计文件的在线预览，以及 PDF、视频文件的封面缩略图生成。

实现这些功能需要安装 ImageMagick（图像处理）和 ffmpeg（音视频处理）。

在 CentOS 7.9 上，安装方式为：

```console
$ yum install ImageMagick
$ yum install epel-release
$ yum install https://download1.rpmfusion.org/free/el/rpmfusion-free-release-7.noarch.rpm
$ yum install ffmpeg
```

对于 HEIC 格式（iPhone 常用照片格式）的在线预览，需手动编译 ImageMagick 并启用 libheif 支持：

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
