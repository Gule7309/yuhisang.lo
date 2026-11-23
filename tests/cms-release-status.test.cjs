'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {analyze,allowedFile,diffWorks}=require('../admin/release-status-core.js');

test('synced branch and no pending diff',()=>{
 const x=analyze({status:'identical',ahead_by:0,behind_by:0,files:[]});
 assert.equal(x.state,'synced');
 assert.equal(x.candidateCount,0);
});
test('ahead branch displays review candidates and known open PR',()=>{
 const result=analyze({status:'ahead',ahead_by:2,behind_by:0,files:[{filename:'content/works.json',status:'modified'}]},
 [{state:'open',head:{ref:'cms-staging'},base:{ref:'main'},number:35,html_url:'https://github.com/Gule7309/yuhisang.lo/pull/35',draft:true}]);
 assert.equal(result.state,'review');
 assert.equal(result.risky.length,0);
 assert.equal(result.openPR.number,35);
 assert.equal(result.openPR.draft,true);
});
test('diverged or unsafe changes need attention',()=>{
 assert.equal(analyze({status:'diverged',ahead_by:1,behind_by:2,files:[]}).state,'attention');
 const a=analyze({status:'ahead',ahead_by:1,behind_by:0,files:[{filename:'admin/config.yml',status:'modified'}]});
 assert.equal(a.state,'attention');
 assert.equal(a.risky[0].path,'admin/config.yml');
 assert.equal(analyze({status:'ahead',ahead_by:1,behind_by:0,files:Array.from({length:300},(_,i)=>({filename:'assets/uploads/p'+i+'.png'}))}).truncated,true);
});
test('only CMS content and safe asset paths count as release changes',()=>{
 for(const f of ['content/works.json','assets/cv/file.pdf','assets/uploads/figure.svg'])assert.equal(allowedFile(f),true);
 for(const f of ['admin/config.yml','/content/works.json','assets/../admin/secrets','assets\\uploads\\a.png','assets/uploads/../evil'])assert.equal(allowedFile(f),false);
});
test('effective works diff ignores field order and reports add/change/remove',()=>{
 const base=[{slug:'a',title_en:'Alpha',published:true,nested:{a:1,b:2}},{slug:'b',title_en:'Beta',published:true}];
 const stage=[{published:true,title_en:'Alpha',slug:'a',nested:{b:2,a:1}},
  {slug:'c',title_zh:'新研究',published:false}];
 const differences=diffWorks(base,stage);
 assert.deepEqual(differences.map(x=>[x.slug,x.type]),[['c','added'],['b','removed']]);
 assert.equal(differences[0].published,false);
 const modified=diffWorks([{slug:'a',summary_en:'old'}],[{slug:'a',summary_en:'new'}]);
 assert.equal(modified[0].type,'modified');
});
test('invalid works data fails closed instead of hiding duplicate slugs',()=>{
 assert.throws(()=>diffWorks([{slug:'x'},{slug:'x'}],[]),/Duplicate/);
 assert.throws(()=>diffWorks([],null),/Invalid works/);
});
test('release dashboard is read-only, includes accessible refresh and real diff',()=>{
 const root=path.join(__dirname,'..');
 const html=fs.readFileSync(path.join(root,'admin/publish.html'),'utf8');
 const client=fs.readFileSync(path.join(root,'admin/release-status.js'),'utf8');
 assert.match(html,/id="release-status" role="status"/);
 assert.match(html,/id="work-diff"/);
 assert.match(html,/id="refresh"/);
 assert.match(client,/raw\.githubusercontent\.com/);
 assert.match(client,/api\.diffWorks/);
 assert.doesNotMatch(client,/\b(POST|PATCH|PUT|DELETE)\b|localStorage|Bearer |github_pat_/);
});
