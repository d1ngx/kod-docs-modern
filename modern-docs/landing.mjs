// Adapt the original landing template at build time: one source for homepage content.
export function renderLanding(source, banner) {
  const start=source.search(/<section\b[^>]*class="container"[^>]*>/);
  const footer=source.search(/<footer\b/);
  if(start<0||footer<start)throw Error('_layouts/landing.html 缺少首页内容 section 或 footer 边界');
  let html=source.slice(start,footer);
  html=html.replace(/\{%\s*include\s+landing-page\/extensions-banner\.html\s*%\}/g,banner.replace(/<\/br>/g,''));
  if(/\{%|\{\{/.test(html))throw Error('首页包含未支持的 Liquid 标记，请在 modern-docs/landing.mjs 中添加适配');
  html=html.replace(/<a onclick="onChangeHelpTab\('(\w+)'\)">([\s\S]*?)<\/a>/g,'<button type="button" data-help-tab="$1">$2</button>');
  html=html.replace(/<a onclick="onChangeHelpOs\('(\w+)'\)">([\s\S]*?)<\/a>/g,'<button type="button" data-help-os="$1">$2</button>');
  html=html.replace(/<button type="button" class="btn btn-default dropdown-toggle"[\s\S]*?<\/button>/g,'<span class="client-label">选择客户端</span>');
  // Actual images work under the site's Content Security Policy; inline backgrounds do not.
  html=html.replace(/<div\s+class="image"\s+style="background-image:\s*url\(([^)]+)\);"\s*>\s*<\/div>/g,'<img class="topic-image" src="$1" alt="" width="120" height="100">');
  // Legacy fragments differ from Markdown-generated heading IDs. Keep the valid article target.
  html=html.replace(/href="(\/[^"#]*)(#[^"]*)?"/g,(_,pathname)=>`href="${pathname.replace(/\/{2,}/g,'/')}"`);
  return html;
}

export function renderFooter(source, year=new Date().getFullYear()) {
  const lists=source.match(/<ul class="footer_links">[\s\S]*?<\/ul>/g)||[];
  if(!lists.length)throw Error('_includes/footer.html 缺少 footer_links 内容');
  return `<div class="container"><div class="row">${lists.map(list=>`<nav>${list}</nav>`).join('')}</div><div class="bottom_footer">Copyright © 2017–${year} Kodcloud. All rights reserved.</div></div>`;
}
