'use strict';
/**
 * Pre-render the English homepage directly from the same site.js renderer and
 * CMS-derived JSON used by the browser. Retain client-side bilingual switching.
 * No second content model, duplicate editorial templates, or extra dependencies.
 */
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const PortfolioUI=require('../ui-utils.js');
const ROOT=path.resolve(__dirname,'..');
const SECTION_IDS=['about','research','projects','experience','education','news','writing','achievements','personal','contact'];
const read=name=>JSON.parse(fs.readFileSync(path.join(ROOT,'content',name+'.json'),'utf8'));
function replaceRegion(html,id,value) {
  const start='<!-- prerender:'+id+':start -->',end='<!-- prerender:'+id+':end -->';
  const a=html.indexOf(start),b=html.indexOf(end);
  if(a<0||b<=a||html.indexOf(start,a+start.length)>=0)throw Error('Missing or duplicate template marker: '+id);
  return html.slice(0,a+start.length)+value+html.slice(b);
}
async function build(template,source) {
  const nodes=new Map();
  const handlers=new Map();
  const navs=SECTION_IDS.map(name=>({dataset:{i:name},textContent:'',hidden:false}));
  function el(key){
    if(!nodes.has(key)){
      const attrs=new Map();
      nodes.set(key,{innerHTML:'',textContent:'',hidden:false,
        classList:{toggle(){}},
        setAttribute(k,v){attrs.set(k,String(v));},
        getAttribute(k){return attrs.get(k)||null;},
        removeAttribute(k){attrs.delete(k);},
        contains(){return false;},focus(){},
        addEventListener(name,cb){handlers.set(key+':'+name,cb);}
      });
    }
    return nodes.get(key);
  }
  const document={
    documentElement:{lang:'en'},title:'',
    querySelector(selector){
      const nav=selector.match(/^nav a\[data-i="([^"]+)"\]$/);
      if(nav)return navs.find(n=>n.dataset.i===nav[1])||null;
      return el(selector);
    },
    querySelectorAll(selector){return selector==='nav a'?navs:[];},
    addEventListener(){}
  };
  const data={
    profile:source.profile,
    'homepage-works':source.works,
    news:source.news,writing:source.writing,
    achievements:source.achievements,personal:source.personal
  };
  const context={
    document,PortfolioUI,URL,location:{href:'https://gule7309.github.io/yuhisang.lo/'},
    localStorage:{getItem(){return null;},setItem(){}},
    fetch:async endpoint=>({
      ok:true,json:async()=>data[endpoint.replace(/^content\//,'').replace(/\.json$/,'')]
    }),
    console,scrollTo(){}
  };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT,'site.js'),'utf8'),context,{timeout:2500});
  await new Promise(resolve=>setImmediate(resolve));
  if(!el('#about').innerHTML.includes('<h1>')||!el('#profile').innerHTML.includes('class="avatar"')){
    throw Error('Renderer did not produce visible homepage content');
  }
  let output=replaceRegion(template,'profile',el('#profile').innerHTML);
  for(const id of SECTION_IDS){
    const node=el('#'+id);
    output=replaceRegion(output,id,node.innerHTML);
    const start='<section id="'+id+'"';
    const index=output.indexOf(start);
    if(index<0)throw Error('Missing section '+id);
    const end=output.indexOf('>',index);
    const opening=output.slice(index,end+1);
    const updated=opening.replace(/ hidden(?=>)/g,'').replace(/>$/,node.hidden?' hidden>':'>');
    output=output.slice(0,index)+updated+output.slice(end+1);
  }
  output=replaceRegion(output,'footer',el('#footer').textContent.replace(/[&<>]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[ch])));
  output=output.replace(/(<div id="site-status"[^>]*)(>)/,
    (match,prefix,close)=>prefix.includes(' hidden')?match:prefix+' hidden'+close);
  return output;
}
async function main(){
  const filepath=path.join(ROOT,'index.html');
  const template=fs.readFileSync(filepath,'utf8');
  const page=await build(template,{
    profile:read('profile'),works:read('homepage-works'),news:read('news'),
    writing:read('writing'),achievements:read('achievements'),personal:read('personal')
  });
  fs.writeFileSync(filepath,page);
  console.log('Prerendered English homepage content for '+SECTION_IDS.length+' sections');
}
if(require.main===module) main().catch(err=>{console.error(err);process.exitCode=1;});
module.exports={build,replaceRegion,SECTION_IDS};
