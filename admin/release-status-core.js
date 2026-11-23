/* Read-only interpretation of GitHub staging release state, shared by UI and tests. */
(function(root,factory){
  "use strict";
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.PortfolioReleaseStatus=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  const REPO="Gule7309/yuhisang.lo";
  const allowed=new Set(["content/profile.json","content/works.json","content/news.json","content/writing.json","content/achievements.json","content/personal.json"]);
  function allowedFile(file){
    if(typeof file!=="string"||!file||file.startsWith("/")||file.includes("\\")||
      file.split("/").some(part=>part===".."||part==="."||!part))return false;
    return allowed.has(file)||(/^(assets\/uploads|assets\/cv)\/.+/.test(file));
  }
  function analyze(compare,prs=[]){
    if(!compare||typeof compare!=="object")throw Error("Invalid comparison data");
    const ahead=Math.max(0,Number(compare.ahead_by)||0);
    const behind=Math.max(0,Number(compare.behind_by)||0);
    const changes=Array.isArray(compare.files)?compare.files.map(x=>({
      path:String(x.filename||""),status:String(x.status||"modified")
    })):[];
    const risky=changes.filter(x=>!allowedFile(x.path));
    const truncated=changes.length>=300;
    const open=Array.isArray(prs)?prs.find(x=>x&&x.state==="open"&&x.head?.ref==="cms-staging"&&x.base?.ref==="main"):null;
    const status=typeof compare.status==="string"?compare.status:(ahead&&behind?"diverged":ahead?"ahead":behind?"behind":"identical");
    // GitHub compare file list is relative to the merge-base, NOT necessarily a
    // true tip-to-tip diff after a squash merge. Never label these guaranteed unpublished.
    const blocked=status==="behind"||status==="diverged"||behind>0||risky.length>0||truncated;
    return {ahead,behind,status,changes,risky,truncated,openPR:open?{number:open.number,url:open.html_url,draft:!!open.draft}:null,
      candidateCount:changes.length,
      state:status==="identical"?"synced":blocked?"attention":changes.length?"review":"sync-needed"};
  }
  function snapshot(value){
    if(Array.isArray(value))return value.map(snapshot);
    if(value&&typeof value==="object"){
      const out={};
      for(const key of Object.keys(value).sort())out[key]=snapshot(value[key]);
      return out;
    }
    return value;
  }
  function diffWorks(live,staged){
    if(!Array.isArray(live)||!Array.isArray(staged))throw Error("Invalid works JSON");
    const key=item=>String(item&&item.slug||"").trim();
    const valid=arr=>arr.every(x=>x&&typeof x==="object"&&key(x))&&
      new Set(arr.map(key)).size===arr.length;
    if(!valid(live)||!valid(staged))throw Error("Duplicate or missing slugs: inspect JSON manually");
    const main=new Map(live.map(item=>[key(item),item]));
    const draft=new Map(staged.map(item=>[key(item),item]));
    const changes=[];
    for(const item of staged){
      const slug=key(item),original=main.get(slug);
      const type=!original?"added":JSON.stringify(snapshot(original))!==JSON.stringify(snapshot(item))?"modified":null;
      if(type)changes.push({slug,type,title:String(item.title_zh||item.title_en||slug),published:item.published===true});
    }
    for(const item of live)if(!draft.has(key(item)))
      changes.push({slug:key(item),type:"removed",title:String(item.title_zh||item.title_en||key(item)),published:item.published===true});
    return changes;
  }
  return {analyze,allowedFile,diffWorks,REPO};
});
