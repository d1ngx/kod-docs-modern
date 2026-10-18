import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const major=Number(process.versions.node.split('.')[0]);
if(major<24){console.error('需要 Node.js 24 或更高版本，请升级 Node 后重试。');process.exit(1);}
const task=process.argv[2]||'build';
const tasks={
  build:[['modern-docs/build.mjs'],['modern-docs/check.mjs']],
  static:[['modern-docs/build.mjs','--static'],['modern-docs/check.mjs','--static'],['modern-docs/package-static.mjs']],
  content:[['modern-docs/build.mjs'],['modern-docs/check.mjs'],['modern-docs/package-static.mjs','--content']],
  check:[['modern-docs/check.mjs']],
};
if(!tasks[task]){console.error('用法：build.cmd [build|static|content|check]');process.exit(1);}
try{await import('markdown-it');await import('yaml');await import('sanitize-html');await import('highlight.js');}
catch{console.error('缺少构建依赖。首次使用请安装 Node.js 24，在仓库根目录运行 npm.cmd install --no-package-lock，然后再运行 .\\build.cmd。');process.exit(1);}
const cwd=fileURLToPath(new URL('../',import.meta.url));
for(const args of tasks[task]){
  const result=spawnSync(process.execPath,args,{cwd,stdio:'inherit'});
  if(result.error){console.error(result.error.message);process.exit(1);}
  if(result.status!==0)process.exit(result.status||1);
}
