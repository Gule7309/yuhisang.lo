const test=require("node:test");
const assert=require("node:assert/strict");
const {checks,filter,localized,publicPath}=require("../admin/review-core.js");

test("bilingual required-field checks flag missing content",()=>{
 const item={slug:"agent-study",category:"research",published:false,title_en:"Agent Study",title_zh:"代理研究",subtitle_en:"Proposal",subtitle_zh:"提案",summary_en:"Study",summary_zh:""};
 const results=checks(item);
 assert(results.some(x=>x.label==="summary · zh"&&x.status==="issue"));
 assert(results.some(x=>x.label==="Research question · en"&&x.status==="note"));
 assert.equal(results.find(x=>x.label==="公開狀態").status,"note");
});
test("publication status flags missing own-paper evidence without asserting validity",()=>{
 const item={slug:"research-note",category:"research",publication_status:"peer_reviewed",paper:"",publication_venue:""};
 assert(checks(item).some(x=>x.label==="Paper URL"&&x.status==="issue"));
 assert(checks(item).some(x=>x.label==="Venue"&&x.status==="issue"));
 assert(checks(item).some(x=>x.label==="Publication claims"&&x.status==="note"));
});
test("filter matches either language and prevents hidden public-page links",()=>{
 const items=[{slug:"one",category:"research",published:true,title_en:"Agents",title_zh:"代理研究"},{slug:"two",category:"project",published:false,title_en:"Design",title_zh:"設計"}];
 assert.equal(filter(items,{q:"代理"}).length,1);
 assert.equal(filter(items,{category:"project",visibility:"hidden"}).length,1);
 assert.equal(filter(items,{visibility:"published"}).length,1);
 assert.equal(publicPath(items[1],"zh"),"");
 assert.equal(publicPath(items[0],"zh"),"/yuhisang.lo/zh/research/one/");
 assert.equal(localized({title_en:"Fallback"},"title","zh"),"Fallback");
});
test("unsafe slugs are never linked",()=>{
 assert.equal(publicPath({slug:"../../bad",category:"project",published:true},"en"),"");
});