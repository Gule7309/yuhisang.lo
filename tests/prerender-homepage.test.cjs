'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const {build,replaceRegion,SECTION_IDS}=require('../scripts/prerender_homepage.cjs');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,'content',name+'.json'),'utf8'));
test('replacing prerender slots is idempotent and strict',()=>{
 const template='a<!-- prerender:x:start -->old<!-- prerender:x:end -->b';
 const first=replaceRegion(template,'x','new');
 assert.equal(replaceRegion(first,'x','new'),first);
 assert.throws(()=>replaceRegion('missing','x','new'),/Missing/);
});
test('prerender builds visible first paint from the same CMS data as site.js',async()=>{
 const template=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const source={profile:read('profile'),works:read('homepage-works'),news:read('news'),
   writing:read('writing'),achievements:read('achievements'),personal:read('personal')};
 const out=await build(template,source);
 assert.match(out,/<aside id="profile" class="sidebar">[\s\S]*class="avatar"/);
 assert.match(out,/<section id="about">[\s\S]*?<h1>/);
 assert.match(out,/<section id="research">[\s\S]*?<article class="work">/);
 assert.match(out,/<section id="projects">[\s\S]*?<article class="work">/);
 assert.match(out,/<div id="site-status"[^>]* hidden>/);
 assert.match(out,/<!-- prerender:about:start -->/);
 assert.equal(await build(out,source),out,'rebuild must not accumulate or duplicate content');
 for(const id of SECTION_IDS) assert(out.includes('<!-- prerender:'+id+':end -->'));
});
