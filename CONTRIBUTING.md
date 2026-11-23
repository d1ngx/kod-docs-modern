# 文档贡献与写作规范（Docs-as-Code）

本仓库维护可道云（KodBox）新一代官方文档站源码。与面向私有部署运维的 [modern-docs/DEPLOYMENT.md](./modern-docs/DEPLOYMENT.md) 不同，本文档规范**教程内容的架构分类、Markdown 写作标准、RAG 检索适配与发布前自动化质检**。

## 一、信息架构：Diátaxis 四象限原则

为避免新手入门、任务步骤、底层原理与参数字典混写导致阅读冗长或 AI 召回失真，所有文档按 Diátaxis 四象限明确单页定位：

| 文档类型 (`type`) | 读者意图 | 典型目录 | 写作边界 |
| --- | --- | --- | --- |
| `tutorial`（新手教程） | 跟着唯一推荐路径跑通体验 | `/start/quickstart/`、`/user/quickstart/` | 不展开多种替代方案，确保读者尽快看到可验证的成功结果 |
| `how-to`（实战指南） | 解决一个具体部署、集成或运维任务 | `/setup/`、`/admin/`、`/operations/` | 只写前置条件、可执行步骤、验证结果与常见报错速查，原理通过短链指向 `/concepts/` |
| `explanation`（核心原理） | 理解为什么这样设计、权衡与边界 | `/concepts/` | 讲透机制、优先级与取舍，不夹杂冗长的逐行安装命令 |
| `reference`（技术参考） | 精确查阅端口、参数、错误码、API 与变更日志 | `/reference/`、`/operations/error-dictionary/` | 保持客观、结构化（表格/字典），便于复制核对 |

## 二、标准 Frontmatter 规范

每篇新增或重构的 Markdown 文档必须在顶部声明结构化 Frontmatter。构建脚本 `modern-docs/build.mjs` 会自动解析以下字段用于页面标签展示、本地搜索（`search-index.json`）及 AI 问答（`/api/ask`）召回加权：

```yaml
---
title: "使用 Docker 部署 OnlyOffice 并接入 KodBox"
type: how-to
edition: ["开源版", "企业版"]
minVersion: "1.70"
keywords: ["OnlyOffice", "KodOffice", "JWT", "HTTPS", "文档安全令牌的格式不正确"]
description: "通过 Docker Compose 部署 OnlyOffice 文档服务并与启用 HTTPS 的 KodBox 完成安全对接（含 v1.70+ JWT 鉴权与内网回环优化）。"
redirect_from:
  - /setup/old-office-path/
---
```

字段说明：

- `title`（必填）：页面主标题，使用具象化动宾或名词短语。
- `type`（推荐）：`tutorial`、`how-to`、`explanation` 或 `reference`。
- `edition`（按需）：适用授权版本，如 `["开源版", "企业版"]`、`["企业版"]`、`["开源版", "企业版", "teamOS"]`。
- `minVersion`（按需）：功能引入或行为变更的最低适用版本，例如 `"1.70"` 或 `"1.70.03"`。
- `stability`（按需）：社区/实验性功能标注为 `experimental`（页面自动渲染「实验性扩展」标签）。
- `keywords`（推荐）：数组或逗号分隔字符串，优先填入产品术语、英文缩写、同义词与**高频报错原文**。
- `description`（必填）：1–2 句自包含摘要，用于页面导语、SEO 与 `llms.txt`。
- `redirect_from`（按需）：旧路径迁移重定向列表（必须以 `/` 开头和结尾）。

## 三、面向人类与 AI（RAG）的五项写作约束

`kod-docs-modern` 同时服务于浏览器端本地检索与服务端 `/api/ask` 生成式问答。请严格遵循以下五项约束：

1. **首段两句自包含摘要**：文章开头及每个二级标题下的第一段，用 1–2 句话直接给出结论或适用边界；避免使用“如下所示”“同上”等依赖上文的代词，确保切片单独召回时语义完整。
2. **具象化标题命名**：杜绝泛化标题（如“配置说明”“注意事项”“常见问题”），统一改为包含实体与动作的语义标题（如“配置 Nginx 反向代理以支持非 443 端口访问”“修复迁移后 OnlyOffice 提示文档安全令牌格式不正确”）。
3. **原样保留界面与日志报错字符串**：排错文档必须逐字保留用户实际看到的报错原文（如 `database is locked`、`该文档不存在！`、`文档安全令牌的格式不正确`、`This XML file does not appear to have any style information`），提升检索精准命中率。
4. **代码块禁止包含终端提示符**：不要在命令前写入 `$ `、`# `、`[root@host ~]# `、`PS C:\>` 或 `mysql>`，确保一键复制即可执行（测试套件会自动拦截含提示符的代码块）。
5. **实战指南必带「验证结果（Success Check）」**：每个任务型指南结尾必须给出可执行的验收动作（如点击检测按钮、检查响应状态或核对权限边界）。

## 四、标准「实战指南（How-to）」模板

新建任务型文档时，可直接复制以下骨架：

```markdown
---
title: "使用 Docker 部署 OnlyOffice 并接入 KodBox"
type: how-to
edition: ["开源版", "企业版"]
minVersion: "1.70"
keywords: ["OnlyOffice", "KodOffice", "JWT", "HTTPS", "文档安全令牌"]
description: "通过 Docker Compose 部署 OnlyOffice 并与启用 HTTPS 的 KodBox 完成安全对接。"
---

本指南帮助你通过 Docker 完成 OnlyOffice 文档服务部署，并与启用 HTTPS 的 KodBox 完成安全对接（含 v1.70+ JWT 鉴权与内网优先回调配置）。

## 前置条件

- 已正常运行 KodBox（建议 v1.70.03+），且已通过 Nginx 配置有效 HTTPS 证书。
- 服务器剩余内存 ≥ 4 GB，已安装 Docker 及 Compose 插件。

## 1. 部署服务容器并启用鉴权

（仅写可执行步骤与代码块，不夹杂冗长架构原理）

## 2. 在 KodBox 后台完成对接配置

（列出必填参数与关键开关）

## 3. 验证配置是否生效（Success Check）

- 在插件配置页点击「检测服务器」，确认关键检测项通过。
- 使用普通「预览者」账号打开测试文件，验证界面渲染与权限控制符合预期。

## 常见报错速查

- **提示「文档安全令牌的格式不正确」**：通常发生在迁移或重装插件后 JWT 密钥不一致……
- **开启 HTTPS 后检测失败**：检查回调地址是否仍为 HTTP……

## 相关延伸

- 核心原理：[插件机制与多端同步架构](/concepts/plugins-and-sync/)
- 排错字典：[告警与报错字典](/operations/error-dictionary/)
```

## 五、提交前自动化质检与发版流程

### 1. 本地构建与零死链校验

每次新增或修改文档后，合并前必须运行构建、链接校验与测试：

```bash
pnpm build && pnpm check && pnpm test
```

Windows PowerShell 环境可使用根目录脚本：

```powershell
.\build.cmd
```

确认输出 `0 source content references missing` 且所有自动化测试通过。

### 2. `/api/ask` 高频问题回归评测

仓库内置了覆盖 25+ 社区高频痛点的评测脚本 [scripts/eval-ask.mjs](./scripts/eval-ask.mjs)：

```bash
# 本地检索索引回归校验（无需启动服务端）
node scripts/eval-ask.mjs

# 对已运行的文档服务端（含大模型生成）执行真实 /api/ask 验收
node scripts/eval-ask.mjs --url http://127.0.0.1:8088
```

若启用了大模型，脚本会验证响应为 `mode: "ai"` 且 `sources` 准确命中对应专题页面。

### 3. 版本联动发布检查清单

当 KodBox 发布新版本时，按以下顺序同步文档并热发布：

1. 在 [reference/changelog.md](./reference/changelog.md) 记录新增特性、安全修复与行为变更。
2. 若涉及配置项变更或破坏性升级，同步更新 [operations/upgrade.md](./operations/upgrade.md)。
3. 将新出现的社区高频故障原文沉淀至 [operations/error-dictionary.md](./operations/error-dictionary.md)。
4. 设置真实域名环境变量并生成内容包热更新（参考 [modern-docs/DEPLOYMENT.md](./modern-docs/DEPLOYMENT.md)）：

```bash
DOCS_SITE_URL=https://docs.example.com pnpm package:content
```
