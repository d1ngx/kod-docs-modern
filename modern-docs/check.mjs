import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const dir=path.resolve(process.argv.includes('--static')?'modern-docs/static-dist':'modern-docs/dist');
const docs=JSON.parse(await readFile(path.join(dir,'search-index.json'),'utf8'));
const issues=[];
for(const doc of [{url:'/'},...docs]){
  const html=await readFile(path.join(dir,doc.url,'index.html'),'utf8');
  if(doc.url!=='/'&&(!html.includes('编辑此页')||!html.includes('data-ai')))throw Error(`Missing feature: ${doc.url}`);
  const article=doc.url==='/'?html:(html.match(/<article>([\s\S]*?)<\/article>/)?.[1]||'');
  if(article.includes('{:')||article.includes('{%'))throw Error(`Legacy markup: ${doc.url}`);
  for(const match of article.matchAll(/(?:href|src)="([^"#]+)"/g)){
    const value=match[1].replace(/&amp;/g,'&');if(/^(?:[a-z]+:|\/\/)/i.test(value))continue;
    const url=new URL(value,'http://local'+doc.url);let file=path.join(dir,decodeURIComponent(url.pathname));
    try{if((await stat(file)).isDirectory())file=path.join(file,'index.html');await stat(file);}catch{issues.push({page:doc.url,target:value});}
  }
}
await mkdir('modern-docs/test-results',{recursive:true});
await writeFile('modern-docs/test-results/content-audit.json',JSON.stringify({documents:docs.length,missingReferences:issues},null,2));
console.log(`Checked ${docs.length} documents. ${issues.length} source content references missing (see modern-docs/test-results/content-audit.json).`);
if(issues.length)process.exitCode=1;
