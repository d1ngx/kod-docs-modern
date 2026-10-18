import { search } from './search.js';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const safe = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const copyIcon = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="1"/><path d="M16 8V3H3v13h5"/></svg>';
const sections = { start:'快速入门', setup:'安装部署', user:'用户手册', admin:'管理员手册', guide:'TeamOS 指南' };
let docsPromise;
const getDocs = () => docsPromise ||= fetch('/search-index.json').then(r=>{if(!r.ok)throw Error('搜索索引加载失败');return r.json();}).catch(e=>{docsPromise=null;throw e;});
function show(id) {
  $$('dialog[open]').forEach(dialog=>{if(dialog.id!==id.slice(1))dialog.close();});
  if(!$(id).open)$(id).showModal();
}
function openAI(question) {
  show('#ai-dialog');
  if(question)$('#ai-question').value=question;
  updateSend();$('#ai-question').focus();
  if(question)$('#ai-form').requestSubmit();
}
$$('[data-search]').forEach(button=>button.addEventListener('click',()=>{show('#search-dialog');$('#search-input').focus();}));
$$('[data-ai]').forEach(button=>button.addEventListener('click',()=>openAI()));
$$('[data-question]').forEach(button=>button.addEventListener('click',()=>openAI(button.dataset.question)));
$$('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
$$('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const rect=dialog.getBoundingClientRect();
  if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();
}));
document.addEventListener('keydown',event=>{
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){
    event.preventDefault();show('#search-dialog');$('#search-input').focus();
  }
  if(event.key==='Escape'&&$('#sidebar')?.classList.contains('visible'))setMenu(false);
});
$('#hero-question')?.addEventListener('input',event=>$('#hero-form button').disabled=!event.target.value.trim());
$('#hero-form')?.addEventListener('submit',event=>{event.preventDefault();const question=$('#hero-question').value.trim();if(question)openAI(question);});
$('#announcement-close')?.addEventListener('click',()=>$('#announcement').hidden=true);
$('#show-more')?.addEventListener('click',event=>{
  const button=event.currentTarget, expanded=button.getAttribute('aria-expanded')!=='true';
  button.setAttribute('aria-expanded',String(expanded));$$('.more-docs').forEach(row=>row.hidden=!expanded);
  button.firstChild.textContent=expanded?'收起文档 ':'查看更多 ';
});

let searchRevision=0;
function highlight(value,query) {
  const text=String(value), needle=query.trim().toLocaleLowerCase();
  if(!needle)return safe(text);
  let start=0, result='', index;
  while((index=text.toLocaleLowerCase().indexOf(needle,start))!==-1){result+=safe(text.slice(start,index))+'<mark>'+safe(text.slice(index,index+needle.length))+'</mark>';start=index+needle.length;}
  return result+safe(text.slice(start));
}
async function runSearch() {
  const revision=++searchRevision, query=$('#search-input').value.trim();
  if(!query){$('#search-results').innerHTML='<p class="search-empty">输入关键词，搜索可道云文档</p>';$('#search-status').textContent='';return;}
  $('#search-status').textContent='正在搜索…';
  try {
    const documents=await getDocs();if(revision!==searchRevision)return;
    const category=$('#search-section').value;
    const results=search(category?documents.filter(doc=>doc.section===category):documents,query,40);
    $('#search-status').textContent=results.length?`${results.length} 条结果`:'没有匹配结果';
    $('#search-results').innerHTML=results.length?results.map(doc=>`<a class="search-result" href="${safe(doc.url)}"><small>${safe(sections[doc.section])} / ${safe(doc.title)}</small><strong>${highlight(doc.title,query)}</strong><p>${highlight(doc.excerpt,query)}</p></a>`).join(''):'<p class="search-empty">没有找到相关文档，请试试其他关键词。</p>';
  }catch(error){if(revision===searchRevision)$('#search-status').textContent=error.message;}
}
$('#search-input').addEventListener('input',runSearch);$('#search-section').addEventListener('change',runSearch);
$('#search-dialog').addEventListener('keydown',event=>{
  if(!['ArrowDown','ArrowUp','Enter'].includes(event.key)||event.target.tagName==='SELECT')return;
  const results=$$('.search-result');if(!results.length)return;
  const current=results.indexOf(document.activeElement);
  if(event.key==='Enter'&&event.target.id==='search-input'){event.preventDefault();results[0].click();return;}
  if(event.key==='Enter')return;
  event.preventDefault();const next=current<0?(event.key==='ArrowDown'?0:results.length-1):(current+(event.key==='ArrowDown'?1:-1)+results.length)%results.length;
  results[next].focus();
});

const systemTheme=matchMedia('(prefers-color-scheme: dark)');
function applyTheme(preference){
  document.documentElement.dataset.themePreference=preference;
  document.documentElement.dataset.theme=preference==='auto'?(systemTheme.matches?'dark':'light'):preference;
  $('#theme-toggle').title='主题：'+({auto:'跟随系统',light:'浅色',dark:'深色'}[preference]);
  $('#theme-toggle').setAttribute('aria-label',$('#theme-toggle').title+'，点击切换');
}
applyTheme(document.documentElement.dataset.themePreference||'auto');
$('#theme-toggle').addEventListener('click',()=>{
  const next={auto:'light',light:'dark',dark:'auto'}[document.documentElement.dataset.themePreference]||'auto';
  applyTheme(next);try{localStorage.setItem('kod-theme',next);}catch{}
});
systemTheme.addEventListener('change',()=>{if(document.documentElement.dataset.themePreference==='auto')applyTheme('auto');});
function setMenu(open) {
  $('#sidebar')?.classList.toggle('visible',open);
  $('#menu-toggle')?.setAttribute('aria-expanded',String(open));
  if($('.sidebar-backdrop'))$('.sidebar-backdrop').hidden=!open;
  if(open)$('#menu-close')?.focus();else $('#menu-toggle')?.focus();
}
$('#menu-toggle')?.addEventListener('click',()=>setMenu(!$('#sidebar').classList.contains('visible')));
$('#menu-close')?.addEventListener('click',()=>setMenu(false));
$('.sidebar-backdrop')?.addEventListener('click',()=>setMenu(false));
const mobileQuery=matchMedia('(max-width:767px)');mobileQuery.addEventListener('change',event=>{if(!event.matches&&$('#sidebar')?.classList.contains('visible'))setMenu(false);});
$('#sidebar')?.addEventListener('keydown',event=>{
  if(event.key!=='Tab'||!$('#sidebar').classList.contains('visible'))return;
  const focusable=[...$('#sidebar').querySelectorAll('button,a,summary')].filter(el=>el.getClientRects().length);
  if(event.shiftKey&&document.activeElement===focusable[0]){event.preventDefault();focusable.at(-1).focus();}
  else if(!event.shiftKey&&document.activeElement===focusable.at(-1)){event.preventDefault();focusable[0].focus();}
});
const activePage=$('#sidebar-current-page');
if(activePage&&$('#sidebar').clientHeight){const sidebar=$('#sidebar'),bounds=activePage.getBoundingClientRect();if(bounds.bottom>innerHeight-100)sidebar.scrollTop=activePage.offsetTop-sidebar.offsetTop-sidebar.clientHeight/2;}

async function copyText(button,text,label='已复制'){
  const before=button.innerHTML;
  try{await navigator.clipboard.writeText(text);button.textContent=label;}catch{button.textContent='请手动选择复制';}
  setTimeout(()=>button.innerHTML=before,1800);
}
$$('article pre').forEach(pre=>{
  const button=document.createElement('button');button.className='copy-code';button.innerHTML=copyIcon;button.setAttribute('aria-label','复制代码');button.title='复制代码';
  button.addEventListener('click',()=>copyText(button,pre.querySelector('code')?.textContent||''));pre.append(button);
});
$('[data-copy-markdown]')?.addEventListener('click',async event=>{
  const button=event.currentTarget;
  try{const response=await fetch(document.body.dataset.markdown);if(!response.ok)throw Error();await copyText(button,await response.text());}
  catch{button.querySelector('span').textContent='复制失败，请查看 Markdown';}
});
const tocLinks=$$('.toc a');
if(tocLinks.length)tocLinks[0].classList.add('active');
const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){if(!entry.isIntersecting)continue;tocLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')==='#'+entry.target.id));}
},{rootMargin:'-80px 0px -65% 0px'});$$('article h2,article h3').forEach(heading=>observer.observe(heading));

let asking=false, askController, answerGeneration=0;
function updateSend(){ $('#ai-submit').disabled=asking||!$('#ai-question').value.trim(); }
$('#ai-question').addEventListener('input',updateSend);
$('#ai-question').addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();if(!$('#ai-submit').disabled)$('#ai-form').requestSubmit();}});
$('#ai-reset').addEventListener('click',()=>{
  answerGeneration++;askController?.abort();asking=false;$('#ai-answer').replaceChildren();$('#ai-answer').setAttribute('aria-busy','false');$('#ai-welcome').hidden=false;$('#ai-question').value='';updateSend();$('#ai-question').focus();
});
$('#ai-form').addEventListener('submit',async event=>{
  event.preventDefault();const question=$('#ai-question').value.trim();if(asking||!question)return;
  asking=true;updateSend();const generation=++answerGeneration,answer=$('#ai-answer');$('#ai-welcome').hidden=true;
  answer.innerHTML=`<div class="ai-user-message">${safe(question)}</div><div class="ai-status">正在检索文档并生成回答…</div>`;answer.setAttribute('aria-busy','true');$('.ai-scroll').scrollTop=0;
  askController=new AbortController();const timer=setTimeout(()=>askController.abort(),65000);
  try {
    let result;
    if(document.documentElement.dataset.deployment==='static') {
      const matches=search(await getDocs(),question,5);
      result={mode:'retrieval',answer:matches.length?matches.map(d=>`【${d.title}】\n${d.excerpt}`).join('\n\n'):'没有找到相关文档，请尝试其他关键词。',sources:matches.map(({url,title})=>({url,title}))};
    } else {
      const response=await fetch('/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,page:location.pathname}),signal:askController.signal});
      result=await response.json();if(!response.ok)throw Error(result.error||'AI 请求失败');
    }
    if(generation!==answerGeneration)return;
    answer.querySelector('.ai-status')?.remove();
    if(result.mode==='retrieval'){const notice=document.createElement('p');notice.className='muted';notice.textContent='当前为文档检索模式。连接模型后可生成 AI 回答。';answer.append(notice);}
    const content=document.createElement('div');content.className='answer-text';content.textContent=result.answer;answer.append(content);
    if(result.sources.length){const sources=document.createElement('div');sources.className='sources';sources.innerHTML='<b>参考文档</b>'+result.sources.map((source,i)=>`<a href="${safe(source.url)}">[${i+1}] ${safe(source.title)} ↗</a>`).join('');answer.append(sources);}
    const copy=document.createElement('button');copy.className='answer-copy';copy.innerHTML=copyIcon+' 复制回答';copy.addEventListener('click',()=>copyText(copy,result.answer));answer.append(copy);
  }catch(error){if(generation!==answerGeneration)return;answer.querySelector('.ai-status')?.remove();const message=document.createElement('p');message.className='ai-error';message.setAttribute('role','alert');message.textContent=error.name==='AbortError'?'请求超时，请稍后重试。':error.message;answer.append(message);}
  finally{clearTimeout(timer);if(generation===answerGeneration){asking=false;answer.setAttribute('aria-busy','false');updateSend();}}
});

$$('[data-help-tab]').forEach(button=>button.addEventListener('click',()=>{
 const name=button.dataset.helpTab;
 $$('.help-by-product [data-tab]').forEach(el=>el.classList.toggle('active',el.dataset.tab===name));
 $$('[data-help-tab]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));
}));
$$('[data-help-os]').forEach(button=>button.addEventListener('click',()=>{
 $('.help-by-product div[data-tab="desktop"]').dataset.os=button.dataset.helpOs;
 $$('[data-help-os]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));
}));
