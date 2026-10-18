# 可道云现代文档站

可道云中文帮助文档源码。

仓库：[d1ngx/kod-docs-modern](https://github.com/d1ngx/kod-docs-modern) · [CI 构建记录](https://github.com/d1ngx/kod-docs-modern/actions)

文档内容来自 [原 kod-docs](https://gitlab.com/d1ng/kod-docs)，保留原有内容与许可证。新版仅保留 Node 文档站使用的模板与资产。

新版提供可私有化部署的文档站、中文本地搜索、Git 编辑跳转与可配置 AI 问答。

```sh
pnpm install --frozen-lockfile
pnpm build
# First deployment, or after changing server code/dependencies:
docker compose up -d --build
```

访问 `http://localhost:8088`。

完整的部署、内网 AI、认证、离线镜像、内容配置和测试说明见 [现代文档站说明](modern-docs/README.md)。

纯静态发布：运行 `pnpm package:static`，上传 `modern-docs/releases/kod-docs-static.zip`，无需在目标服务器运行 Node。详见部署说明。
默认 Compose 已只读挂载 `modern-docs/dist`，修改文档和样式无需重新构建镜像。首次增加挂载或切换 `DOCS_CONTENT_DIR` 时执行 `docker compose up -d --no-build --pull never --force-recreate`。日常内容更新流程见 [DEPLOYMENT.md](modern-docs/DEPLOYMENT.md#三日常内容更新不重建镜像)。

在其他构建机运行 `pnpm package:content` 可生成服务端内容包，部署机上传解压后挂载该目录即可，保留模型后端能力。
Windows 用户也可直接运行 `.\build.cmd`；生成服务端/静态部署包分别使用 `.\build.cmd content`、`.\build.cmd static`。首次使用需 Node.js 24，并运行 `npm.cmd install --no-package-lock` 安装构建依赖。
