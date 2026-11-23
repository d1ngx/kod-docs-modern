---
title: "多云对象存储实战（OSS / COS / MinIO / R2 / S3 与 CORS）"
type: how-to
edition: ["开源版", "企业版"]
minVersion: "1.70"
keywords: ["对象存储", "阿里云 OSS", "腾讯云 COS", "Cloudflare R2", "MinIO", "通用 S3", "移动云", "CORS", "跨域", "Endpoint", "API Token"]
description: "手把手配置阿里云 OSS、腾讯云 COS、MinIO、Cloudflare R2 与通用 S3 对象存储，内置高频报错的 CORS 跨域配置模板与内外网 Endpoint 分流规范。"
---

本指南提供阿里云 OSS、腾讯云 COS、MinIO、Cloudflare R2 及移动云等通用 S3 兼容存储对接 KodBox 的核心参数、可直接复制的 **CORS 跨域配置模板** 以及内外网分流注意事项。选型对比请先查看 [存储策略选型总表](/admin/storage-matrix/)。

## 前置条件

- 已以超级管理员身份登录 KodBox，具备 `后台管理 → 存储/文件 → 存储管理` 操作权限。
- 已在云厂商控制台创建好目标存储桶（Bucket），并建议开启**私有读写**（由 KodBox 签发带时效的临时签名 URL，避免数据公开泄露）。
- 若 KodBox 已启用 HTTPS，**对象存储对外访问域名也必须支持 HTTPS**，否则浏览器会拦截混合内容导致上传或预览失败。

## 一、通用 CORS 跨域配置模板（解决 90% 的直传报错）

使用阿里云 OSS、腾讯云 COS、Cloudflare R2、移动云等 S3 兼容存储开启浏览器直传时，最常见的报错是前端控制台出现 `CORS policy` / `Access-Control-Allow-Origin` 拦截或分片上传进度卡死在 0%。请在对象存储 Bucket 的「跨源资源共享（CORS）」中按以下模板配置：

### 1. 阿里云 OSS / 腾讯云 COS / 移动云 S3 控制台表单参数

| 配置项 | 推荐填写值 | 说明 |
| --- | --- | --- |
| **来源（AllowedOrigins）** | `https://cloud.example.com`（调试期可暂填 `*`） | 填写你的 KodBox 完整协议 + 域名（含非标端口，末尾不加 `/`） |
| **允许方法（AllowedMethods）** | `GET`, `POST`, `PUT`, `DELETE`, `HEAD` | 分片上传依赖 `PUT` 与 `POST`，务必全选 |
| **允许请求头（AllowedHeaders）** | `*` | 放行签名、分片与内容类型请求头 |
| **暴露响应头（ExposeHeaders）** | `ETag`, `x-oss-request-id`, `x-cos-request-id`, `Content-Length` | **极其关键**：未暴露 `ETag` 会导致分片上传合并校验失败！ |
| **缓存时间（MaxAgeSeconds）** | `3600` | 减少浏览器重复发送 `OPTIONS` 预检请求 |

### 2. JSON 格式 CORS 模板（适用于 Cloudflare R2 / AWS S3 / MinIO）

```json
[
  {
    "AllowedOrigins": [
      "https://cloud.example.com"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag",
      "Content-Length"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

> **排错提示**
>
> 如果大文件分片上传一直报错合并失败，90% 是漏填了 `ExposeHeaders: ["ETag"]` 或未勾选 `PUT` 方法。

## 二、主流对象存储核心参数速查

### 1. 阿里云 OSS

- **接入类型**：存储管理 → 新增 → **阿里云 OSS**。
- **AccessKey ID / Secret**：强烈建议在 RAM 控制台创建**独立子账号**，仅授予目标 Bucket 的 `AliyunOSSFullAccess`（或限定单桶策略），避免泄露主账号密钥。
- **地域节点（Endpoint）**：如 `oss-cn-hangzhou.aliyuncs.com`（公网）或同区 ECS 使用 `oss-cn-hangzhou-internal.aliyuncs.com`（见下文内外网分流）。
- **Bucket 权限**：私有读写。

### 2. 腾讯云 COS

- **接入类型**：存储管理 → 新增 → **腾讯云 COS**。
- **Bucket 名称**：注意腾讯云 Bucket 名称包含 `-APPID` 后缀（例如 `kodbox-1250000000`）。
- **所属地域（Region）**：如 `ap-guangzhou`、`ap-shanghai`。
- **CORS**：按上文表格配置，并勾选 `ExposeHeaders` 中的 `ETag`。

### 3. Cloudflare R2（高频踩坑规范）

Cloudflare R2 兼容标准 S3 协议，但与普通 Cloudflare API Token 不同，务必按以下规范创建凭据：

1. **创建专用 R2 API Token**：进入 Cloudflare 控制台 → **R2 Object Storage → 管理 R2 API 令牌（Manage R2 API Tokens） → 创建 API 令牌**。
   - 权限选择：**对象读和写（Object Read & Write）**，并限定到目标 Bucket。
   - 记录生成的 **访问密钥 ID（Access Key ID）** 和 **机密访问密钥（Secret Access Key）**（仅展示一次）。
2. **填写 Endpoint 规范**：
   - 在 KodBox 存储管理中选择 **通用 S3（AWS S3）**。
   - **Endpoint**：`https://<你的Account_ID>.r2.cloudflarestorage.com`（**不要**在 Endpoint 末尾拼接 Bucket 名称）。
   - **Region**：填写 `auto`（部分旧版本客户端若要求填区号，可填 `us-east-1`）。
   - **路径样式**：勾选 Path-Style（路径模式）以避免子域名证书匹配失败。
3. **CORS 与自定义域名**：
   - 在目标 R2 Bucket → **设置 → CORS 策略**中粘贴上文 JSON 模板。
   - 若在国内访问缓慢，可为 Bucket 绑定自定义域名并结合 Cloudflare CDN / 优选方案，同时注意 CDN 缓存策略切勿缓存带签名的私有鉴权响应错误。

### 4. 自建 MinIO

- **接入类型**：存储管理 → 新增 → **通用 S3（AWS S3）**。
- **Endpoint**：填写 MinIO **S3 API 端口地址**（默认 `9000` 端口，例如 `https://s3.example.com`），**不要误填成 MinIO Web 控制台端口（`9001`）**。
- **访问样式**：默认勾选 **Path-Style（路径模式）**；若使用反向代理暴露 MinIO，反代配置需包含 `client_max_body_size 0;` 与 `proxy_buffering off;`。
- **Region**：默认 `us-east-1`（需与 MinIO 环境变量 `MINIO_REGION_NAME` 保持一致）。

## 三、服务器内网中转与公网下载分流注意事项

在阿里云、腾讯云或私有云机房中，常见架构为：**KodBox 服务器通过内网与对象存储高速通信（免公网流量费），而最终用户浏览器通过公网域名直接下载或预览**。配置时请注意：

1. **避免把纯内网 Endpoint 暴露给前端直传**：若填了 `oss-cn-hangzhou-internal.aliyuncs.com` 且开启「前端直传」，用户公网浏览器将无法解析内网域名导致上传直接失败。此时应：
   - 方式 A：关闭前端直传（改由服务器内网中转上传），并在「访问域名 / 自定义域名」中填入**公网 HTTPS 域名**用于外链与下载加速。
   - 方式 B：直接统一使用公网 HTTPS Endpoint 开启浏览器直传（省服务器出口流量），仅在同云大批量迁移时临时走内网。
2. **自定义域名必须开启 HTTPS**：启用自定义绑定域名后，务必在对象存储控制台上传有效 SSL 证书，确保与 KodBox 站点同为 HTTPS 协议。

## 四、验证配置是否生效（Success Check）

保存对象存储配置后，请按顺序完成四项验收：

1. 点击存储管理页的 **「连接测试」**，确认返回连接成功。
2. 进入该存储的 **「文件管理」**，上传一个小于 1 MB 的小文件和一个大于 20 MB 的文件（触发分片上传），确认两个文件均上传成功且无浏览器控制台 CORS 报错。
3. 下载刚刚上传的文件并核对文件内容完整无损；图片/PDF 文件可正常生成预览。
4. 在网盘内删除测试文件后，了解物理对象按回收站与去重周期延迟回收的正常行为（见 [虚拟文件系统与存储托管原理](/concepts/storage-architecture/)）。

## 相关延伸

- 选型对照：[存储策略选型总表](/admin/storage-matrix/)
- 后台存储切换与迁移：[4.1 存储管理](/admin/4.1/)
- 报错字典：[告警与报错字典](/operations/error-dictionary/)
