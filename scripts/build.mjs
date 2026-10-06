import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateMarkdown } from './markdown-validation.mjs';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
import {marked} from 'marked';
const catalog=JSON.parse(fs.readFileSync(path.join(root,'app/catalog.json'),'utf8'));
const termData=JSON.parse(fs.readFileSync(path.join(root,'app/term-definitions.json'),'utf8'));
const owner=new Map(catalog.pages.map(p=>[path.resolve(root,p.path),p.id]));
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pages=catalog.pages.map(p=>{
 const md=fs.readFileSync(path.join(root,p.path),'utf8');let index=0;const outline=[];
 const renderer=new marked.Renderer();
 renderer.heading=function(token){
  const id='section-'+index++;const content=this.parser.parseInline(token.tokens);
  if(token.depth===1)return '';
  const title=token.text.replace(/[*`]/g,'');outline.push({id,title,depth:token.depth});
  return `<h${token.depth} id="${id}">${content}</h${token.depth}>\n`;
 };
 renderer.link=function({href,title,tokens}){
  const label=this.parser.parseInline(tokens);
  if(/^https?:\/\//.test(href))return `<a href="${escape(href)}" target="_blank" rel="noopener noreferrer">${label}<span class="external" aria-hidden="true">↗</span></a>`;
  const target=owner.get(path.resolve(root,path.dirname(p.path),href.split('#')[0]));
  if(!target)throw new Error(`Unknown article link in ${p.id}: ${href}`);
  return `<a href="#/${target}">${label}</a>`;
 };
 renderer.image=function({href,text}){
  const asset=path.resolve(root,path.dirname(p.path),href);
  if(!asset.startsWith(path.join(root,'content/assets/')))throw new Error('Unexpected asset');
  const mime=href.endsWith('.svg')?'image/svg+xml':'image/png';
  const encoded=fs.readFileSync(asset).toString('base64');
  return `<img src="data:${mime};base64,${encoded}" alt="${escape(text)}" loading="eager"/>`;
 };
 const baseParagraph=marked.Renderer.prototype.paragraph;
 renderer.paragraph=function(token){
  if(token.tokens.length===1 && token.tokens[0].type==='image'){
   const img=token.tokens[0];
   return `<figure><div class="visual-frame" tabindex="0" role="region" aria-label="原理图解">${this.image(img)}</div><figcaption>${escape(img.text)}</figcaption></figure>\n`;
  }
  return baseParagraph.call(this,token);
 };
 const baseTable=marked.Renderer.prototype.table;
 renderer.table=function(token){return `<div class="table-frame" tabindex="0" role="region" aria-label="内容对照表">${baseTable.call(this,token)}</div>`;};
 const renderMd=md.replace(/\n## 相关概念\n[\s\S]*$/,'');
 validateMarkdown(marked,renderMd,p.path);
 const html=marked.parse(renderMd,{renderer,gfm:true});
 // Store readable prose for search; image descriptions and headings remain searchable.
 const text=md.replace(/!\[([^\]]*)\]\([^)]*\)/g,'$1').replace(/\[([^\]]*)\]\([^)]*\)/g,'$1').replace(/[|#*_`]/g,' ').replace(/\s+/g,' ').trim();
 const aliases=p.terms.flatMap(t=>[t,termData.aliases[t]||'']);
 return {id:p.id,group:p.group,title:p.title,question:p.question,summary:p.summary,terms:p.terms,aliases,related:p.related||[],html,text,outline};
});
const payload=JSON.stringify({title:catalog.title,groups:catalog.groups,pages}).replace(/</g,'\\u003c');
const template=fs.readFileSync(path.join(root,'app/reader.html'),'utf8');
const output=template.replace('__PAYLOAD__',payload);
fs.mkdirSync(path.join(root,'site'),{recursive:true});fs.writeFileSync(path.join(root,'site/index.html'),output);
console.log(JSON.stringify({status:'built',pages:pages.length,images:pages.filter(p=>p.html.includes('<img')).length,bytes:Buffer.byteLength(output)},null,2));

fs.copyFileSync(path.join(root,'LICENSE'),path.join(root,'site/LICENSE'));
fs.writeFileSync(path.join(root,'site/.nojekyll'),'');
