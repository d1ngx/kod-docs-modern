# 第三方设计与资产

本主题根据 Docker Docs 于 2026-10-17 的公开主分支及在线站点适配，借鉴其文档布局与交互，现已恢复可道云品牌、首页内容与色彩，并使用下述中文字体及本地服务。

- 上游：https://github.com/docker/docs
- 布局参考：`layouts/home.html`、`layouts/baseof.html`、`layouts/_partials/header.html`、`layouts/_partials/gordon-chat.html`
- 色彩与字体参考：`assets/css/theme.css`、`assets/css/style.css`
- `gordon.svg`、`gordon-robot.svg` 来自 Docker Docs。
- Docker Docs copyright © 2013–2026 Docker, Inc.，Apache-2.0。许可证副本：`public/vendor/docker-docs-LICENSE.txt`。

主题模板、中文文案和交互经过本项目修改。此项目不代表 Docker 官方站点；Docker 的在线 AI、统计和营销组件未接入。

## 中文字体改版

- Noto Sans SC 上游：[google/fonts](https://github.com/google/fonts/tree/main/ofl/notosanssc)，可变字体 100–900 字重，SIL Open Font License 1.1。许可证：`public/vendor/NotoSansSC-OFL.txt`。
- Sarasa Mono SC 上游：[Sarasa Gothic v1.0.42](https://github.com/be5invis/Sarasa-Gothic/releases/tag/v1.0.42)，使用 Regular 字重，SIL Open Font License 1.1。许可证：`public/vendor/Sarasa-OFL.txt`。
- 字体经 `subset-fonts.py` 按仓库用字生成 WOFF2 子集，子集字体家族改名为 `Kod Docs Sans` / `Kod Docs Mono`。原版权及许可证保留，未修改字形设计。
