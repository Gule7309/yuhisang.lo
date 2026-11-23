'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {checks,audit,filter,translated,localized,publicPath,validHttps}=require('../admin/review-core.js');
test('missing translation is reported even when public page falls back to English',()=>{
 const x={slug:'agent-study',category:'research',published:false,title_en:'Agent Study',title_zh:'',subtitle_en:'Proposal',subtitle_zh:'提案',summary_en:'Evaluation',summary_zh:''};
 const findings=checks(x);
 assert(findings.some(f=>f.label==='title · zh'&&f.status==='issue'));
 assert(findings.some(f=>f.label==='summary · zh'&&f.status==='issue'));
 assert.equal(translated(x,'title','zh'),'');
 assert.equal(localized(x,'title','zh'),'Agent Study');
 assert(findings.some(f=>f.label==='公開範圍'&&f.reason.includes('GitHub')));
});
test('publication assertions require valid HTTPS links and venue but never claim verification',()=>{
 const r={slug:'agent-study',category:'research',publication_status:'peer_reviewed',paper:'http://example.org/paper',publication_venue:''};
 assert(checks(r).some(f=>f.label==='Paper URL'&&f.status==='issue'));
 assert(checks(r).some(f=>f.label==='Venue'&&f.status==='issue'));
 assert(checks(r).some(f=>f.label==='Publication claims'&&f.status==='note'));
 assert.equal(validHttps('https://example.org/article'),true);
 assert.equal(validHttps('https://user:pass@example.org/article'),false);
 assert.equal(validHttps('javascript:alert(1)'),false);
});
test('duplicate slug audit is stable and supports issue-only filters',()=>{
 const raw=[
 {slug:'one',category:'research',published:true,title_zh:'代理'},
 {slug:'one',category:'project',published:false,title_en:'Design'},
 {slug:'two',category:'project',published:true,title_en:'Alpha',title_zh:'阿爾法',subtitle_en:'b',subtitle_zh:'b',summary_en:'c',summary_zh:'c'}
 ];
 const items=audit(raw);
 assert.equal(items.length,3);
 assert(items[0].checks.some(f=>f.label==='Duplicate slug'&&f.status==='issue'));
 assert.notEqual(items[0].index,items[1].index);
 assert.equal(filter(items,{q:'代理'}).length,1);
 assert.equal(filter(items,{category:'project',visibility:'hidden',problems:'issues'}).length,1);
 assert.equal(filter(items,{visibility:'published'}).length,2);
});
test('public links are limited to known published slugs',()=>{
 assert.equal(publicPath({slug:'../private',published:true,category:'research'},'en'),'');
 assert.equal(publicPath({slug:'good',published:false,category:'research'},'en'),'');
 assert.equal(publicPath({slug:'good',published:true,category:'research'},'zh'),'/yuhisang.lo/zh/research/good/');
});
test('review UI is read-only and live editor links to committed review',()=>{
 const root=path.resolve(__dirname,'..');
 const html=fs.readFileSync(path.join(root,'admin/review.html'),'utf8');
 const js=fs.readFileSync(path.join(root,'admin/review.js'),'utf8');
 const editor=fs.readFileSync(path.join(root,'admin/editor-preview.js'),'utf8');
 assert.match(html,/id="problems"/);
 assert(js.includes('fetch("../content/works.json"'));
 assert.match(js,/api\.audit\(data\)/);
 assert.match(editor,/\/admin\/review\.html/);
 assert.doesNotMatch(js,/fetch\([^\n]*method:[ ]*["'](POST|PUT|PATCH|DELETE)/);
 assert.doesNotMatch(js,/localStorage\.setItem|github\.com\/repos\/.*\/contents/);
});
