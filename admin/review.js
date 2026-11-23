(() => {
"use strict";
const $=id=>document.getElementById(id);
const api=window.PortfolioReview;
const state={items:[],selected:""};
const safe=text=>String(text||"");
const el=(tag,klass,text)=>{const node=document.createElement(tag);if(klass)node.className=klass;if(text!==undefined)node.textContent=safe(text);return node;};
function link(parent,label,url){
  const anchor=el("a","",label);anchor.href=url;anchor.rel="noopener noreferrer";anchor.target="_blank";parent.append(anchor);
}
function renderDetail(){
  const box=$("detail");box.replaceChildren();
  const item=state.items.find(x=>x.slug===state.selected);
  if(!item){box.append(el("p","placeholder","選擇一筆研究或作品以檢查內容。"));return;}
  const lang=$("lang").value;
  box.append(el("p","eyebrow",item.category==="research"?"RESEARCH":"PROJECT"));
  box.append(el("h2","detail-title",api.localized(item,"title",lang)||"(尚未填寫標題)"));
  box.append(el("p","detail-summary",api.localized(item,"summary",lang)||"此語言尚未填寫摘要。"));
  const links=el("div","detail-links");
  const path=api.publicPath(item,lang);
  if(path)link(links,"開啟公開頁面",path);
  link(links,"檢查來源 JSON","https://github.com/Gule7309/yuhisang.lo/blob/main/content/works.json");
  box.append(links);
  const checks=api.checks(item);
  const issues=checks.filter(c=>c.status==="issue").length;
  box.append(el("h3","",issues?"需確認的欄位："+issues:"必要欄位檢查通過"));
  const list=el("ul","checklist");
  for(const check of checks){
    const li=el("li",check.status);
    li.append(el("span","state",check.status==="ok"?"OK":check.status==="issue"?"CHECK":"INFO"));
    const detail=el("span");detail.append(el("strong","",check.label),document.createTextNode(" — "+check.reason));li.append(detail);list.append(li);
  }
  box.append(list);
}
function renderList(){
 const matches=api.filter(state.items,{q:$("search").value,category:$("type").value,visibility:$("visibility").value});
 $("status").textContent=matches.length+" 筆結果（公開儲存庫中的已提交資料）";
 const list=$("list");list.replaceChildren();
 if(!matches.length)list.append(el("p","placeholder","找不到符合條件的內容。"));
 for(const record of matches){
   const button=el("button","item");button.type="button";button.setAttribute("aria-current",String(record.slug===state.selected));
   button.append(el("strong","",api.localized(record,"title",$("lang").value)||record.slug));
   const meta=el("span","meta");meta.append(el("span","",record.category==="research"?"Research":"Project"));
   meta.append(el("span","chip "+(record.published===true?"live":"hidden"),record.published===true?"Published":"Hidden"));
   const issues=api.checks(record).filter(x=>x.status==="issue").length;
   if(issues)meta.append(el("span","chip",issues+" checks"));
   button.append(meta);button.addEventListener("click",()=>{state.selected=record.slug;renderList();renderDetail();});
   list.append(button);
 }
}
async function load(){
 try{
   const response=await fetch("../content/works.json",{cache:"no-store"});
   if(!response.ok)throw Error("HTTP "+response.status);
   const data=await response.json();
   if(!Array.isArray(data))throw Error("Invalid JSON");
   state.items=data.filter(x=>x&&typeof x==="object");
   renderList();renderDetail();
 }catch(error){$("status").textContent="資料載入失敗。請確認網路連線後重新整理。";$("list").replaceChildren(el("p","placeholder",String(error.message||error)));}
}
for(const id of ["search","type","visibility"])$(id).addEventListener(id==="search"?"input":"change",renderList);
$("lang").addEventListener("change",()=>{renderList();renderDetail();});
load();
})();