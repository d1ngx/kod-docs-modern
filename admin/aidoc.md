---
title: "AI助手插件"
keywords: 插件安装, AI,  aidoc
description: 关于内AI助手插件安装、配置的相关说明
---

<div id="aidoc" class="tab-pane fade in active" markdown="1">

> **注意：**
>
> - 需要购买 pro 版本的 AI 插件，才能添加自定义模型。
{: .important}

# AI智能助手

## 功能概述

- **深度集成网盘**: 让AI能针对文件,文件夹内容做问答,整理等丰富功能;全面打通网盘文件增删改查等能力;

- **自定义智能体**: 配置工具,知识库,对话上下文引用,模型等配置; 丰富不同场景的应用生态; 支持分组;

- **AI输出渲染**: markdown实时增量渲染,支持图片,公式,代码块等,支持流程图,思维导图等图表渲染;支持部分代码在线预览运行;

- **智能体一键分享**: 一键将智能体分享给外部用户使用,方便作为特定工具,智能客服等丰富应用场景;

- **会话与服务管理**: 管理用户对话,会话,模型服务; 支持将精选对话内容进行收藏,便于快捷查看; 收藏会话支持一键外链分享;

- **模型与服务集成**: 接入多个模型(DeepSeek, Qwen,本地大模型等),统一调用和管理;

- **安全与隔离机制**: 防止数据串用、越权操作, 文件获取能力天然集成网盘可访问信逻辑,无需担心数据泄露;

...

## RAG配置说明


-  模型服务名称: 自定义填写
-  API地址: 
    - 如硅基流动为 `https://api.siliconflow.cn/v1/chat/completions`
    - 如阿里云为 `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`
-  API密钥: 如硅基流动获取 `https://cloud.siliconflow.cn/me/account/ak`

![-Aj.png](/admin/images/ai/-Aj.png)

### 向量数据库部署

- [https://milvus.io/docs/zh 参考说明](https://milvus.io/docs/zh/install_standalone-docker-compose.md)

```console
$ curl -SL https://static.box.kodcloud.com/plugins/teamos/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose
$ chmod +x /usr/local/bin/docker-compose

$ mkdir milvus && cd milvus
$ wget http://static.box.kodcloud.com/update/milvus-standalone-docker-compose.yml -O docker-compose.yml

$ docker-compose up -d

Creating milvus-etcd  ... done
Creating milvus-minio ... done
Creating milvus-standalone ... done
```

### 向量/嵌入模型添加

1. 模型广场搜索 `BAAI/bge-m3` 适用embedding嵌入模型；
2. 添加模型
	a. 模型ID `BAAI/bge-m3`
    b. 模型名称： 自定义填写
    c. 模型类型： 嵌入模型
![20251209-152408-uo.png](/admin/images/ai/-uo.png)
3. 保存后检测是否正常
![20251209-152555-GR.png](/admin/images/ai/-GR.png)

### 图生文本模型添加

1. 模型广场搜索 `Qwen/Qwen3-Omni-30B-A3B-Instruct` 适用于多模态；
2. 添加模型
	a. 模型ID `Qwen/Qwen3-Omni-30B-A3B-Instruct`
    b. 模型名称： 自定义填写
    c. 模型类型： 图片描述提取
![20251209-152738-KP.png](/admin/images/ai/-KP.png)
3. 保存后检测是否正常
![20251209-152823-an.png](/admin/images/ai/-an.png)

### RAG配置项

1. 启用RAG
![20251209-152928-7s.png](/admin/images/ai/-7s.png)
2.  配置向量数据库，并检测通过
![20251209-153027-IE.png](/admin/images/ai/-IE.png)
3. 指定向量模型， 并检测通过
![20251209-153104-Gu.png](/admin/images/ai/-Gu.png)
4.  指定图片描述提取模型和 扫描文件夹
![20251209-153221-29.png](/admin/images/ai/1-29.png)
5.  保存设置，等待文件入库和向量化，或立即手动更新。
![20251209-153417-BC.png](/admin/images/ai/9BC.png)

</div>
