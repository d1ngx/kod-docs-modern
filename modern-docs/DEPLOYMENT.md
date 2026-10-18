# 静态部署与模型接入

## 选择部署方式

| 方式 | 所需文件 | 搜索/本地检索 | 模型生成回答 |
| --- | --- | --- | --- |
| 纯静态 | kod-docs-static.zip | 支持，浏览器本地运行 | 不支持 |
| Node / Docker 服务端 | modern-docs-release.zip 源码 | 支持 | 配置模型后支持 |

纯静态 HTML 标记为 static，AI 面板不会请求 `/api/ask`。在静态目录放 `.env`、修改 Nginx 环境变量或仅添加 API 代理，均不会开启模型生成。模型密钥应只配置在服务端。

## 一、上传现成的静态 ZIP

以下以已安装 Nginx 的 Linux 服务器为例；目标服务器无需 Node、pnpm 或 Python。

1. 把 `kod-docs-static.zip` 上传到 `/tmp/kod-docs-static.zip`。
2. 创建独立的发布目录并解压，ZIP 根目录就是 index.html，不要再套一层文件夹：

```sh
release="/srv/kod-docs/releases/$(date +%Y%m%d-%H%M%S)"
sudo mkdir -p "$release"
sudo unzip /tmp/kod-docs-static.zip -d "$release"
sudo ln -sfnT "$release" /srv/kod-docs/current
```

`current` 应为符号链接或尚不存在。若该路径已有普通目录，请先选择新的链接路径并同步修改 Nginx root，不要直接覆盖。确保 Nginx 运行用户对目录有读取及进入权限。

3. 在 `/etc/nginx/conf.d/kod-docs.conf` 添加配置，并把域名替换成自己的：

```nginx
server {
    listen 80;
    server_name docs.example.internal;
    root /srv/kod-docs/current;
    index index.html;
    include mime.types;
    types { text/javascript mjs; }
    add_header Cache-Control "no-cache";
    location / { try_files $uri $uri/ =404; }
    error_page 404 /404.html;
}
```

4. 检查并重载：

```sh
sudo nginx -t
sudo systemctl reload nginx
```

访问 `http://docs.example.internal/`；需要 HTTPS 时在现有网关配置证书或为此 server 增加 TLS。站点须放在域名根路径 `/`，目前不能直接放到 `/docs/` 子目录。IIS/Apache 等服务器同样要支持目录默认 index.html，并正确返回 `.mjs` 的 JavaScript MIME、`.woff2` 的字体 MIME；不要将找不到的脚本改写成首页 HTML。

### 快速更新和回滚

修改源码后在构建机运行：

```sh
pnpm install --frozen-lockfile
pnpm package:static
```

上传新的 `modern-docs/releases/kod-docs-static.zip`，重复创建发布目录、解压和切换链接的步骤。保留旧目录，回滚时把 current 指回旧目录即可。整目录切换可清除被停止发布的旧页面；覆盖上传时容易残留旧 HTML。若使用 CDN，更新后刷新 HTML、ui/ 和 search-index.json 的缓存。

### 验收

- 首页、任意文档、图片及字体均能加载；刷新深层路径正常。
- 搜索“权限”可出现结果；AI 面板显示文档检索模式并列出来源。
- `/setup/check/` 等停发页面应返回 404。
- 若脚本无法运行，检查 `/ui/app.js` 是否返回 JavaScript，而非 404/HTML。

## 二、启用模型生成回答（使用源码部署）

文档服务连接独立的模型服务，不会自行下载或运行模型。支持提供 `/v1/chat/completions` 的兼容接口。需要 `modern-docs-release.zip` 源码包，不能只用静态包。

1. 解压源码并进入含 compose.yaml 的仓库根目录。
2. 复制 `.env.example` 为 `.env`，编辑实际配置：

```sh
cp .env.example .env
```

已有内网模型服务的示例：

```dotenv
DOCS_BIND=127.0.0.1
DOCS_PORT=8088
AI_BASE_URL=http://10.0.0.20:8000/v1
AI_MODEL=your-model-id
AI_API_KEY=replace-with-your-server-key
DOCS_AUTH_USER=
DOCS_AUTH_PASSWORD=
```

- `AI_BASE_URL`：文档服务可访问的模型接口基地址；通常以 `/v1` 结束，不要填完整 `/chat/completions`。
- `AI_MODEL`：接口实际提供的模型 ID，须与模型服务一致。
- `AI_API_KEY`：模型服务签发的密钥；无需鉴权的内网服务可留空。
- `DOCS_BIND=127.0.0.1`：通过同机反向代理访问。需要直接从内网访问时按实际网络控制改绑定地址。

3. 首次构建内容与运行镜像（构建机需要 Node.js 24、pnpm 11.25.0）：

```sh
pnpm install --frozen-lockfile
pnpm build
docker compose up -d --build
```

在服务器本机访问 `http://localhost:8088/`。可让已有 Nginx 将整个站点代理到文档服务：

```nginx
location / {
    proxy_pass http://127.0.0.1:8088;
    proxy_set_header Host $http_host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 70s;
}
```

该 location 放入自己的域名 server 中；此方式由 Node 提供完整站点，保留来源 Host 以通过 API 同源检查。

### Ollama 已安装在宿主机

先用 `ollama list` 查看已安装模型，或准备所需模型，再设置：

```dotenv
AI_BASE_URL=http://host.docker.internal:11434/v1
AI_MODEL=实际已安装的模型名称
AI_API_KEY=
```

`host.docker.internal` 用于容器访问宿主机；模型在其他机器则填该机器的内网地址。Ollama 必须监听文档容器可访问的网卡地址，并限制访问来源。直接以 Node 在同机运行时，可使用 `http://127.0.0.1:11434/v1`。

协议参考：[Ollama 官方兼容接口说明](https://github.com/ollama/ollama/blob/main/docs/api/openai-compatibility.mdx)。示例不代表模型已在当前环境安装或完成真实生成测试。

### 修改配置与验收

仅修改 `.env` 后，重建容器以读取新环境变量：

```sh
docker compose up -d --no-build --pull never --force-recreate
curl http://127.0.0.1:8088/api/health
curl -X POST http://127.0.0.1:8088/api/ask -H 'Content-Type: application/json' -d '{"question":"如何使用 Docker 部署可道云？"}'
```

若配置 Basic Auth，curl 还需加 `-u 用户名` 并按提示输入密码。

- health 的 `aiConfigured: true` 只表示配置已填写，不保证模型连通。
- 问答响应的 `mode: "ai"`、非空 answer 及 sources 才说明本次生成成功。
- `mode: "retrieval"`：地址/模型未配置，或没有可用的检索上下文。
- 502：检查容器到模型的网络、模型 ID、密钥和上游错误；超时需检查模型推理速度。

问题和检索片段会发往所配置模型接口。密钥只保留于 `.env`/服务端环境，不要上传到静态目录、提交 Git 或写入前端脚本。

## 三、日常内容更新不重建镜像

Compose 现在将宿主机 `modern-docs/dist` 只读挂载到容器 `/app/modern-docs/dist`，覆盖镜像内的预置内容。宿主目录必须事先构建好，目录不存在时 Compose 会报错，不会创建空目录遮住站点。

已有部署首次切换到新版 Compose：先构建内容，再重新创建容器以应用挂载；已有兼容运行镜像时无需构建：

```sh
pnpm build
pnpm check
docker compose up -d --no-build --pull never --force-recreate
```

后续修改 Markdown、菜单、Logo、字体、样式或前端脚本，在维护窗口执行：

```sh
docker compose stop docs
pnpm build
pnpm check
docker compose up -d --no-build --pull never
```

每条命令成功后再执行下一条。构建会替换 dist，停止服务可避免构建过程中读到不完整页面；启动时后端重新加载最新搜索和 AI 检索索引。若已经在构建机完成内容替换，则执行 `docker compose restart docs` 即可。

### 构建机生成内容包，部署机不安装 Node

```sh
pnpm package:content
```

生成 `modern-docs/releases/kod-docs-content.zip`。将其上传至部署机：停服务，在新的空目录解压，保证该目录根部有 index.html 和 search-index.json；在 `.env` 设置：

```dotenv
DOCS_CONTENT_DIR=/srv/kod-docs/releases/your-release
```

再执行 `docker compose up -d --no-build --pull never --force-recreate`。切换挂载目录时必须重建容器，单纯 restart 不会更新挂载源。保留上一个目录，回滚时将 DOCS_CONTENT_DIR 改回原路径后再次 force-recreate。

**模型后端使用 kod-docs-content.zip，不要用 kod-docs-static.zip 替换挂载内容**：后者前端固定运行本地检索模式。两种内容包均不包含模型密钥或后端运行程序。

| 修改内容 | 操作 |
| --- | --- |
| Markdown、菜单、前端样式/脚本 | 构建或上传服务端内容包，然后重启容器 |
| 模型地址、模型 ID、密钥、认证设置 | 修改 .env，使用 --no-build --pull never --force-recreate |
| DOCS_CONTENT_DIR 挂载路径 | 修改 .env，使用 --no-build --pull never --force-recreate |
| server.mjs、后端 search.js 或运行依赖 | 重建运行镜像，再创建容器 |

镜像仅承担 Node 与后端程序；站点内容可单独更新。需要回到完全由镜像提供内容的方式，可移除 Compose 的 volumes 挂载后重新创建容器。

## Windows PowerShell 无需全局 pnpm 的构建入口

当前源码提供根目录 `build.cmd`，可直接在 PowerShell 运行，不受 `.ps1` 执行策略影响：

```powershell
.\build.cmd          # 构建服务端内容并检查链接
.\build.cmd content  # 生成服务端内容 ZIP
.\build.cmd static   # 生成纯静态 ZIP
.\build.cmd check    # 仅检查服务端内容
```

入口优先使用 PATH 中的 Node.js；如果没有，则尝试当前用户已经安装的 Codex 内置 Node。没有任何 Node 时会明确提示安装 Node.js 24。它不修改系统 PATH，也不安装全局 pnpm。

首次在一台普通 Windows 机器使用源码时：安装 [Node.js 24](https://nodejs.org/)，关闭并重新打开 PowerShell，然后在仓库根目录运行：

```powershell
node --version
npm.cmd install --no-package-lock
.\build.cmd
```

`.cmd` 后缀用于避免 PowerShell 将 npm 解析成受执行策略限制的 npm.ps1。若仍希望使用原来的 pnpm 命令，可运行 `npm.cmd install -g pnpm@11.25.0` 后重开终端，或使用 `pnpm.cmd`；项目本身不要求必须全局安装 pnpm。

日常更新容器内容：

```powershell
docker compose stop docs
.\build.cmd
docker compose up -d --no-build --pull never
```

每步成功后再继续；首次应用新 Compose 挂载时，最后一步加 `--force-recreate`。
