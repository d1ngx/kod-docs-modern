---
title: "网络端口与反向代理配置总表"
type: reference
edition: ["开源版", "企业版", "teamOS"]
minVersion: "1.70"
keywords: ["端口总表", "防火墙", "端口放行", "80", "443", "3306", "6379", "8001", "9000", "19530", "445", "反向代理"]
description: "企业防火墙与内网隔离部署必备的 KodBox 全套服务网络端口清单、通信方向与安全暴露建议。"
---

本参考表汇总 KodBox 核心服务及全部常见扩展组件使用的默认网络端口、通信方向与公网暴露策略，便于企业安全团队制定防火墙与安全组白名单。

## 一、服务网络端口总表

| 服务组件 | 默认端口 | 协议 | 通信方向 | 是否建议对公网开放 | 备注 |
| --- | --- | --- | --- | --- | --- |
| **KodBox Web / API / WebDAV** | `80` / `443`（或反代非标端口如 `4433`、`8443`） | TCP (HTTP/HTTPS) | 外部用户/客户端 → 反向代理 → KodBox | **是**（强制建议仅开 HTTPS） | Web 端、PC 客户端、App、WebDAV 均复用同一站点端口 |
| **KodBox 容器内部端口** | `80`（常见映射 `127.0.0.1:8080:80`） | TCP (HTTP) | 宿主机反向代理 → KodBox 容器 | **否**（仅本机或内网反代访问） | 避免绕过 HTTPS 直接暴露容器 HTTP |
| **MariaDB / MySQL** | `3306` | TCP | KodBox → 数据库 | **严禁对公网开放** | 仅限 Docker 内网或业务内网安全组互通 |
| **Redis** | `6379` | TCP | KodBox → Redis | **严禁对公网开放** | 建议仅 Docker 内部网络可达，如跨机必须设置强密码 |
| **OnlyOffice / KodOffice** | `8001`（容器内 `80`） | TCP (HTTP/WS) | 反向代理 → OnlyOffice；KodBox ↔ OnlyOffice 双向回调 | **否**（推荐通过 `/office/` 二级目录复用 443） | 独立域名部署时仅开放 HTTPS 443/8443，勿裸露 8001 |
| **Milvus 向量数据库（aiRag）** | `19530`（API）/ `9091`（监控） | TCP (gRPC/HTTP) | KodBox AI 插件 → Milvus | **严禁对公网开放** | 仅部署 AI RAG 知识库时需要 |
| **Samba（SMB/CIFS）** | `445` / `139` | TCP | 局域网终端 → teamOS / SMB 宿主 | **严禁对公网开放** | 仅限企业局域网或 VPN 内访问 |
| **FTP / FTPS** | `21` + 被动端口段（如 `39000-40000`） | TCP | KodBox ↔ 外部 FTP 存储 | 按需限定源 IP | 仅在挂载外部 FTP 存储时放行出站 |
| **AD / LDAP / LDAPS** | `389` / `636` | TCP | KodBox → 企业域控 | 仅内网放行 | 推荐优先使用加密 LDAPS (`636`) |
| **对象存储（OSS / COS / R2 / S3）** | `443`（自建 MinIO 常见 `9000`） | TCP (HTTPS) | 浏览器直传 & KodBox 后端 → 对象存储 | 出站放行 `443` | MinIO 控制台 `9001` 无需对普通用户开放 |

## 二、反向代理必备请求头速查

无论使用 Nginx、Nginx Proxy Manager、Caddy、Traefik 还是企业负载均衡（SLB/F5），代理 KodBox 及其扩展时请确保满足以下五项基础要求：

| 反向代理参数（Nginx 示例） | 作用与缺失后果 |
| --- | --- |
| `proxy_set_header Host $http_host;` | 保留非标准端口号（如 `:4433`），缺失会导致 PC 客户端与 WebDAV 登录重定向失败 |
| `proxy_set_header X-Forwarded-Proto $scheme;` | 让后端识别外部为 HTTPS，缺失会导致混合内容拦截与回调协议错乱 |
| `proxy_set_header X-Real-IP $remote_addr;` | 透传真实客户端 IP，保障登录日志准确与登录管控/2FA 限流正常工作 |
| `client_max_body_size 0;` + `proxy_request_buffering off;` | 解除上传体积限制与避免反代缓存撑爆磁盘，解决 `413` 与大文件上传超时 |
| `Upgrade` & `Connection` 头 + `proxy_read_timeout 3600;` | 保障 OnlyOffice WebSocket 实时协作及大文件合并/导出不断连 |

完整可复制的反代模板请见：[HTTPS 反向代理、非标准端口与 CDN 真实 IP 配置](/setup/reverse-proxy/)。
