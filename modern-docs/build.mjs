import { readFile, writeFile, mkdir, readdir, cp, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
import YAML from 'yaml';
import sanitize from 'sanitize-html';
import hljs from 'highlight.js';
import { createTheme } from './theme.mjs';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const staticMode = process.argv.includes('--static');
const out = path.join(root, staticMode ? 'modern-docs/static-dist' : 'modern-docs/dist');
const config = JSON.parse(await readFile(path.join(root, 'modern-docs/site.config.json'), 'utf8'));
const publication = JSON.parse(await readFile(path.join(root,'modern-docs/publication.json'),'utf8'));
const skipped = [];
const nav = YAML.parse(await readFile(path.join(root, '_data/toc.yaml'), 'utf8'));
export const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function editLink(file, settings = config) {
  const prefix = settings.gitProvider === 'gitlab' ? '/-/edit/' : '/edit/';
  return settings.repository.replace(/\/$/, '') + prefix + encodeURIComponent(settings.branch) + '/' +
    (settings.sourcePrefix + file).split('/').map(encodeURIComponent).join('/');
}
const md = new MarkdownIt({ html: true, linkify: true, highlight(code, lang) {
  return lang && hljs.getLanguage(lang) ? hljs.highlight(code, { language: lang }).value : escape(code);
}});
function cleanLegacy(body) {
  // Remove Jekyll/Kramdown wrappers so Markdown inside HTML blocks is parsed.
  return body.replace(/<!--[\s\S]*?-->/g, '').replace(/\{:\s*\.important\s*\}/g, '<!--docs-important-->').replace(/<\/?div\b[^>]*>/gi, '').replace(/\{:[^}\n]*\}/g, '')
    .replace(/\{%[\s\S]*?%\}/g, '').replace(/\{\{[\s\S]*?\}\}/g, '');
}
async function files(dir) {
  const entries = await readdir(path.join(root, dir), { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? files(`${dir}/${e.name}`) : [`${dir}/${e.name}`]))).flat();
}
const sourceFiles = (await Promise.all(Object.keys(config.sections).map(files))).flat();
const availableFiles = new Set(sourceFiles.map(f => '/' + f));
const sources = sourceFiles.filter(f => f.endsWith('.md'));
const docs = [];
for (const file of sources) {
  if (publication.excluded[file]) { skipped.push({file,reason:publication.excluded[file]}); continue; }
  const raw = await readFile(path.join(root, file), 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  const meta = match ? YAML.parse(match[1]) || {} : {};
  if(meta.draft===true || meta.published===false) { skipped.push({file,reason:'草稿或禁止发布'}); continue; }
  const body = cleanLegacy(match ? raw.slice(match[0].length) : raw);
  if(!sanitize(body,{allowedTags:[],allowedAttributes:{}}).trim()) { skipped.push({file,reason:'正文为空'}); continue; }
  const url = '/' + file.replace(/index\.md$/, '').replace(/\.md$/, '/') ;
  const toc = [], ids = new Map();
  const tokens = md.parse(body, {});
  // Preserve legacy important callouts as semantic blockquote classes.
  for(let j=0;j<tokens.length;j++) {
    if(tokens[j].type==='blockquote_open') tokens[j].attrSet('class','callout-note');
    if(tokens[j].type==='html_block' && tokens[j].content.includes('<!--docs-important-->')) {
      let depth=0;
      for(let k=j-1;k>=0;k--) {
        if(tokens[k].type==='blockquote_close') depth++;
        if(tokens[k].type==='blockquote_open' && --depth===0) {tokens[k].attrSet('class','callout-warning');break;}
      }
      tokens[j].content='';
    }
  }
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === 'heading_open') {
      const title = tokens[i+1].children?.filter(t => t.type === 'text' || t.type === 'code_inline').map(t => t.content).join('') || tokens[i+1].content;
      const base = title.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-') || 'section';
      const n = ids.get(base) || 0; ids.set(base, n+1);
      const id = base + (n ? `-${n}` : ''); token.attrSet('id', id);
      if (['h2','h3'].includes(token.tag)) toc.push({ title, id, level: token.tag });
    }
    for (const child of token.children || []) {
      for (const key of ['href', 'src']) {
        const value = child.attrGet(key);
        if (!value || /^(?:[a-z]+:|#|\/\/)/i.test(value)) continue;
        const splitAt = value.search(/[?#]/);
        const pathname = splitAt < 0 ? value : value.slice(0,splitAt), suffix = splitAt < 0 ? '' : value.slice(splitAt);
        // Jekyll pretty URLs resolve ../images against the page's pretty URL.
        let resolved = path.posix.normalize(pathname.startsWith('/') ? pathname : path.posix.join(url, pathname));
        if (!pathname.startsWith('/')) {
          const fromSource = path.posix.normalize(path.posix.join('/' + path.posix.dirname(file), pathname));
          if (pathname.endsWith('.md') || availableFiles.has(fromSource)) resolved = fromSource;
        }
        if (resolved.endsWith('.md')) resolved = resolved.replace(/index\.md$/, '').replace(/\.md$/, '/');
        child.attrSet(key, resolved + suffix);
      }
    }
  }
  const html = sanitize(md.renderer.render(tokens, md.options, {}), {
    allowedTags: sanitize.defaults.allowedTags.concat(['img','details','summary','video','source']),
    allowedAttributes: { ...sanitize.defaults.allowedAttributes, '*': ['id','class'], img: ['src','alt','width','height','loading'], a: ['href','title','id','name'], video:['src','controls'], source:['src','type'] },
    allowedSchemes: ['http','https','mailto','tel'],
    transformTags: { img: sanitize.simpleTransform('img', { loading:'lazy' }) }
  });
  const text = md.utils.unescapeAll(sanitize(html, { allowedTags: [], allowedAttributes: {} })).replace(/\s+/g, ' ').trim();
  docs.push({ file, url, title: meta.title || path.basename(file, '.md'), description: meta.description || '', section: file.split('/')[0], toc, html, text, markdown: raw, redirects: [meta.redirect_from].flat().filter(Boolean) });
}
const byUrl = new Map(docs.map(d => [d.url,d]));
const flatten = items => (items || []).flatMap(item => item.section ? flatten(item.section) : [item.path?.trim()]);
const orderedUrls = Object.keys(config.sections).flatMap(section => flatten(nav[section]));
docs.sort((a,b) => {
  const ai=orderedUrls.indexOf(a.url),bi=orderedUrls.indexOf(b.url);
  return (ai<0?9999:ai)-(bi<0?9999:bi)||a.url.localeCompare(b.url);
});
const theme = createTheme({ config: {...config, staticMode}, docs, nav, escape, editLink });
await rm(out, { recursive:true, force:true }); await mkdir(out, { recursive:true });
await cp(path.join(root,'modern-docs/public'),path.join(out,'ui'),{recursive:true});
await cp(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});
await cp(path.join(root,'favicon.ico'),path.join(out,'favicon.ico'));
for (const file of sourceFiles.filter(f=>!f.endsWith('.md'))) {
  await mkdir(path.dirname(path.join(out,file)),{recursive:true});
  await cp(path.join(root,file),path.join(out,file));
}
await writeFile(path.join(out,'index.html'),theme.home());
for (const doc of docs) {
  const dir = path.join(out,doc.url);
  await mkdir(dir,{recursive:true});
  await writeFile(path.join(dir,'index.html'),theme.article(doc));
  const markdownFile = path.join(out,'markdown',doc.file);
  await mkdir(path.dirname(markdownFile),{recursive:true});
  await writeFile(markdownFile,doc.markdown);
  for (const redirect of doc.redirects) {
    if (!/^\/[\w/-]+\/$/.test(redirect) || redirect.includes('..')) continue;
    const dest=path.join(out,redirect);await mkdir(dest,{recursive:true});
    await writeFile(path.join(dest,'index.html'),`<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${escape(doc.url)}"><a href="${doc.url}">文档已迁移</a>`);
  }
}
await writeFile(path.join(out,'search-index.json'),JSON.stringify(docs.map(({url,title,description,text,section})=>({url,title,description,text,section}))));
await writeFile(path.join(out,'404.html'),theme.notFound());
await writeFile(path.join(out,'llms.txt'),`# ${config.title}\n\n${docs.map(d=>`- [${d.title}](${d.url}): ${d.description}`).join('\n')}\n`);
await writeFile(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/',...docs.map(d=>d.url)].map(url=>`<url><loc>${escape(config.siteUrl.replace(/\/$/,'')+url)}</loc></url>`).join('')}</urlset>`);
console.log(`Built ${docs.length} documents → ${path.relative(root,out)}`);

await mkdir(path.join(root,'modern-docs/test-results'),{recursive:true});
await writeFile(path.join(root,'modern-docs/test-results/publication-report.json'),JSON.stringify({published:docs.length,excluded:skipped},null,2));

if (staticMode) await cp(path.join(root,'modern-docs/DEPLOYMENT.md'),path.join(out,'DEPLOYMENT.md'));
