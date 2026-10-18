import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import http from 'node:http';
import { search, terms } from '../public/search.js';
const settings=JSON.parse(await readFile(new URL('../site.config.json',import.meta.url),'utf8'));
const editPrefix=settings.repository+(settings.gitProvider==='gitlab'?'/-/edit/':'/edit/')+settings.branch+'/';
const index=JSON.parse(await readFile(new URL('../dist/search-index.json',import.meta.url),'utf8'));
async function serve(env={}){
  let port;
  const child=spawn(process.execPath,['modern-docs/server.mjs'],{env:{...process.env,AI_BASE_URL:'',AI_MODEL:'',DOCS_AUTH_USER:'',DOCS_AUTH_PASSWORD:'',PORT:'0',HOST:'127.0.0.1',...env},stdio:['ignore','pipe','pipe']});
  let stderr='';child.stderr.on('data',data=>stderr+=data);
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Server startup timeout')),10000);child.stdout.once('data',data=>{port=Number(String(data).match(/localhost:(\d+)/)[1]);clearTimeout(timer);resolve();});child.once('exit',code=>{clearTimeout(timer);reject(Error(`Server exited ${code}: ${stderr}`));});});
  return {url:`http://127.0.0.1:${port}`,stop:()=>child.kill()};
}
test('Chinese and mixed-language retrieval',()=>{
  assert.ok(terms('Docker 备份恢复').includes('备份'));
  assert.equal(search(index,'Docker环境可道云网盘')[0].url,'/setup/docker/');
  assert.ok(search(index,'如何使用 Docker 部署可道云？',3).some(d=>d.url==='/setup/docker/'));
  assert.ok(search(index,'权限').some(d=>d.section==='admin'));
  assert.equal(search(index,'xxyyzzqqvv').length,0);
  assert.equal(search(index,' ').length,0);
});
test('all generated pages, assets, search and API validation',async t=>{
  const service=await serve();t.after(service.stop);
  for(const doc of index){const r=await fetch(service.url+doc.url);assert.equal(r.status,200,doc.url);const html=await r.text();assert.ok(html.includes('编辑此页'));assert.ok(html.includes(editPrefix));}
  const home=await fetch(service.url+'/').then(r=>r.text());assert.match(home,/您想了解什么/);assert.match(home,/id="hero-form"/);assert.doesNotMatch(home,/class="sidebar"/);
  const article=await fetch(service.url+'/setup/docker/').then(r=>r.text());assert.match(article,/<h2 id=/);assert.match(article,/<pre><code/);assert.doesNotMatch(article,/markdown="1"|\{: \.important|更多文档/);assert.match(article,/src="\/ui\/app\.js"/);
  assert.equal((await fetch(service.url+'/setup/docker',{redirect:'manual'})).status,308);
  assert.equal((await fetch(service.url+'/not-a-real-page/')).status,404);
  const image=await fetch(service.url+'/user/images/1.1-1.png');assert.equal(image.status,200);assert.equal(image.headers.get('content-type'),'image/png');
  assert.equal((await fetch(service.url+'/ui/app.js')).headers.get('content-type'),'text/javascript; charset=utf-8');
  const markdown=await fetch(service.url+'/markdown/setup/docker.md');assert.match(markdown.headers.get('content-type'),/text\/plain/);assert.match(await markdown.text(),/docker compose/);
  for(const font of ['KodDocsSans','KodDocsMono']) {
    const response=await fetch(service.url+`/ui/vendor/${font}.woff2`);
    assert.equal(response.headers.get('content-type'),'font/woff2');
    assert.equal(Buffer.from(await response.arrayBuffer()).subarray(0,4).toString(),'wOF2');
  }
  assert.equal((await fetch(service.url+'/api/ask')).status,405);
  const post=(data,headers={})=>fetch(service.url+'/api/ask',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:typeof data==='string'?data:JSON.stringify(data)});
  assert.equal((await post('{')).status,400);
  assert.equal((await post({question:''})).status,400);
  assert.equal((await post({question:'x'.repeat(2001)})).status,400);
  assert.equal((await post({question:'Docker'},{Origin:'http://evil.example'})).status,403);
  assert.equal((await post({question:'x'.repeat(13000)})).status,413);
  const retrieval=await post({question:'如何使用 Docker 部署可道云？'}).then(r=>r.json());assert.equal(retrieval.mode,'retrieval');assert.ok(retrieval.sources.some(s=>s.url==='/setup/docker/'));assert.match(retrieval.answer,/Docker/);
  const health=await fetch(service.url+'/api/health').then(r=>r.json());assert.equal(health.documents,index.length);assert.equal(health.aiConfigured,false);
  const traversal=await fetch(service.url+'/%2e%2e%5cpackage.json');assert.ok([403,404].includes(traversal.status));
});
test('private deployment protects content, index and API',async t=>{
  const service=await serve({DOCS_AUTH_USER:'reader',DOCS_AUTH_PASSWORD:'test-secret'});t.after(service.stop);
  for(const route of ['/','/search-index.json','/api/health','/user/images/1.1-1.png'])assert.equal((await fetch(service.url+route)).status,401);
  assert.equal((await fetch(service.url+'/',{headers:{Authorization:'Basic '+Buffer.from('reader:test-secret').toString('base64')}})).status,200);
});
test('AI adapter sends retrieved context and keeps credentials on server',async t=>{
  let payload,authorization;
  const mock=http.createServer(async(req,res)=>{assert.equal(req.url,'/v1/chat/completions');authorization=req.headers.authorization;let raw='';for await(const c of req)raw+=c;payload=JSON.parse(raw);res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({choices:[{message:{content:'使用 Docker Compose 部署，见 [1]。'}}]}));});
  await new Promise(resolve=>mock.listen(0,'127.0.0.1',resolve));t.after(()=>mock.close());
  const service=await serve({AI_BASE_URL:`http://127.0.0.1:${mock.address().port}/v1`,AI_MODEL:'local-model',AI_API_KEY:'server-secret'});t.after(service.stop);
  const r=await fetch(service.url+'/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'Docker 安装'})});const result=await r.json();
  assert.equal(result.mode,'ai');assert.match(result.answer,/\[1\]/);assert.ok(result.sources.length);assert.equal(authorization,'Bearer server-secret');assert.equal(payload.model,'local-model');assert.match(payload.messages[1].content,/docker compose/);assert.ok(!JSON.stringify(result).includes('server-secret'));
});
test('upstream AI failures and empty model replies are handled',async t=>{
  let empty=false;
  const mock=http.createServer((req,res)=>{res.writeHead(empty?200:503,{'Content-Type':'application/json'});res.end(empty?JSON.stringify({choices:[]}):'{}');});await new Promise(resolve=>mock.listen(0,'127.0.0.1',resolve));t.after(()=>mock.close());
  const service=await serve({AI_BASE_URL:`http://127.0.0.1:${mock.address().port}/v1`,AI_MODEL:'local'});t.after(service.stop);
  const send=()=>fetch(service.url+'/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'Docker'})});
  assert.equal((await send()).status,502);empty=true;assert.equal((await send()).status,502);
});
test('AI endpoint rate limits repeated requests',async t=>{
  const service=await serve();t.after(service.stop);let response;
  for(let n=0;n<13;n++)response=await fetch(service.url+'/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'Docker'})});
  assert.equal(response.status,429);assert.equal(response.headers.get('Retry-After'),'60');
});

test('legacy rendering, homepage images and publication exclusions',async t=>{
  const service=await serve();t.after(service.stop);
  const page=route=>fetch(service.url+route).then(r=>r.text());
  const home=await page('/');
  assert.equal((home.match(/class="topic-image"/g)||[]).length,5);
  assert.doesNotMatch(home,/style="background-image|\{%|onclick=/);
  for(const asset of ['xp','laptop','view','share','admin']) assert.equal((await fetch(service.url+`/assets/images/${asset}.svg`)).status,200);
  const setup=await page('/setup/');assert.doesNotMatch(setup,/start row|component-container|&lt;div/);
  const guide=await page('/guide/2.3/');assert.match(guide,/<li><strong>地址<\/strong>/);assert.doesNotMatch(guide,/<pre>[\s\S]*?\*\*地址/);
  const user=await page('/user/');assert.match(user,/<blockquote class="callout-note">/);assert.match(user,/<blockquote class="callout-warning">/);
  const sitemap=await page('/sitemap.xml'),llms=await page('/llms.txt');
  for(const slug of ['5.2','5.3','check','configuration','oss']){
    const url=`/setup/${slug}/`;
    assert.equal((await fetch(service.url+url)).status,404);
    assert.equal((await fetch(service.url+`/markdown/setup/${slug}.md`)).status,404);
    assert.ok(!index.some(d=>d.url===url));assert.ok(!sitemap.includes(url));assert.ok(!llms.includes(url));assert.ok(!setup.includes(`href="${url}"`));
  }
});

test('homepage stays in sync with the original landing template',async()=>{
  const {renderLanding,renderFooter}=await import('../landing.mjs');
  const source=await readFile(new URL('../../_layouts/landing.html',import.meta.url),'utf8');
  const banner=await readFile(new URL('../../_includes/landing-page/extensions-banner.html',import.meta.url),'utf8');
  const download=/<a href="([^"]+)"[^>]*>\s*<h5 class="title">资料下载/;
  const expected=source.match(download)?.[1];assert.ok(expected);
  const home=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
  assert.equal(home.match(download)?.[1],expected);
  const footer=await readFile(new URL('../../_includes/footer.html',import.meta.url),'utf8');
  assert.ok(home.includes(renderFooter(footer)));
  assert.ok(renderFooter(footer.replace('产品与服务','页脚同步测试')).includes('页脚同步测试'));
  const changed=renderLanding(source.replace(expected,'https://example.invalid/new-download'),banner);
  assert.equal(changed.match(download)?.[1],'https://example.invalid/new-download');
  assert.equal((changed.match(/class="topic-image"/g)||[]).length,5);
  assert.doesNotMatch(changed,/onclick=|\{%/);
});
