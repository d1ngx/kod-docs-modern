#!/usr/bin/env node
/**
 * 社区高频问题 /api/ask 与本地检索索引回归评测脚本。
 *
 * 用法：
 *   node scripts/eval-ask.mjs                          # 基于 modern-docs/dist/search-index.json 本地评测
 *   node scripts/eval-ask.mjs --url http://127.0.0.1:8088   # 对在线服务端 /api/ask 执行真实评测
 *   node scripts/eval-ask.mjs --url http://127.0.0.1:8088 --require-ai  # 同时要求响应为 mode: "ai"
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { search } from '../modern-docs/public/search.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const urlIdx = args.indexOf('--url');
const baseUrl = urlIdx >= 0 ? args[urlIdx + 1]?.replace(/\/$/, '') : '';
const requireAi = args.includes('--require-ai');

export const CASES = [
  { q: '什么时候不适合使用 KodBox？它和 KodExplorer 有什么区别？', expect: ['/start/'] },
  { q: 'KodBox 开源版、企业版和 teamOS 有什么区别？', expect: ['/start/editions/'] },
  { q: 'SQLite 上传多文件目录报错 database is locked 怎么解决？', expect: ['/operations/error-dictionary/', '/setup/planning/'] },
  { q: 'Docker 映射目录没权限怎么办？群晖或 Unraid 的 PUID 和 PGID 怎么配？', expect: ['/setup/nas-permissions/'] },
  { q: 'Docker 本地挂载目录单文件外链下载提示该文档不存在怎么办？', expect: ['/setup/nas-permissions/', '/operations/error-dictionary/'] },
  { q: '4433 非标准端口反代后浏览器正常但 PC 客户端和 APP 登录失败怎么排查？', expect: ['/setup/reverse-proxy/', '/operations/error-dictionary/'] },
  { q: '套用 CDN 后如何获取客户端真实 IP？', expect: ['/setup/reverse-proxy/'] },
  { q: 'OnlyOffice 提示文档安全令牌的格式不正确怎么修复？', expect: ['/setup/office/', '/operations/error-dictionary/'] },
  { q: 'OnlyOffice 和 KodBox 同机部署检测失败或 HTTPS 混合内容白屏怎么解决？', expect: ['/setup/office/', '/operations/error-dictionary/'] },
  { q: 'OnlyOffice 编辑保存后立即下载读到旧内容怎么办？', expect: ['/setup/office/'] },
  { q: '为什么在 KodBox 删除文件后 S3 或 OSS 对象存储里没有立即删除？', expect: ['/concepts/storage-architecture/'] },
  { q: '宿主机直接挂载目录和托管存储有什么区别？会影响 Synology Drive 同步吗？', expect: ['/concepts/storage-architecture/'] },
  { q: '系统角色、部门权限、文档权限和外链分享冲突时哪个优先级高？', expect: ['/concepts/permissions-model/'] },
  { q: '如何对比本地存储、阿里云 OSS、腾讯云 COS、MinIO 和 Cloudflare R2 的能力？', expect: ['/admin/storage-matrix/'] },
  { q: '如何配置 Cloudflare R2 的 API Token、Endpoint 和 CORS 跨域？', expect: ['/admin/storage-s3/'] },
  { q: '对象存储直传报 CORS 错误或分片合并失败怎么配置？', expect: ['/admin/storage-s3/', '/operations/error-dictionary/'] },
  { q: '如何备份和迁移可道云数据和数据库？宝塔迁 Docker 要注意什么？', expect: ['/operations/backup-migration/', '/setup/backup/'] },
  { q: '系统盘爆满导致可道云无法启动如何紧急抢救数据？', expect: ['/operations/backup-migration/'] },
  { q: '浏览器打开 WebDAV 地址显示 This XML file does not appear to have any style information 是报错吗？', expect: ['/admin/webdav/', '/operations/error-dictionary/'] },
  { q: 'WebDAV 多级目录偶发 401 或 RaiDrive 配合 WPS 编辑清空文件怎么办？', expect: ['/admin/webdav/', '/operations/error-dictionary/'] },
  { q: 'Windows 11 PC 客户端首次打开白屏闪退怎么清理缓存？', expect: ['/user/PC/windows-troubleshooting/', '/operations/error-dictionary/'] },
  { q: 'v1.70 AI 助手支持哪些多模态模型？aiRag 语义检索和全文检索有什么区别？', expect: ['/admin/aidoc/'] },
  { q: '如何开启二次验证 2FA 防爆破限流并升级内置 PHP 8.5.12 的官方镜像？', expect: ['/admin/security-hardening/', '/operations/upgrade/'] },
  { q: '1GB 以上大文件上传失败报 413 或 504 怎么调优？文件夹 ZIP 压缩上限是多少？', expect: ['/reference/performance-tuning/', '/operations/error-dictionary/'] },
  { q: 'KodBox、OnlyOffice 和 Milvus 需要开放哪些网络端口？', expect: ['/reference/ports-and-proxy/'] },
];

async function runLocal() {
  const indexPath = path.join(root, 'modern-docs/dist/search-index.json');
  const documents = JSON.parse(await readFile(indexPath, 'utf8'));
  const chunks = documents.flatMap(doc => {
    const result = [];
    for (let i = 0; i < doc.text.length; i += 1000) {
      result.push({ ...doc, text: doc.text.slice(Math.max(0, i - 150), i + 1200) });
    }
    return result.length ? result : [doc];
  });

  let passed = 0;
  for (const item of CASES) {
    const ranked = search(chunks, item.q, 24);
    const urls = [];
    for (const c of ranked) {
      if (!urls.includes(c.url)) urls.push(c.url);
      if (urls.length >= 6) break;
    }
    const ok = item.expect.some(expected => urls.includes(expected));
    if (ok) {
      passed++;
      console.log(`PASS  ${item.q}\n      → ${urls.slice(0, 3).join(', ')}`);
    } else {
      console.error(`FAIL  ${item.q}\n      expected any of: ${item.expect.join(', ')}\n      got: ${urls.join(', ') || '(none)'}`);
    }
  }
  console.log(`\nLocal retrieval eval: ${passed}/${CASES.length} passed.`);
  if (passed < CASES.length) process.exitCode = 1;
}

async function runRemote() {
  let passed = 0;
  for (const item of CASES) {
    const res = await fetch(`${baseUrl}/api/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: item.q }),
    });
    if (!res.ok) {
      console.error(`FAIL  ${item.q}\n      HTTP ${res.status}`);
      continue;
    }
    const data = await res.json();
    const urls = (data.sources || []).map(s => s.url);
    const hitOk = item.expect.some(expected => urls.includes(expected));
    const modeOk = !requireAi || data.mode === 'ai';
    if (hitOk && modeOk) {
      passed++;
      console.log(`PASS  [${data.mode}] ${item.q}\n      → ${urls.slice(0, 3).join(', ')}`);
    } else {
      console.error(`FAIL  [${data.mode}] ${item.q}\n      expected any of: ${item.expect.join(', ')}\n      got: ${urls.join(', ') || '(none)'}`);
    }
  }
  console.log(`\nRemote /api/ask eval (${baseUrl}): ${passed}/${CASES.length} passed.`);
  if (passed < CASES.length) process.exitCode = 1;
}

if (baseUrl) {
  await runRemote();
} else {
  await runLocal();
}
