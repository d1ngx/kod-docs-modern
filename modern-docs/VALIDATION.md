# 验证记录

验证日期：2026-10-17（Asia/Shanghai）。

## 构建与内容

- Node.js v24.19.0 本机构建成功。
- 生成 138 篇文档：137 篇原文 + 新增“配置优化参考”索引。
- 全部文档正文中的本地链接和图片文件检查通过，缺失引用 0 条。
- `git diff --check` 通过。
- 迁移时修复了 Markdown 相对链接、嵌套 app/PC 图片目录、过期 TeamOS 安装链接和 OnlyOffice HTTPS 链接；两处原仓库不存在的截图替换为同义文字操作说明。

## 自动化测试

`node --test modern-docs/tests/site.test.mjs`：6 组通过，0 失败。

1. 中文和中英混合检索、自然语言 Docker 问题、空查询和无结果查询。
2. 全部 138 个文档 URL、首页、图片、代码与标题渲染、GitLab 编辑地址、301/308 类目录规范化（实际状态 308）、404、API 输入校验、跨站限制、无模型检索与路径访问限制。
3. 私有访问认证覆盖页面、图片、全文索引及 API。
4. 模拟兼容模型验证模型名称、Authorization、检索上下文、返回答案及来源，前端响应不包含密钥。
5. 模型上游失败和空答案处理。
6. AI API 每分钟限流。

## Docker 与浏览器

- Docker Desktop 29.8.2 引擎构建 `kod-docs:1.0.0` 成功。
- Docker Compose 在本机环回地址 18786 端口运行成功；默认 8080 已被其他服务占用。
- 容器 `/api/health` 返回 `status: ok`、`documents: 138`、`aiConfigured: false`。
- 浏览器确认首页、搜索弹窗、Docker 搜索结果、文档正文、目录、Git 编辑地址、AI 检索回答和可点击来源。
- 本机截图位于 `modern-docs/test-results/home-v2.png`、`modern-docs/test-results/article-v2.png`、`modern-docs/test-results/ai-v2.png`，不纳入源码包。

## 尚未执行的环境验收

- 未配置真实模型服务；真实模型生成、可用性及答案质量未实测。模型接口使用本地模拟服务验证。
- CI 工作流已提供，但尚未在远程 GitLab/GitHub Runner 上运行。
- 未实际配置企业 HTTPS、SSO 或测试断网服务器；已提供相应部署说明。
- 内容检查不执行原文运维命令、不检查外部网址，也不代表全部产品说明已更新到最新产品版本。

本次没有创建远程仓库、推送或公开发布内容。

## 原站视觉对齐改版

- 对照 Docker Docs 首页和正文模板，重做蓝色顶栏、公告、点阵背景、问答框、入口卡片、折叠导航、正文工具与右侧目录。
- AI 改为右侧全高抽屉，搜索支持键盘选择，增加原始 Markdown 查看与复制。
- 浏览器实际验证首页、正文、搜索跳转、AI 抽屉与检索来源；当前浏览器视口约 1000px。移动端断点已实现，但本轮未在真实手机上验收。
- 新增 Markdown 和 WOFF2 响应类型测试；字体与图形资源本地提供，附许可证。

### 本轮 Docker 重建限制

2026-10-17 两次执行 Docker Compose build，均在获取 Docker Hub 的 node:24-alpine 元数据时返回 EOF。上面的容器验收记录属于此前版本；本轮新版只完成 Node 本地构建、自动化测试和浏览器验证，未声称新版镜像构建成功。联网恢复后运行 docker compose up -d --build。
## 2026-10-17 可道云原站内容恢复与静态发布

- 首页恢复六类文档入口、客户端/操作体验/预览/分享/管理五组主题、品牌介绍、最佳实践、开发接口、视频/下载/社区和四组页脚链接。
- 使用原仓库 docs-logo.png、主题插图、#2496ed 顶栏和 #002c66 页脚；增强左侧目录蓝底、竖线、粗体、父级展开及层级线。
- 构建保留服务端版本，新增独立 static-dist 及 ZIP；静态版检索在浏览器本地执行。
- 使用 Python 静态 HTTP 服务实际验证主题切换、中文搜索及无后端检索来源、正文目录高亮；未配置真实模型。
- 检查范围扩大到首页本地链接；外站链接保留原站目的地，不代表外部服务可用性验收。
- 本轮未重建 Docker 镜像；部署方式和前次 Docker Hub 限制记录保持不变。
### 本轮细节修复与最终验收

- 首页五组插图改为 img 元素，在 Node 服务的 CSP 下检查可正常加载。
- 正文页页脚随页面主题变色；说明为灰色提示框，注意为红色提示框。
- 安装概览改为 Markdown 平台表格；修复固定 IP 页列表缩进；不再显示旧 HTML 注释或错误代码块。
- 指定 5 篇页面不发布（原稿保留），最终发布 133 篇；6 个配置索引引用改为可用的 Nginx 配置说明。
- 最终 7 组自动化测试通过，服务端版与静态版本地链接均为 0 缺失；未发布页面的 HTML、Markdown、搜索和站点地图排除已测试。
- 本轮截图：home-v3.png、sidebar-v3.png、topics-v3.png、callouts-v3.png（test-results 目录）。
### 中文字体改版验收

- 本地 Noto Sans SC 可变字体子集：347,344 bytes；Sarasa Mono SC Regular 子集：164,444 bytes。保留 OFL 许可证，子集家族重命名为 Kod Docs Sans / Kod Docs Mono。
- 中文正文 16px、1.8 倍行高；标题与选中菜单 600 字重；代码区 14px、1.75 倍行高。
- 字体结构与常用中文字形校验通过；代码字体英文宽 500、中文宽 1000，中文占两个等宽字符位。
- Node 服务下浏览器检查正文和代码区域，截图：test-results/typography-v4.png。
- 133 篇文档服务端及静态构建成功，链接检查 0 缺失，7 组测试全部通过（含两套本地字体 WOFF2 响应检查）。
- 新增字体子集刷新脚本，常规构建及内网部署不需 Python 或联网下载字体。
### 顶栏对齐与部署说明

- 导航链接改为全高居中，选中下划线改用独立伪元素，Logo 固定显示尺寸并调整内部留白的视觉偏移。
- 浏览器验证首页顶栏；截图 test-results/header-v5.png。
- 新增 DEPLOYMENT.md，包含静态 ZIP 解压、Nginx、版本切换/回滚、服务端模型地址/ID/密钥及验收方式，随静态包提供。
- 文档及 .env.example 的默认宿主端口统一为 8088，与 compose.yaml 一致。
- 133 篇构建、服务端/静态链接检查以及 7 组测试全部通过。真实模型接入仍需目标环境配置与验收。
### 2026-10-18 内容更新与容器镜像解耦

- 默认 Compose 使用只读 bind mount，将 DOCS_CONTENT_DIR（默认 modern-docs/dist）挂载到 /app/modern-docs/dist；create_host_path=false 防止空目录误启动。
- 新增 pnpm package:content，输出服务端内容 ZIP，可在独立构建机生成再上传；纯静态 ZIP 仍独立保留。
- 使用现有缓存 kod-docs:1.0.0 镜像，以 --no-build --pull never 创建隔离测试容器，确认加载 133 篇新文档。
- Docker inspect 确认挂载 RW=false；容器写入测试返回 EROFS；restart 后文档数量仍为 133，镜像 ID 前后一致。本轮未重建或拉取镜像。
- 此容器验证针对内容挂载与重启，未据此声称缓存镜像包含所有最新后端代码；后端代码变更仍需要更新镜像。
- 7 组自动化测试通过，服务端与静态本地链接 0 缺失；部署与离线说明已更新。
### Windows 构建入口修复

2026-10-18：原构建使用 Codex 内置 pnpm，其 PATH 不保证存在于用户 PowerShell。新增 build.cmd 和 windows-build.mjs，优先发现用户 Node，兼容本机已有 Codex Node；无需全局 pnpm。首次安装依赖提供 npm.cmd install --no-package-lock。实际执行 build、content、static 入口通过，均构建 133 篇且本地链接 0 缺失；未修改用户系统 PATH 或全局工具。
### 2026-10-18 首页模板同步与导航居中

- 根因：新版读取 home-content.html 的复制内容，原 landing.html 的更新未进入构建。
- 新增 landing.mjs，在构建时读取 _layouts/landing.html 内容区与原 banner include；移除过期的独立内容副本，保留用户修改的下载/教学链接。
- 保持主题切换、图片 CSP 兼容与旧锚点适配；Dockerfile 同步复制所需模板目录。
- 顶栏改为三列网格，Logo 左侧、菜单居中、操作区右侧；浏览器测量菜单与顶栏中心均为 632.5px。
- 浏览器确认两个链接均指向用户模板中的新地址；截图 test-results/home-centered-v6.png。
- 133 篇链接检查 0 缺失，8 组测试全部通过，包含首页模板变更传递的回归测试。
### 2026-10-18 GitHub 新仓库整理

- 首页顶栏 Logo、菜单与操作区整体居中；内容页 Logo 与菜单从左排列，操作区靠右。浏览器核对两种布局，截图 home-final.png。
- 页脚直接读取 _includes/footer.html，保留用户对原模板的更新，不再维护重复副本。
- 旧 Ruby/Jekyll 插件、配置、主题样式/脚本、未使用字体及下载工具缓存移出工作目录，保存在仓库外本地备份；文档原稿、图片、版权许可证与 Git 历史保留。
- 新仓库为 https://github.com/d1ngx/kod-docs-modern（私有）；默认 Git 编辑、反馈、仓库及 Actions 入口同步更新为 GitHub。
- GitHub Actions 构建测试并上传静态包与服务端内容包，不因普通内容提交构建运行镜像。
- 清理后 133 篇文档正常构建，服务端与静态内容本地引用 0 缺失，8 组测试通过（含首页和页脚模板同步）。
### GitHub 远端验收与历史归档清理

- main 已成功推送到 d1ngx/kod-docs-modern，仓库为私有，默认分支 main。临时传输分支已删除。
- 初次大包传输发现历史包含生成归档 site.tgz/site.tar。新仓库历史排除这两条路径，源代码提交保留；清理前后最新源码树完全一致。本地 codex/pre-github-clean 分支保留原始历史，原 GitLab 远端作为 upstream 保留。
- 清理资源的本地备份位于仓库父目录 kod-docs-cleanup-backup-20261018-115938，不提交依赖、密钥、构建产物或工具缓存。
- GitHub Actions 的 push 与 workflow_dispatch 均出现 startup_failure / BuildFailed，jobs=0，无构建日志；没有据此声称远端 CI 通过。权限已启用，工作流能被 API 正确识别，平台启动原因尚未确定。
- 已验证 Node 24 对应 Action 标签，并将上传产物 Action 更新为 v7；产物缺失时明确报错。当前可靠验收依据为本机 8 组测试及已校验的部署包。
