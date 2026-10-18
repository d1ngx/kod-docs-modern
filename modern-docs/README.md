# 可道云现代文档站

依据现有 kod-docs 内容开发，可自建、可离线运行。参考 [Docker Docs](https://github.com/docker/docs) 当前主分支的文档导航、三栏阅读、编辑跳转、搜索和 AI 入口，页面布局、配色与交互参照原站中文化重做，复用的字体、背景与助手插画及许可证见 [THIRD_PARTY.md](THIRD_PARTY.md)。不依赖 Docker 的在线搜索或 AI 服务。Docker Docs 的官方实现使用 Hugo 和其服务组件；本项目使用 Node.js 静态构建和轻量 API，以直接兼容现有 Jekyll Markdown 并简化私有部署。

## 已包含

- 当前发布 133 篇文档；5 篇旧版或未完成页面保留在源码但不发布；中文首页、五类文档、原路径、嵌套目录、本页目录、面包屑、前后篇、404 页面。
- Markdown 表格、代码高亮、代码复制、图片、Jekyll/Kramdown 旧标记兼容；补齐嵌套图片目录、修复旧相对链接。
- 浏览器端全文搜索、中文分词、中英混合检索、分类筛选、Ctrl/Cmd K、结果摘要；索引随镜像提供，无外部搜索服务。
- AI 文档问答：文档分块、检索上下文、服务端调用模型、来源链接、超时/失败提示、限流。支持实现 `/v1/chat/completions` 的兼容服务，包括 Ollama、vLLM、LM Studio 等。
- GitLab/GitHub 编辑跳转，可替换仓库、分支和内容前缀。
- 深浅色切换、移动端布局、原生键盘可操作弹窗、跳转正文链接。
- 全站可选 Basic Auth、非 root 只读容器、健康检查；GitHub Actions。
- Sitemap、llms.txt，无在线字体、CDN 脚本或遥测。原文中的外部链接或远程图片仍可能访问其原地址。

## 一键启动

在**仓库根目录**运行（需要 Node.js 24、pnpm 11.25.0 和 Docker；不是 modern-docs 子目录）。首次创建内容目录后再启动：

```sh
pnpm install --frozen-lockfile
pnpm build
# First deployment, or after changing server code/dependencies:
docker compose up -d --build
```

访问 `http://localhost:8088`。默认绑定 `127.0.0.1`。端口冲突时在根目录 `.env` 中设置 `DOCS_PORT=18786`。

### 私网访问与认证

复制 `.env.example` 为 `.env`，再按需求修改：

```dotenv
DOCS_BIND=0.0.0.0
DOCS_PORT=8088
DOCS_AUTH_USER=reader
DOCS_AUTH_PASSWORD=替换为强密码
```

使用现有内网 HTTPS 反向代理、VPN 或网络访问控制限制访问范围。Basic Auth 同时保护 HTML、图片、全文索引和 AI API；用户名与密码必须同时设置。需要 SSO 时可使用现有企业身份代理保护整个站点。

## 连接私有 AI

模型服务独立部署。以宿主机已有 Ollama 为例，先准备模型，再配置 `.env`：

```dotenv
AI_BASE_URL=http://host.docker.internal:11434/v1
AI_MODEL=qwen3:8b
AI_API_KEY=
```

模型名称需与实际服务中已安装的模型一致。容器必须能够访问该接口：确保 Ollama 监听可被 Docker 访问的地址，并用防火墙限制来源。其他服务器上的 vLLM 等服务，改填其内网地址，例如 `http://10.0.0.20:8000/v1`。不要填到 `/chat/completions`，服务器会自动追加。

```sh
docker compose up -d --no-build --pull never --force-recreate
```

`GET /api/health` 中 `aiConfigured: true` 表示地址和模型已配置，**不代表模型连通性测试已通过**；实际发送问题确认生成回答及引用。API 密钥仅保留在服务端环境变量。问题及检索到的文档片段会发送至所配置模型服务。

未设置 `AI_BASE_URL` 和 `AI_MODEL` 时自动进入文档检索模式，界面明确标识。该模式提供原文片段和来源，不伪装成模型生成回答。

## 本地开发与测试

需要 Node.js 24 或更高版本和 pnpm 11.25.0：

```sh
npm install -g pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm build
pnpm check
pnpm test
pnpm start
```

修改 Markdown、目录或前端后需重新执行 `pnpm build`；重启服务使 AI 检索加载新索引。`pnpm dev` 会先构建，再监听服务器文件变化；**不自动监听 Markdown 和前端资产**。

`pnpm check` 检查全部文档正文中的本地链接和图片文件，发现缺失会返回非零状态。报告位于 `modern-docs/test-results/content-audit.json`。文件检查不验证外部站点可达性；测试不执行原文中的运维命令。

自动化测试覆盖全部生成页面、中文检索、图片资源、编辑链接、认证保护、路径访问限制、无模型检索、模型请求格式和来源、模型失败、输入校验、跨站限制及限流。真实模型连通性与答案质量需在部署环境中验收。

## 内容及仓库配置

- 内容继续维护在 `start/`、`setup/`、`user/`、`admin/`、`guide/`，编辑链接直接指向这些源文件。
- 左侧目录读取 `_data/toc.yaml`。未在目录登记的文档仍可通过搜索和“此分类全部文档”访问。
- `modern-docs/site.config.json` 控制站点信息和 Git 编辑地址：

```json
{
  "repository": "https://github.com/your-org/kod-docs",
  "branch": "main",
  "gitProvider": "github",
  "sourcePrefix": "",
  "siteUrl": "https://docs.example.internal"
}
```

以上是需要修改的字段，保留配置中的其他字段。`gitProvider` 使用 `github` 或 `gitlab`。文档位于新仓库子目录时，`sourcePrefix` 例如 `docs/`（保留末尾斜线）。`siteUrl` 用于 Sitemap，改动后重新构建镜像。

可将当前目录作为新仓库源码导入 GitHub/GitLab，再更新该配置。不需要 Docker Docs 的 Git 历史或在线 API。内容和原始资产继续遵循根目录 LICENSE；依赖遵循各自许可证。

## 离线私有部署

在可联网且架构与目标环境相同的机器构建镜像：

```sh
docker build -t kod-docs:1.0.0 .
docker save -o kod-docs-1.0.0.tar kod-docs:1.0.0
```

将镜像包、`compose.yaml`、`.env.example`，以及构建好的 **modern-docs/dist 整个目录**拷贝到内网机器（保持相对路径，或设置 DOCS_CONTENT_DIR）：

```sh
docker load -i kod-docs-1.0.0.tar
docker compose up -d --no-build --pull never
```

运行阶段无需安装 Node/npm、访问包仓库或访问外部 AI 服务。使用 AI 时须另行部署内网模型，并准备相应模型文件。纯静态托管请使用下文的 `pnpm package:static`，不要将服务端版 dist 误当成纯静态版。

## HTTPS 代理示例

已有 Nginx 的服务器可将流量转发给默认环回地址的服务：

```nginx
server {
    listen 443 ssl;
    server_name docs.example.internal;
    ssl_certificate /etc/nginx/certs/docs.crt;
    ssl_certificate_key /etc/nginx/certs/docs.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://127.0.0.1:8088;
        proxy_set_header Host $http_host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 70s;
    }
}
```

本服务不信任客户端传入的 `X-Forwarded-For`；AI 默认按直接连接 IP 每分钟限 12 次。代理后用户会共享该限额，大规模使用应在可信网关增加用户级鉴权/限流并调整服务端策略。

## 运维

```sh
docker compose logs --tail=100 docs
docker compose ps
docker compose down
```

原始文档仍含不同年代的软件示例。本次更新的是文档站程序及迁移兼容性，没有对所有第三方产品的安装命令、版本和许可逐一重新核验。站点版本标记 `latest` 表示当前内容集，不是 kodbox 产品版本。
## 纯静态构建与快速更新

无需 Docker，也无需在目标服务器安装 Node。构建机使用 Node.js 24 和 pnpm：

```sh
pnpm install --frozen-lockfile
pnpm package:static
```

- 静态目录：`modern-docs/static-dist/`
- 可直接上传的 ZIP：`modern-docs/releases/kod-docs-static.zip`（根目录即 `index.html`）
- 只构建不打包：`pnpm build:static`
- 检查静态版全部文档及首页本地链接：`node modern-docs/check.mjs --static`

将 ZIP 解压到 Nginx、Apache、IIS 或对象存储的网站**域名根目录**，须启用目录索引 `index.html`。当前路径以 `/` 开头，不支持直接放在 `/docs/` 子目录，也不要双击以 `file://` 方式打开。IIS 等服务器需将 `.mjs` 映射为 `text/javascript`、`.woff2` 映射为 `font/woff2`。

纯静态版保留全文搜索、中文分词、分类筛选、主题切换、目录高亮、Git 编辑链接、Markdown 查看/复制和本地文档检索。AI 面板明确显示检索模式，不会请求 `/api/ask`，也不会在浏览器保存模型密钥。需要模型生成回答时，使用原有 `pnpm build` + Node/Docker 部署方式。

示例 Nginx 配置见 `modern-docs/nginx-static.conf`。本地预览可运行：

```sh
python -m http.server 8088 --directory modern-docs/static-dist
```

访问 `http://localhost:8088/`。每次修改内容后重新执行 `pnpm package:static`，把新包解压到新的版本目录并切换网站根目录/符号链接；保留旧目录可快速回滚。若直接覆盖，需同时更新 HTML、`ui/` 和 `search-index.json` 并清理已删除页面，不要只上传 Markdown。建议 HTML、索引及未带内容哈希的脚本使用 `Cache-Control: no-cache`，更新后让客户端重新验证缓存。

首页内容直接维护在 `_layouts/landing.html`（构建时自动适配），页脚维护在 `_includes/footer.html`；Logo、主题图标使用原仓库 `assets/images/`，品牌及目录样式位于 `modern-docs/public/kodcloud.css`。

## 内容发布控制

`modern-docs/publication.json` 记录暂不发布的页面及原因。目前排除 `setup/5.2.md`、`setup/5.3.md`、`setup/check.md`、`setup/configuration.md`、`setup/oss.md`。原稿保留供复核；排除页不会生成 HTML、原始 Markdown、搜索索引、站点地图或相邻页面入口。其旧 URL 返回 404，部署更新时须清理旧发布目录，推荐整目录切换。

Markdown front matter 可设置 `draft: true` 或 `published: false`，空正文也不会发布。构建结果记录在 `modern-docs/test-results/publication-report.json`。复核完成后移除排除项再重新打包。

## 中文字体与排版

正文、标题和导航使用本地 Noto Sans SC（思源黑体同源的简体中文字体），代码区域使用 Sarasa Mono SC（等距更纱黑体）。正文为 16px、1.8 倍行高，标题和选中目录为 600 字重。字形子集以 `Kod Docs Sans` / `Kod Docs Mono` 名称分发，许可证随字体保留。

字体位于 `modern-docs/public/vendor/`，正常构建、静态部署和内网运行都不访问外部字体服务。`font-display: swap` 允许先显示系统字体；未纳入子集的新增字符回退到苹方、微软雅黑等系统字体。

新增大量文档用字后，可在构建机刷新子集（仅此步骤需要 Python 和首次联网下载上游字体）：

```sh
python -m pip install fonttools brotli py7zr
python modern-docs/subset-fonts.py
pnpm package:static
```

日常 `pnpm build` / `pnpm package:static` 直接使用随源码提供的 WOFF2，无需 Python。排版样式在 `modern-docs/public/typography.css` 中统一维护。

完整的静态 ZIP 上传、Nginx 配置及模型配置步骤见 [DEPLOYMENT.md](DEPLOYMENT.md)。

## 日常更新无需重建镜像

默认 Compose 将 `DOCS_CONTENT_DIR`（默认 `./modern-docs/dist`）只读挂载到容器内容目录。首次启动前须 `pnpm build`；修改内容可在维护窗口 stop → build → check → up --no-build，或上传构建机生成的 `pnpm package:content` 内容包后重启。切换挂载目录和修改模型配置需 force-recreate。只有服务端代码或运行依赖变化才需要更新镜像。完整命令及回滚步骤见 [DEPLOYMENT.md](DEPLOYMENT.md#三日常内容更新不重建镜像)。
Windows PowerShell 如果提示找不到 pnpm，可直接运行根目录 ` .\build.cmd ` 构建并检查；首次缺依赖时，在安装 Node.js 24 后运行 `npm.cmd install --no-package-lock`。详见 [Windows 构建说明](DEPLOYMENT.md#windows-powershell-无需全局-pnpm-的构建入口)。

首页内容区的卡片、主题文案、教学视频及资料下载链接直接读取 `_layouts/landing.html`；新版顶栏、搜索和 AI 由 `modern-docs/theme.mjs` 渲染，栏目读取 `modern-docs/site.config.json`。原模板中的 Bootstrap 交互与内联背景由构建适配器转换，无需维护第二份首页内容。

默认编辑链接与文档反馈指向 [d1ngx/kod-docs-modern](https://github.com/d1ngx/kod-docs-modern)。首页顶栏整体居中，内容页 Logo 与导航从左侧排列。旧 Ruby/Jekyll 构建链、未使用的主题资源与字体下载缓存已移出；保留文档原稿及许可证。
