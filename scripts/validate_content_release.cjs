'use strict';
/* Validate changed public research/project records before a staging publication PR.
 * Validates declared fields, not the truth of research claims or external URLs.
 */
const fs=require('node:fs');
const required=['title_en','title_zh','subtitle_en','subtitle_zh','summary_en','summary_zh'];
const categories=new Set(['research','project']);
const publicationStatuses=new Set(['work_in_progress','preprint','peer_reviewed']);
const text=v=>typeof v==='string'?v.trim():'';
function stable(value){
 if(Array.isArray(value))return value.map(stable);
 if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])]));
 return value;
}
function same(a,b){return JSON.stringify(stable(a))===JSON.stringify(stable(b));}
function checkUrl(value){
 try{const u=new URL(text(value));return u.protocol==='https:'&&!!u.hostname&&!u.username&&!u.password;}
 catch(_){return false;}
}
function validate(base,staged){
 if(!Array.isArray(base)||!Array.isArray(staged))throw Error('works.json root must be an array');
 const errors=[],notes=[],seen=new Set(),old=new Map();
 for(const item of base){
  if(item&&typeof item==='object'&&text(item.slug))old.set(item.slug,item);
 }
 for(const item of staged){
  if(!item||typeof item!=='object'){errors.push('Record must be an object');continue;}
  const slug=text(item.slug);
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))errors.push('Invalid slug: '+(slug||'(missing)'));
  if(seen.has(slug))errors.push('Duplicate slug: '+slug);
  seen.add(slug);
 }
 let changed=0,publishedChanged=0,removed=0;
 for(const item of staged){
  if(!item||typeof item!=='object')continue;
  const slug=text(item.slug),before=old.get(slug);
  if(before&&same(before,item))continue;
  changed++;
  if(item.published!==true)continue;
  publishedChanged++;
  for(const field of required)if(!text(item[field]))errors.push(slug+': published item missing '+field);
  if(!categories.has(item.category))errors.push(slug+': invalid category');
  if(item.category==='research'){
   const status=text(item.publication_status)||'work_in_progress';
   if(!publicationStatuses.has(status))errors.push(slug+': unsupported publication_status');
   if((status==='preprint'||status==='peer_reviewed')&&!checkUrl(item.paper))
     errors.push(slug+': '+status+' requires a valid HTTPS paper URL');
   if(status==='peer_reviewed'&&!text(item.publication_venue))
     errors.push(slug+': peer_reviewed requires publication_venue');
  }
  notes.push(slug+': public entry changed; confirm provenance, author credit and external links manually');
 }
 for(const item of base){
  if(item&&typeof item==='object'&&text(item.slug)&&!seen.has(item.slug)){
   removed++;
   if(item.published===true)notes.push(item.slug+': published item removed; confirm intentional removal');
  }
 }
 return {ok:errors.length===0,changed,publishedChanged,removed,errors,notes};
}
function main(){
 if(process.argv.length!==4)throw Error('Usage: node scripts/validate_content_release.cjs base.json staged.json');
 const [base,staged]=process.argv.slice(2).map(file=>JSON.parse(fs.readFileSync(file,'utf8')));
 const result=validate(base,staged);
 console.log('Changed: '+result.changed+'; changed public: '+result.publishedChanged+'; removed: '+result.removed);
 result.notes.forEach(x=>console.log('REVIEW: '+x));
 result.errors.forEach(x=>console.error('ERROR: '+x));
 if(!result.ok)process.exitCode=1;
}
if(require.main===module){try{main();}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={validate,stable,same,checkUrl};
