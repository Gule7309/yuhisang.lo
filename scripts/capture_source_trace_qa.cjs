'use strict';
// Render and inspect real generated portfolio pages (not a synthetic visual mock).
const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const BASE=process.env.PORTFOLIO_PREVIEW_URL||'http://127.0.0.1:8768/yuhisang.lo';
const CHROME=process.env.PORTFOLIO_BROWSER||'/usr/bin/google-chrome';
const OUT=path.join(process.cwd(),'artifacts/uiqa');
fs.mkdirSync(OUT,{recursive:true});
const scenarios=[
 {kind:'project',slug:'trading-radar',locale:'en',width:1280,height:900},
 {kind:'project',slug:'trading-radar',locale:'zh',width:390,height:844},
 {kind:'research',slug:'when2ask',locale:'en',width:1280,height:900},
 {kind:'research',slug:'when2ask',locale:'zh',width:390,height:844},
];

(async()=>{
const browser=await chromium.launch({executablePath:CHROME,headless:true,
 args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const outputs=[];
try{
 for(const test of scenarios){
  const page=await browser.newPage({viewport:{width:test.width,height:test.height},
   deviceScaleFactor:1,reducedMotion:'reduce'});
  const route='/' + (test.locale==='zh'?'zh/':'') +test.kind+'/' +test.slug+'/';
  try{
   await page.goto(BASE+route,{waitUntil:'domcontentloaded',timeout:30000});
   assert.equal(await page.locator('html').getAttribute('lang'),
    test.locale==='zh'?'zh-Hant':'en');
   const section=page.locator('#implementation');
   await section.waitFor({state:'visible',timeout:12000});
   const cards=section.locator('article.case-trace-card');
   assert.equal(await cards.count(),3,'Three grounded excerpts expected: '+route);
   const links=await section.locator('a.case-trace-link').evaluateAll(els=>
    els.map(el=>({href:el.href,target:el.target,rel:el.rel})));
   const sourcePattern=/^https:\/\/github\.com\/[A-Za-z0-9-]+\/[A-Za-z0-9_.-]+\/blob\/[0-9a-f]{40}\/[^?#\s]+#L[1-9]\d*-L[1-9]\d*$/;
   assert.equal(links.length,3,'Three source permalinks expected');
   assert.ok(links.every(l=>sourcePattern.test(l.href)
     && l.target==='_blank' && l.rel.includes('noopener')&&l.rel.includes('noreferrer')),
     'Pinned code source links required: '+JSON.stringify(links));
   const codes=await section.locator('pre code').allTextContents();
   assert.equal(codes.length,3);
   assert.ok(codes.every(s=>s.length>40 && !s.includes('<script>')));
   // Implementation evidence cannot remove the original research publication notice.
   if(test.kind==='research'){
    assert.ok(await page.locator('.research-disclosure--in_progress').count()===1,
      'When2ask must remain an unpublished research reconstruction');
    const jump=page.locator('.research-toc a[href="#implementation"]');
    await jump.focus();
    await page.keyboard.press('Enter');
    await page.waitForURL(/#implementation$/,{timeout:10000});
   }
   const dims=await page.evaluate(()=>({
    viewport:document.documentElement.clientWidth,
    document:document.documentElement.scrollWidth,
   }));
   assert.ok(dims.document<=dims.viewport+1,'Unexpected page overflow: '+JSON.stringify({route,dims}));
   await section.scrollIntoViewIfNeeded();
   await page.evaluate(()=>new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok))));
   const file=test.slug+'-'+test.locale+'-'+test.width;
   // Anchor to the actual section and the first code card after scroll.
   await cards.first().scrollIntoViewIfNeeded();
   await cards.first().screenshot({path:path.join(OUT,file+'-first-source.png'),animations:'disabled'});
   await cards.last().scrollIntoViewIfNeeded();
   assert.ok(await cards.last().isVisible(),'Last source excerpt cannot be seen');
   const box=await cards.last().boundingBox();
   assert.ok(box&&box.width>100,'Last source card has no width');
   await cards.last().screenshot({path:path.join(OUT,file+'-last-source.png'),animations:'disabled'});
   // Ensure keyboard focus is meaningful on horizontally scrollable snippets.
   const pre=cards.last().locator('pre');
   await pre.focus();
   assert.equal(await pre.getAttribute('tabindex'),'0');
   outputs.push({route,locale:test.locale,viewport:test.width+'x'+test.height,
    cards:3,pinnedSourceLinks:links.length,overflow:dims.document-dims.viewport,
    lastCardWidth:Math.round(box.width),researchPublicationClaim:test.kind==='research'?'work_in_progress':'n/a'});
  }finally{await page.close()}
 }
 const noCode=await browser.newPage({viewport:{width:390,height:844}});
 try{
  await noCode.goto(BASE+'/projects/pixelfit/',{waitUntil:'domcontentloaded'});
  assert.equal(await noCode.locator('#implementation').count(),0,
   'Private PixelFit code must not appear as an empty/public source section');
  await noCode.goto(BASE+'/research/authority-aware-agents/',{waitUntil:'domcontentloaded'});
  assert.equal(await noCode.locator('#implementation').count(),0,
   'Unverified research should not show fabricated source excerpts');
 }finally{await noCode.close()}
}finally{await browser.close()}
const report={result:'PASS',tested:outputs,privateSourceNotPublished:true};
fs.writeFileSync(path.join(OUT,'source-trace-qa.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
})().catch(e=>{console.error(e);process.exit(1)});
