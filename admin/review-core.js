/* Public portfolio content review. Read-only, dependency-free, source-based. */
(function(root,factory){
  "use strict";
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.PortfolioReview=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  const text=value=>String(value==null?"":value).trim();
  const norm=value=>text(value).normalize("NFKC").toLocaleLowerCase();
  const slugOK=value=>/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(text(value));
  const translated=(record,field,lang)=>text(record[field+"_"+lang]);
  const localized=(record,field,lang)=>translated(record,field,lang)||translated(record,field,"en");
  const validHttps=value=>{
    try{
      const link=new URL(text(value));
      return link.protocol==="https:"&&!!link.hostname&&!link.username&&!link.password;
    }catch(_){return false;}
  };
  function checks(record){
    const out=[];
    const add=(status,label,reason)=>out.push({status,label,reason});
    for(const field of ["title","subtitle","summary"]){
      for(const lang of ["en","zh"]){
        const filled=!!translated(record,field,lang);
        add(filled?"ok":"issue",field+" · "+lang,filled?"已填寫":"必要欄位尚未填寫（英文回退不代表翻譯完成）");
      }
    }
    add(slugOK(record.slug)?"ok":"issue","Slug",slugOK(record.slug)?"格式有效":"只能使用小寫英文、數字與連字號");
    add(["research","project"].includes(record.category)?"ok":"issue","Category",["research","project"].includes(record.category)?"分類有效":"未知分類");
    if(record.category==="research"){
      for(const lang of ["en","zh"]){
        const filled=!!translated(record,"research_question",lang);
        add(filled?"ok":"note","Research question · "+lang,filled?"已填寫":"選填：可補充研究問題");
      }
      const status=text(record.publication_status)||"work_in_progress";
      if(!["work_in_progress","preprint","peer_reviewed"].includes(status)){
        add("issue","Publication status","未知發表狀態，需人工確認");
      }
      if(["preprint","peer_reviewed"].includes(status)){
        const valid=validHttps(record.paper);
        add(valid?"ok":"issue","Paper URL",valid?"HTTPS 連結格式有效，但未驗證內容":"此發表狀態需要有效的 HTTPS 論文連結");
      }
      if(status==="peer_reviewed"){
        add(text(record.publication_venue)?"ok":"issue","Venue",text(record.publication_venue)?"已填寫（尚未驗證）":"Peer reviewed 需要填寫已核實的 Venue");
      }
      add("note","Publication claims","論文狀態、作者與發表證據都需人工驗證，此工具只檢查資料完整性");
    }
    if(record.image){
      add("note","Media provenance","確認圖片來源、授權與中英文替代文字（本工具不解析遠端資源）");
    }
    add("note","公開範圍",record.published===true?
      "Published：在網站上顯示；每次 Save 到 main 可能立即部署":
      "Hidden：網站不顯示，但公開 GitHub JSON、Git 歷史仍可讀取");
    return out;
  }
  function audit(records){
    const counts=new Map();
    for(const r of records){
      if(!r||typeof r!=="object")continue;
      const key=text(r.slug);
      if(key)counts.set(key,(counts.get(key)||0)+1);
    }
    return records.filter(r=>r&&typeof r==="object").map(record=>{
      const findings=checks(record);
      if(text(record.slug)&&counts.get(text(record.slug))>1)
        findings.push({status:"issue",label:"Duplicate slug",reason:"Slug 在清單中重複，可能造成頁面產生錯誤"});
      return {record,checks:findings,issues:findings.filter(x=>x.status==="issue").length};
    });
  }
  function filter(records,{q="",category="all",visibility="all",problems="all"}={}){
    const needle=norm(q);
    return records.filter(item=>{
      const r=item.record||item;
      if(category!=="all"&&r.category!==category)return false;
      if(visibility==="published"&&r.published!==true)return false;
      if(visibility==="hidden"&&r.published===true)return false;
      if(problems==="issues"&&(item.issues==null?checks(r).filter(x=>x.status==="issue").length:item.issues)===0)return false;
      const blob=[r.slug,r.title_en,r.title_zh,r.subtitle_en,r.subtitle_zh,
        r.summary_en,r.summary_zh,r.research_question_en,r.research_question_zh,
        ...(Array.isArray(r.tags)?r.tags:[])].join(" ");
      return !needle||norm(blob).includes(needle);
    });
  }
  function publicPath(record,lang){
    if(record.published!==true||!slugOK(record.slug)||!["research","project"].includes(record.category))return "";
    return "/yuhisang.lo/"+(lang==="zh"?"zh/":"")+
      (record.category==="research"?"research/":"projects/")+record.slug+"/";
  }
  return {checks,audit,filter,translated,localized,publicPath,validHttps};
});