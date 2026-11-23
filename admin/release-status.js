(() => {
"use strict";
const api=window.PortfolioReleaseStatus;
const origin="https://api.github.com/repos/"+api.REPO;
const $=id=>document.getElementById(id);
const elem=(tag,className,text)=>{
  const node=document.createElement(tag);
  if(className)node.className=className;
  if(text!==undefined)node.textContent=String(text);
  return node;
};
const setLink=(id,url,label)=>{const a=$(id);a.href=url;if(label)a.textContent=label;};
async function json(endpoint){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),10000);
  try{
    const result=await fetch(origin+endpoint,{headers:{Accept:"application/vnd.github+json"},
      cache:"no-store",signal:controller.signal});
    if(!result.ok)throw Error("GitHub API HTTP "+result.status);
    return await result.json();
  }finally{clearTimeout(timeout);}
}
const count=n=>new Intl.NumberFormat("zh-TW").format(n);
async function loadWorkDiff(){
 const holder=$("work-diff");
 holder.replaceChildren(elem("p","quiet","正在比對兩個分支的 works.json…"));
 try{
   // These are public sources. No credentials or CMS tokens are used.
   const base="https://raw.githubusercontent.com/"+api.REPO+"/";
   const controller=new AbortController();
   const timeout=setTimeout(()=>controller.abort(),10000);
   let snapshots;
   try{
     snapshots=await Promise.all(["main","cms-staging"].map(async ref=>{
       const response=await fetch(base+ref+"/content/works.json",{cache:"no-store",signal:controller.signal});
       if(!response.ok)throw Error("HTTP "+response.status);
       return response.json();
     }));
   }finally{clearTimeout(timeout);}
   const changes=api.diffWorks(snapshots[0],snapshots[1]);
   holder.replaceChildren();
   if(!changes.length){holder.append(elem("p","quiet","Research / Projects 目前沒有實際內容差異。"));return;}
   const summary=elem("p","release-caption",changes.length+" 筆內容差異（草稿分支相對於正式 main）");
   const list=elem("ul","file-list");
   const names={added:"新增",modified:"修改",removed:"移除"};
   for(const c of changes){
     const li=elem("li",c.type==="removed"?"unsafe":"");
     li.append(elem("span","file-name",c.title+" · "+c.slug),
       elem("span","file-state",names[c.type]+(c.published?" · Published":" · Hidden")));
     list.append(li);
   }
   holder.append(summary,list);
 }catch(_){
   holder.replaceChildren(elem("p","quiet","無法取得 Research / Projects 內容差異；請在 GitHub PR 的 Files changed 核對，不應根據本頁判斷可直接發布。"));
 }
}

function render(data,prUnavailable){
  const status=$("release-status");
  const delta=$("branch-delta");
  delta.textContent="staging 領先 "+count(data.ahead)+" commits · 落後 main "+count(data.behind)+" commits";
  status.className="state "+data.state;
  const summaries={
    synced:"兩個分支目前同步，沒有待處理的提交。",
    review:"staging 可能有待審核變更，請查看 PR 與完整 Diff。",
    attention:"發現需要先處理的分支同步或檔案範圍問題，暫不建議發布。",
    "sync-needed":"分支狀態需人工核對，請查看 GitHub Compare。"
  };
  status.textContent=summaries[data.state]||"請手動檢查 GitHub。";
  if(data.openPR&&data.openPR.url.startsWith("https://github.com/"+api.REPO+"/pull/")){
    setLink("release-link",data.openPR.url,"查看現有發佈 PR #"+data.openPR.number+(data.openPR.draft?"（Draft）":""));
  }else{
    setLink("release-link","https://github.com/"+api.REPO+"/compare/main...cms-staging?expand=1",
      "開啟 GitHub Compare / 建立審核 PR");
  }
  const list=$("changed-files");list.replaceChildren();
  if(!data.changes.length){
    list.append(elem("p","quiet","沒有顯示候選變更檔案。若分支歷史不一致，仍需在 GitHub 核對。"));
  }else{
    const ul=elem("ul","file-list");
    for(const item of data.changes){
      const li=elem("li",api.allowedFile(item.path)?"":"unsafe");
      li.append(elem("span","file-name",item.path),elem("span","file-state",item.status));
      ul.append(li);
    }
    list.append(ul);
  }
  const notes=[];
  if(data.behind>0)notes.push("staging 落後 main；發布前需先安全整合 main，不要強制重置含草稿的分支。");
  if(data.risky.length)notes.push("偵測到非 CMS 所有的路徑（共 "+data.risky.length+" 筆）。發佈 PR 的範圍檢查應阻擋這些檔案。");
  if(data.truncated)notes.push("GitHub Compare 最多回傳部分變更檔案。清單可能不完整，不可依此判定發佈安全。");
  if(data.ahead>0&&data.behind>0)notes.push("分支已分歧。Squash merge 後的比較可能重複顯示已發佈的修改，請以 GitHub PR diff 和實際檔案狀態核對。");
  if(prUnavailable)notes.push("PR 狀態暫時無法讀取。請直接在 GitHub 確認是否已有開放的發佈 PR。");
  if(!notes.length)notes.push("此頁只整理公開 GitHub 資訊，並未驗證研究內容、PR checks 或權限；正式發布必須人工審核。");
  const box=$("release-notes");box.replaceChildren();
  for(const note of notes)box.append(elem("p","",note));
}
async function load(){
  $("release-status").textContent="正在讀取 GitHub 分支狀態…";
  $("release-status").className="state";
  $("branch-delta").textContent="";
  const button=$("refresh");
  button.disabled=true;
  try{
    const comparison=await json("/compare/main...cms-staging");
    let prs=[],prUnavailable=false;
    try{prs=await json("/pulls?state=open&base=main&head=Gule7309:cms-staging&per_page=20");}
    catch(_){prUnavailable=true;}
    render(api.analyze(comparison,prs),prUnavailable);
    await loadWorkDiff();
  }catch(error){
    $("release-status").className="state attention";
    $("release-status").textContent="無法取得 GitHub 分支狀態，請使用下方 GitHub Compare 連結。";
    $("release-notes").textContent=error.name==="AbortError"?"GitHub API 請求逾時。":"可能是 GitHub API 流量限制、網路或暫時性服務問題。";
  }finally{button.disabled=false;}
}
$("refresh").addEventListener("click",load);
load();
})();
