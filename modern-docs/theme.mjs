import { readFileSync } from 'node:fs';
import { renderLanding, renderFooter } from './landing.mjs';

const homeContent = renderLanding(
  readFileSync(new URL('../_layouts/landing.html', import.meta.url), 'utf8'),
  readFileSync(new URL('../_includes/landing-page/extensions-banner.html', import.meta.url), 'utf8')
);
const footerContent = renderFooter(readFileSync(new URL('../_includes/footer.html', import.meta.url), 'utf8'));
const gordon = readFileSync(new URL('./public/vendor/gordon.svg', import.meta.url), 'utf8')
  .replace('<svg ', '<svg class="icon" aria-hidden="true" ');
const paths = {
  search: '<circle cx="10.8" cy="10.8" r="7.3"/><path d="m16.2 16.2 5 5"/>',
  arrow: '<path d="M4 12h16m-7-7 7 7-7 7"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/>',
  moon: '<path d="M20.8 13.2A9 9 0 0 1 10.8 3.1 9 9 0 1 0 20.8 13.2Z"/>',
  system: '<path d="M20 15a8 8 0 0 1-11-11 9 9 0 1 0 11 11Z"/><path d="M16 2v2m0 6v2m-5-5h2m6 0h2m-8.5-3.5 1 1m5 5 1 1"/><circle cx="16" cy="7" r="2"/>',
  cloud: '<path d="M6.5 18h11a4.5 4.5 0 0 0 .5-9 6.5 6.5 0 0 0-12.3-1.5A5.3 5.3 0 0 0 6.5 18Z"/><path d="m9 13 2 2 4-4"/>',
  rocket: '<path d="M14 5c3-2 6-2 7-2 0 4-1 7-4 10l-4 3-5-5 3-4Z"/><path d="m8 11-4 1 1-5 6-1m2 10-1 4 5-1 1-6M6 16c-2 0-3 2-3 5 3 0 5-1 5-3"/><circle cx="16" cy="8" r="1.5"/>',
  book: '<path d="M12 5C9 3 5 3 2 4v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-3-1-7-1-10 1Zm0 0v15"/>',
  document: '<path d="M14 3H5v18h14V8Zm0 0v5h5M8 12h8m-8 4h6"/>',
  terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3m6 0h4"/>',
  edit: '<path d="M13 5H4v15h15v-9M15 4l5 5M10 14l1-5 7-7 4 4-7 7Z"/>',
  flag: '<path d="M5 22V3m0 1c5-4 9 4 15 0v11c-6 4-10-4-15 0"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="1"/><path d="M16 8V3H3v13h5"/>',
  external: '<path d="M14 3h7v7m0-7L10 14m0-10H4v16h16v-6"/>',
  reset: '<path d="M20 4v6h-6M4 20v-6h6M20 10a8 8 0 0 0-14-5M4 14a8 8 0 0 0 14 5"/>',
  send: '<path d="m3 3 19 9-19 9 4-9-4-9Zm4 9h15"/>',
  github: '<path d="M9 19c-4 1-4-2-6-2m12 5v-4c0-1 .2-2-.5-2.7 4.2-.5 7-2 7-6.5a5 5 0 0 0-1.4-3.4 5 5 0 0 0-.1-3.4s-1.3-.4-4 1.3a14 14 0 0 0-7 0C5.3 1.6 4 2 4 2a5 5 0 0 0-.1 3.4 5 5 0 0 0-1.4 3.4c0 4.5 2.8 6 7 6.5-.7.7-.5 1.7-.5 2.7v4"/>',
};
export const icon = name => name === 'ai' ? gordon : `<svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.document}</svg>`;

export function createTheme({ config, docs, nav, escape: e, editLink }) {
  const byUrl = new Map(docs.map(doc => [doc.url, doc]));
  const aiLabel = config.staticMode ? '文档检索' : 'AI 助手';
  const suggestions = ['如何开始使用可道云？', '如何使用 Docker 部署？', '如何共享文件并协作？', '怎样配置部门与权限？', '如何备份与恢复数据？'];
  const issueLink = doc => config.repository.replace(/\/$/, '') + (config.gitProvider === 'gitlab' ? '/-/issues/new' : '/issues/new') + '?title=' + encodeURIComponent(`文档反馈：${doc?.title || '可道云文档'}`);
  function tree(items = [], current = '') {
    return items.filter(item=>!item.section || flatten(item.section).some(url=>byUrl.has(url))).map(item => item.section
      ? `<details ${flatten(item.section).includes(current) ? 'open' : ''}><summary><span>${e(item.sectiontitle)}</span>${icon('chevron')}</summary><div class="nav-children">${tree(item.section, current)}</div></details>`
      : byUrl.has(item.path?.trim()) ? `<a ${item.path.trim() === current ? 'aria-current="page" id="sidebar-current-page"' : ''} href="${e(item.path.trim())}" title="${e(item.title)}">${e(item.title)}</a>` : '').join('');
  }
  const flatten = items => (items || []).flatMap(item => item.section ? flatten(item.section) : [item.path?.trim()]);
  const topNav = section => Object.entries(config.sections).filter(([key]) => !config.hiddenNavigationSections?.includes(key)).map(([key, title]) => `<a ${key === section ? 'aria-current="page"' : ''} href="/${key}/">${e(title)}</a>`).join('');
  const pills = (list, className = '') => list.map(question => `<button class="${className}" data-question="${e(question)}">${e(question)}</button>`).join('');
  function dialogs() {
    return `<dialog id="search-dialog" aria-label="搜索文档">
      <div class="search-input-row">${icon('search')}<label class="sr-only" for="search-input">输入关键词</label><input id="search-input" type="search" placeholder="搜索文档…" autocomplete="off"><button data-close aria-label="关闭搜索"><kbd>Esc</kbd></button></div>
      <div class="search-meta"><select id="search-section" aria-label="筛选分类"><option value="">全部文档</option>${Object.entries(config.sections).map(([key, title]) => `<option value="${key}">${e(title)}</option>`).join('')}</select><span id="search-status" role="status"></span></div>
      <div id="search-results"><p class="search-empty">输入关键词，搜索可道云文档</p></div><div class="search-footer"><span><kbd>↑</kbd> <kbd>↓</kbd> 选择</span><span><kbd>Enter</kbd> 打开</span><span><kbd>Esc</kbd> 关闭</span></div>
    </dialog>
    <dialog id="ai-dialog" aria-labelledby="ai-title"><div class="ai-header"><span id="ai-title">${icon('ai')} 可道云 ${aiLabel}</span><div><button id="ai-reset" aria-label="开始新对话" title="开始新对话">${icon('reset')}</button><button data-close aria-label="关闭${aiLabel}">${icon('close')}</button></div></div>
      <div class="ai-scroll"><div id="ai-welcome"><img class="ai-robot" src="/ui/vendor/gordon-robot.svg" alt="${aiLabel}"><h2>有什么可以帮您？</h2><p>${config.staticMode ? '当前为文档检索模式，提供相关文档片段和来源，不生成模型回答。' : '我是可道云 AI 助手，帮助您解答<br>产品使用与文档相关的问题。'}</p><div class="ai-suggestions-label">试试这样提问</div><div class="ai-suggestions">${suggestions.slice(0,4).map((q,i)=>`<button data-question="${e(q)}"><span>${icon(['rocket','terminal','book','document'][i])}</span>${e(q)}</button>`).join('')}</div></div><div id="ai-answer" aria-live="polite" aria-busy="false"></div></div>
      <form id="ai-form"><div class="ai-composer"><label class="sr-only" for="ai-question">你想了解什么？</label><textarea id="ai-question" rows="3" required maxlength="2000" placeholder="输入关于可道云的问题…"></textarea><button id="ai-submit" aria-label="发送问题" title="发送问题" disabled>${icon('send')}</button></div><div class="ai-form-foot"><span>Enter 发送 · Shift + Enter 换行</span><a href="${e(issueLink())}" target="_blank" rel="noopener">分享反馈</a></div></form><div class="ai-disclaimer">${config.staticMode ? '检索结果为文档片段，请打开参考来源查看完整内容。' : '回答基于文档内容生成，请结合参考来源核对。'}</div>
    </dialog>`;
  }
  function shell(title, content, doc, isHome = false) {
    const section = doc?.section;
    const sidebar = doc ? `<aside class="sidebar" id="sidebar" aria-label="文档目录"><button id="menu-close">${icon('arrow')} 返回</button><nav class="mobile-sections" aria-label="文档分类">${topNav(section)}</nav><div class="sidebar-heading">${e(config.sections[section])}</div><nav aria-label="${e(config.sections[section])}">${tree(nav[section],doc.url)}</nav></aside>` : '';
    return `<!doctype html><html lang="zh-CN" data-deployment="${config.staticMode ? 'static' : 'server'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${e(doc?.description || config.description)}"><title>${e(title)} · ${e(config.title)}</title><link rel="icon" href="/favicon.ico"><link rel="preload" href="/ui/vendor/KodDocsSans.woff2" as="font" type="font/woff2" crossorigin><script src="/ui/theme.js"></script><link rel="stylesheet" href="/ui/style.css"><link rel="stylesheet" href="/ui/kodcloud.css"><link rel="stylesheet" href="/ui/typography.css"><script src="/ui/app.js" type="module"></script></head><body class="${isHome ? 'home-page' : 'document-page'}" ${doc ? `data-markdown="/markdown/${e(doc.file)}"` : ''}>
      <a class="skip" href="#main">跳转到内容</a><div class="announcement" id="announcement"><a href="/start/"><span class="announcement-new">✦ 新体验</span> 探索可道云文档，快速找到您的答案 <span aria-hidden="true">→</span></a><button id="announcement-close" aria-label="关闭公告">${icon('close')}</button></div>
      <header class="site-header"><div class="header-left">${doc ? `<button id="menu-toggle" aria-label="打开文档目录" aria-expanded="false" aria-controls="sidebar">${icon('menu')}</button>` : ''}<a class="brand" href="/" aria-label="可道云文档首页"><img src="/assets/images/docs-logo.png" width="160" height="28" alt="Kodcloud docs"></a></div><nav class="top-nav" aria-label="主导航"><a href="/" ${isHome ? 'aria-current="page"' : ''}>首页</a>${topNav(section)}<a href="https://doc.kodcloud.com/v2/">开发</a><a href="https://kodcloud.com/">官网</a></nav><div class="header-actions"><button data-ai aria-label="${aiLabel}">${icon('ai')}<span>${aiLabel}</span></button><button data-search aria-label="搜索文档">${icon('search')}<span>搜索</span></button><button id="theme-toggle" aria-label="切换主题" title="主题：跟随系统"><span class="theme-sun">${icon('sun')}</span><span class="theme-moon">${icon('moon')}</span><span class="theme-system">${icon('system')}</span></button></div></header>
      ${doc ? `<button class="sidebar-backdrop" aria-label="关闭文档目录" tabindex="-1" hidden></button><div class="doc-layout">${sidebar}<div class="doc-content">${content}</div></div>` : content}
      <footer class="site-footer legacy-footer">${footerContent}<div class="footer-maintain"><a href="${e(config.repository)}">文档仓库</a> · <a href="${e(issueLink(doc))}">反馈文档问题</a> · <a href="/llms.txt">llms.txt</a></div></footer>${dialogs()}</body></html>`;
  }
  function home() {
    return shell('首页',`<main id="main"><section class="home-hero"><div class="hero-content"><h1>您想了解什么？</h1><button class="home-search-trigger" data-search>${icon('search')}<span>输入关键词，搜索相关资料...</span><kbd>Ctrl K</kbd></button><form id="hero-form"><div class="hero-search">${icon('ai')}<label class="sr-only" for="hero-question">向${aiLabel}提问</label><input id="hero-question" placeholder="${config.staticMode ? '也可以输入问题，检索相关文档…' : '也可以直接向 AI 助手提问…'}" maxlength="2000"><button aria-label="发送给${aiLabel}" disabled>${icon('arrow')}</button></div></form></div></section><div class="legacy-home">${homeContent}</div></main>`,null,true);
  }

  function article(doc) {
    const siblings = docs.filter(d=>d.section===doc.section), index = siblings.indexOf(doc);
    const neighbor = (other,label) => other ? `<a href="${other.url}"><small>${label}</small><span>${e(other.title)} ${icon('arrow')}</span></a>` : '<span></span>';
    const content = `<main id="main"><nav class="breadcrumb" aria-label="面包屑"><a href="/">首页</a><span>/</span><a href="/${doc.section}/">${e(config.sections[doc.section])}</a>${doc.url!==`/${doc.section}/`?`<span>/</span><span>${e(doc.title)}</span>`:''}</nav><h1 class="doc-title">${e(doc.title)}</h1><div class="page-tools"><button data-ai>${icon('ai')} ${aiLabel}</button><button data-copy-markdown>${icon('copy')} <span>复制 Markdown</span></button><a href="/markdown/${e(doc.file)}" target="_blank">${icon('external')} 查看 Markdown</a></div>${doc.description?`<p class="doc-description">${e(doc.description)}</p>`:''}<article>${doc.html}</article><div class="mobile-edit"><a href="${e(editLink(doc.file))}" target="_blank" rel="noopener">${icon('edit')} 编辑此页</a><a href="${e(issueLink(doc))}" target="_blank" rel="noopener">${icon('flag')} 提交修改建议</a></div><nav class="pagination" aria-label="相邻文档">${neighbor(siblings[index-1],'上一篇')}${neighbor(siblings[index+1],'下一篇')}</nav></main><aside class="on-this-page" aria-label="本页导航"><div class="edit-tools"><a href="${e(editLink(doc.file))}" target="_blank" rel="noopener">${icon('edit')} 编辑此页</a><a href="${e(issueLink(doc))}" target="_blank" rel="noopener">${icon('flag')} 提交修改建议</a></div>${doc.toc.length?`<nav class="toc" aria-label="本页目录"><h2>本页目录</h2>${doc.toc.map(t=>`<a class="${t.level}" href="#${e(t.id)}" title="${e(t.title)}">${e(t.title)}</a>`).join('')}</nav>`:''}</aside>`;
    return shell(doc.title,content,doc);
  }
  return { home, article, notFound:()=>shell('页面未找到',`<main id="main" class="not-found"><h1>页面未找到</h1><p>这篇文档可能已移动。请搜索关键词，或从首页继续阅读。</p><a class="primary" href="/">返回首页</a><button data-search>${icon('search')} 搜索文档</button></main>`) };
}

