---
title: Windows 客户端白屏或闪退
type: how-to
keywords: ["Windows 11 白屏", "闪退", "客户端缓存", "AppData", "kodcloud"]
redirect_from: /user/PC/sync-nextcloud/
---

部分 Windows 11 用户首次安装或覆盖升级 KodBox PC 客户端后，双击打开可能出现纯白窗口、一直加载或瞬间闪退。可以按以下步骤排查。

1. **彻底结束后台残留进程**：按 `Ctrl + Shift + Esc` 打开任务管理器，在「进程」与「详细信息」页签中结束所有 `kodcloud` / 可道云相关进程。
2. **清理客户端本地缓存目录**：按 `Win + R` 打开运行框，输入以下路径并回车：
   ```text
   %APPDATA%\kodcloud
   ```
   如果目录存在，把 `kodcloud` 重命名为 `kodcloud.bak`，保留原有配置以便恢复。
3. **排查安全软件拦截**：检查 Windows Defender 保护历史记录、火绒、360 或企业终端 EDR 是否拦截了客户端内核或本地 WebDAV 挂载组件；若有拦截，请先核对安装包来源，企业电脑可联系 IT 管理员确认。
4. **重新以普通用户启动并核对站点地址**：重新打开客户端，输入完整站点地址（含 `https://` 及非标端口，如 `https://cloud.example.com:4433`）。若网页端正常但客户端登录失败，请联系管理员检查 [非标准端口反代与证书链配置](/setup/reverse-proxy/#non-standard-port)。

