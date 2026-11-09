/* Pure, dependency-free review logic; usable in Node tests and the browser. */
(function(root,factory){
  const api=factory();
  if(typeof module==="object" && module.exports) module.exports=api;
  root.PortfolioReview=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  const text=value=>String(value==null?"":value).trim();
  const localized=(record,field,lang)=>text(record[field+"_"+lang])||text(record[field+"_en"]);
  const slugOK=value=>/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(text(value));
  function checks(record){
    const out=[];
    const add=(status,label,reason)=>out.push({status,label,reason});
    const required=["title","subtitle","summary"];
    for(const field of required){
      for(const lang of ["en","zh"]) add(text(record[field+"_"+lang])?"ok":"issue",field+" · "+lang,text(record[field+"_"+lang])?"已填寫":"必要欄位尚未填寫");
    }
    add(slugOK(record.slug)?"ok":"issue","Slug",slugOK(record.slug)?"格式有效":"請使用小寫英文、數字與連字號");
    add(["research","project"].includes(record.category)?"ok":"issue","Category",["research","project"].includes(record.category)?"有效分類":"未知分類");
    if(record.category==="research"){
      for(const lang of ["en","zh"])
        add(text(record["research_question_"+lang])?"ok":"note","Research question · "+lang,text(record["research_question_"+lang])?"已填寫":"選填：建議補充研究問題");
      const status=text(record.publication_status)||"work_in_progress";
      const paper=text(record.paper);
      const venue=text(record.publication_venue);
      if(status==="preprint"||status==="peer_reviewed") add(paper.startsWith("https://")?"ok":"issue","Paper URL",paper.startsWith("https://")?"已提供連結":"發表狀態要求 HTTPS 論文連結");
      if(status==="peer_reviewed") add(venue?"ok":"issue","Venue",venue?"已提供 venue":"Peer reviewed 狀態缺少 venue");
      add("note","Publication claims","狀態和來源仍須人工確認；此工具不驗證論文是否真的被接受");
    }
    add("note","公開狀態",record.published===true?"Published：將顯示於網站，須確認資料正確":"Hidden：網站不顯示，但 GitHub JSON 仍是公開的");
    return out;
  }
  function filter(records,{q="",category="all",visibility="all"}={}){
    const needle=text(q).normalize("NFKC").toLocaleLowerCase();
    return records.filter(r=>{
      if(category!=="all"&&r.category!==category)return false;
      if(visibility==="published"&&r.published!==true)return false;
      if(visibility==="hidden"&&r.published===true)return false;
      const blob=[r.slug,r.title_en,r.title_zh,r.summary_en,r.summary_zh,...(Array.isArray(r.tags)?r.tags:[])].join(" ").normalize("NFKC").toLocaleLowerCase();
      return !needle||blob.includes(needle);
    });
  }
  function publicPath(record,lang){
    if(record.published!==true||!slugOK(record.slug)||!["research","project"].includes(record.category))return "";
    return "/yuhisang.lo/"+(lang==="zh"?"zh/":"")+(record.category==="research"?"research/":"projects/")+record.slug+"/";
  }
  return {checks,filter,localized,publicPath};
});