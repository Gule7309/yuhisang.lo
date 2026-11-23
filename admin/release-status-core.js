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
  return {analyze,allowedFile,REPO};
});
