'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {validate,checkUrl}=require('../scripts/validate_content_release.cjs');
const good=(slug='test')=>({slug,category:'research',published:true,title_en:'Title',title_zh:'標題',
 subtitle_en:'Sub',subtitle_zh:'副標題',summary_en:'Summary',summary_zh:'摘要',publication_status:'work_in_progress'});
test('unchanged public record need not be revalidated during unrelated content publication',()=>{
 const x=good();delete x.summary_zh;
 const result=validate([x],[{...x}]);
 assert.equal(result.ok,true);
 assert.equal(result.changed,0);
});
test('new or changed published entry requires six bilingual fields',()=>{
 const item=good();delete item.title_zh;
 const r=validate([],[item]);
 assert.equal(r.ok,false);
 assert(r.errors.some(x=>x.includes('title_zh')));
 assert.equal(r.publishedChanged,1);
});
test('unpublished draft can be incomplete but slug must still be safe and unique',()=>{
 const r=validate([],[{slug:'draft',published:false},{slug:'draft',published:false}]);
 assert.equal(r.ok,false);
 assert(r.errors.some(x=>x.includes('Duplicate')));
 assert.equal(validate([],[{slug:'draft',published:false}]).ok,true);
});
test('paper statuses and evidence link syntax are checked, not authenticity',()=>{
 const p=good();p.publication_status='peer_reviewed';p.paper='http://example.com';p.publication_venue='';
 assert(validate([],[p]).errors.some(x=>x.includes('paper URL')));
 assert(validate([],[p]).errors.some(x=>x.includes('publication_venue')));
 p.paper='https://example.com/paper';p.publication_venue='Example';
 assert.equal(validate([],[p]).ok,true);
 assert.equal(checkUrl('https://user:pass@example.com/'),false);
});
test('field order is not a change and published removals require human note',()=>{
 const x=good(), reordered=Object.fromEntries(Object.entries(x).reverse());
 assert.equal(validate([x],[reordered]).changed,0);
 const r=validate([x],[]);
 assert.equal(r.removed,1);
 assert(r.notes.some(x=>x.includes('removed')));
});
