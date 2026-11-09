const test=require('node:test');
const assert=require('node:assert/strict');
const preview=require('../admin/editor-preview.js');
function entry(values){return {getIn(path){return values[path[1]];}};}
test('unsaved English and Chinese fields are read from editor entry',()=>{
  const draft=entry({title_en:'Draft',title_zh:'草稿',summary_en:'Experimental',summary_zh:'實驗中',subtitle_en:'Research',subtitle_zh:'研究'});
  assert.equal(preview.read(draft,'title_zh'),'草稿');
  assert.deepEqual(preview.inspect(draft).missing,[]);
});
test('missing fields are reported without declaring peer review',()=>{
  const draft=entry({category:'research',publication_status:'peer_reviewed',title_en:'Example'});
  const result=preview.inspect(draft);
  assert(result.missing.includes('title_zh'));
  assert(result.missing.includes('paper'));
  assert(result.missing.includes('publication_venue'));
});
test('preview renderer includes both languages and does not call save',()=>{
  const data={category:'project',year:'2026',published:true,title_en:'Test project',title_zh:'測試專案',subtitle_en:'Prototype',subtitle_zh:'原型',summary_en:'Demo',summary_zh:'展示'};
  const fakeCreate=(tag,props,...children)=>({tag,props:props||{},children});
  const tree=preview.render({entry:entry(data)},fakeCreate);
  const text=JSON.stringify(tree);
  assert(text.includes('Test project'));
  assert(text.includes('測試專案'));
  assert(text.includes('Marked Published'));
  assert(!text.includes('fetch('));
});
test('safe registration uses documented API only',()=>{
  const code=require('node:fs').readFileSync(require('node:path').join(__dirname,'../admin/editor-preview.js'),'utf8');
  assert(code.includes('registerPreviewTemplate("works"'));
  assert(code.includes('registerPreviewStyle('));
  assert(!/registerEventListener|beforeunload|localStorage|github\.com\/repos/.test(code));
});
