/* Live, unsaved-draft preview for the existing Sveltia CMS "works" collection.
 * Uses only the documented registerPreviewTemplate API and immutable entry data.
 * No save hooks, GitHub mutation, or claims of publication verification.
 */
(function(root,factory){
  "use strict";
  const api=factory();
  if(typeof module==="object" && module.exports) module.exports=api;
  root.PortfolioEditorPreview=api;
  if(root.CMS && typeof root.CMS.registerPreviewTemplate==="function"){
    const React=root.CMS.React;
    if(React && typeof React.createElement==="function"){
      root.CMS.registerPreviewTemplate("works",function WorkPreview(props){
        return api.render(props,React.createElement);
      });
      if(typeof root.CMS.registerPreviewStyle==="function")
        root.CMS.registerPreviewStyle("/yuhisang.lo/admin/editor-preview.css");
    }
  }
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  const clean=v=>String(v==null?"":v).trim();
  function read(entry,name){
    if(!entry||typeof entry.getIn!=="function")return "";
    const value=entry.getIn(["data",name]);
    return typeof value==="string"||typeof value==="number"?clean(value):"";
  }
  function inspect(entry){
    const fields=["title_en","title_zh","subtitle_en","subtitle_zh","summary_en","summary_zh"];
    const missing=fields.filter(field=>!read(entry,field));
    const category=read(entry,"category");
    const publication=read(entry,"publication_status");
    const needsPaper=category==="research"&&(publication==="preprint"||publication==="peer_reviewed");
    if(needsPaper && !/^https:\/\//i.test(read(entry,"paper")))missing.push("paper");
    if(category==="research"&&publication==="peer_reviewed"&&!read(entry,"publication_venue"))
      missing.push("publication_venue");
    return {missing,category,publication};
  }
  function render(props,h){
    const entry=props&&props.entry;
    const data=inspect(entry);
    const published=entry&&typeof entry.getIn==="function"&&entry.getIn(["data","published"])===true;
    const field=(name,label,tag,cls)=>{
      const content=read(entry,name);
      return h("div",{className:"ep-field","data-key-path":name,tabIndex:0,key:name},
        h("span",{className:"ep-field-label"},label),
        h(tag||"p",{className:cls||""},content||"Not provided / 尚未填寫"));
    };
    const notice=published?
      "Marked Published / 已標記公開：儲存至 main 後可能觸發正式部署。":
      "Marked Hidden / 已標記隱藏：公開 GitHub JSON 仍可被讀取。";
    const meta=[data.category||"Unspecified",read(entry,"year")].filter(Boolean).join(" · ");
    const header=h("header",{className:"ep-header"},
      h("div",{className:"ep-kicker"},"DRAFT CONTENT PREVIEW · 編輯中預覽"),
      h("h1",{},"Research & Projects"),
      h("p",{className:"ep-caveat"},"This preview uses current editor fields, including unsaved changes. It approximates the public card layout; verify the actual site after publishing."));
    const report=h("section",{className:"ep-review"},
      h("strong",{},"Field check / 欄位檢查"),
      h("p",{},data.missing.length?
        data.missing.length+" field(s) need attention: "+data.missing.join(", "):
        "Required bilingual fields are filled / 中英文必要欄位已填寫"),
      h("p",{className:"ep-caveat"},"Field completeness is not research or publication verification."));
    const language=(lang,label)=>h("section",{className:"ep-language",key:lang},
      h("h2",{},label),
      field("title_"+lang,"Title / 標題","h3","ep-title"),
      field("subtitle_"+lang,"Subtitle / 副標題","p","ep-subtitle"),
      field("summary_"+lang,"Summary / 摘要","p","ep-summary"),
      data.category==="research"?field("research_question_"+lang,"Research question / 研究問題","p","ep-summary"):null);
    return h("article",{className:"ep-root"},header,
      h("div",{className:"ep-meta"},meta),
      h("div",{className:"ep-visibility", "data-key-path":"published",tabIndex:0},notice),
      report,
      h("div",{className:"ep-grid"},language("en","English"),language("zh","繁體中文")),
      h("p",{className:"ep-caveat ep-foot"},"No changes are saved or published by this preview. Check images, routes and final layout on the actual website."));
  }
  return {read,inspect,render};
});
