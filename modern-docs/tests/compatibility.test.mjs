import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { writeClipboard } from '../public/clipboard.js';
import { clientIP } from '../client-ip.mjs';

test('clipboard uses modern API and falls back on HTTP or permission failure', async()=>{
  let copied, removed=0, restored=0, selected=0, parent;
  const field={setAttribute(){},focus(){},select(){selected++;},remove(){removed++;}};
  const dialog={append(node){parent='dialog';assert.equal(node,field);}};
  const document={activeElement:{focus(){restored++;}},getSelection(){return null;},createElement(){return field;},querySelector(){return dialog;},body:{append(){parent='body';}},execCommand(command){assert.equal(command,'copy');copied=field.value;return true;}};
  await writeClipboard('现代复制',{navigator:{clipboard:{async writeText(text){copied=text;}}},document});
  assert.equal(copied,'现代复制');assert.equal(selected,0);
  await writeClipboard('HTTP 代码 $PATH',{navigator:{},document});
  assert.equal(copied,'HTTP 代码 $PATH');assert.equal(parent,'dialog');
  await writeClipboard('拒绝后重试',{navigator:{clipboard:{async writeText(){throw Error('denied');}}},document});
  assert.equal(copied,'拒绝后重试');assert.equal(removed,2);assert.equal(restored,2);
  document.execCommand=()=>false;
  await assert.rejects(writeClipboard('失败',{navigator:{},document}),/复制失败/);
  assert.equal(removed,3);assert.equal(restored,3);
});

test('client IP trusts only configured proxy peers and a single valid X-Real-IP',()=>{
  const req={socket:{remoteAddress:'::ffff:127.0.0.1'},headers:{'x-real-ip':'10.0.0.7'}};
  assert.equal(clientIP(req,''),'127.0.0.1');
  assert.equal(clientIP(req,'127.0.0.1'),'10.0.0.7');
  assert.equal(clientIP(req,'192.168.0.1'),'127.0.0.1');
  req.headers['x-real-ip']='10.0.0.7, 10.0.0.8';
  assert.equal(clientIP(req,'127.0.0.1'),'127.0.0.1');
  req.headers['x-real-ip']='::ffff:10.0.0.7';
  assert.equal(clientIP(req,'127.0.0.1'),'10.0.0.7');
});

test('static build identifies retrieval mode before sending questions',async()=>{
  const home=await readFile(new URL('../static-dist/index.html',import.meta.url),'utf8');
  assert.match(home,/data-deployment="static"/);
  assert.match(home,/<span>文档检索<\/span>/);
  assert.match(home,/不生成模型回答/);
  const sitemap=await readFile(new URL('../static-dist/sitemap.xml',import.meta.url),'utf8');
  assert.ok(!sitemap.includes('localhost'));
});

test('Docker runtime COPY sources exist',async()=>{
  const dockerfile=await readFile(new URL('../../Dockerfile',import.meta.url),'utf8');
  for(const match of dockerfile.matchAll(/^COPY --chown=node:node (\S+) /gm)){
    await access(new URL('../../'+match[1],import.meta.url));
  }
});
