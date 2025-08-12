---
title: "封面预览组件安装 - imaginary"
keywords: 在线预览, 文件封面, 封面, 缩略图
description: 可道云企业网盘支持数百种常见办公文档格式的在线预览。
---

<div id="thumbnail" class="tab-pane fade in active" markdown="1">

> 提示：
>
> - imaginary 是一个高性能、无状态的图像处理服务，常用于图像缩放、裁剪、格式转换 等操作。
> - kodbox 配合 imaginary能显著提升文件封面图生成效率。
> - arm版本使用`registry.cn-hangzhou.aliyuncs.com/kodcloud/imaginary:arm64`
> - 龙芯版本使用`registry.cn-hangzhou.aliyuncs.com/kodcloud/imaginary:loongarch64`

## 使用docker 安装 imaginary 

```console
$ docker run -itd -p 9000:9000 --name imaginary -m 4g --cpus=4 --restart always \
  registry.cn-hangzhou.aliyuncs.com/kodcloud/imaginary \
  -enable-url-source \
  -concurrency 10 \
  -max-allowed-resolution 500 \
  -key your_api_key_here
```

参数说明

- `-m 4g --cpus=4` 限制最大可用资源4g内存，4cpu.
- `-enable-url-source` 允许从url拉取图像.
- `-concurrency` 处理并发数.
- `-max-allowed-resolution` 最大允许像素，单位MP.
- `-key` API认证密钥.
- ...

或者使用`compose.yml` 配置，参考
```yml
services:
  imaginary:
    image: registry.cn-hangzhou.aliyuncs.com/kodcloud/imaginary:latest
    container_name: imaginary
    restart: always
    ports:
      - 127.0.0.1:9000:9000
    environment:
      - PORT=9000
    command: >
      -enable-url-source
      -concurrency 10
      -max-allowed-resolution 500
    deploy:
      resources:
        limits:
          memory: 4096M  # 等价于 -m 4g
          cpus: '4.0'    # 等价于 --cpus=4
```

完整运行参数请参考 [h2non/imaginary](https://github.com/h2non/imaginary)

然后在封面生成插件中，填写`imaginary`接口地址即可，如`http://[IP]:9000`.

</div>
