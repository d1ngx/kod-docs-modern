import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync } from 'node:zlib';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const contentMode=process.argv.includes('--content');
const directory=path.join(root,contentMode?'modern-docs/dist':'modern-docs/static-dist');
const table=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=(n&1)?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
const crc32=buffer=>{let crc=0xffffffff;for(const byte of buffer)crc=table[(crc^byte)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;};
async function walk(dir,prefix=''){let files=[];for(const item of await readdir(dir,{withFileTypes:true})){const name=prefix+item.name;if(item.isDirectory())files.push(...await walk(path.join(dir,item.name),name+'/'));else files.push(name);}return files.sort();}
const chunks=[],central=[];let offset=0;
const files=await walk(directory);
for(const name of files){
 const raw=await readFile(path.join(directory,name)),data=deflateRawSync(raw),filename=Buffer.from(name),crc=crc32(raw);
 const header=Buffer.alloc(30);header.writeUInt32LE(0x04034b50);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);header.writeUInt16LE(8,8);header.writeUInt16LE(33,12);header.writeUInt32LE(crc,14);header.writeUInt32LE(data.length,18);header.writeUInt32LE(raw.length,22);header.writeUInt16LE(filename.length,26);
 const entry=Buffer.alloc(46);entry.writeUInt32LE(0x02014b50);entry.writeUInt16LE(20,4);entry.writeUInt16LE(20,6);entry.writeUInt16LE(0x800,8);entry.writeUInt16LE(8,10);entry.writeUInt16LE(33,14);entry.writeUInt32LE(crc,16);entry.writeUInt32LE(data.length,20);entry.writeUInt32LE(raw.length,24);entry.writeUInt16LE(filename.length,28);entry.writeUInt32LE(offset,42);
 chunks.push(header,filename,data);central.push(entry,filename);offset+=header.length+filename.length+data.length;
}
const centralSize=central.reduce((sum,b)=>sum+b.length,0),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(centralSize,12);end.writeUInt32LE(offset,16);
await mkdir(path.join(root,'modern-docs/releases'),{recursive:true});
const output=path.join(root,contentMode?'modern-docs/releases/kod-docs-content.zip':'modern-docs/releases/kod-docs-static.zip');await writeFile(output,Buffer.concat([...chunks,...central,end]));console.log(`Packaged ${files.length} ${contentMode?'server content':'static'} files → ${output}`);
