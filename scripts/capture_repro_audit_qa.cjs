'use strict';
// Browser-verified proof that a page displays a signed synthetic record only.
const {chromium} = require('playwright-core');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const BASE=process.env.PORTFOLIO_PREVIEW_URL || 'http://127.0.0.1:8769/yuhisang.lo';
const CHROME=process.env.PORTFOLIO_BROWSER || '/usr/bin/google-chrome';
const OUT=path.join(process.cwd(),'artifacts/uiqa');
fs.mkdirSync(OUT,{recursive:true});

(async()=>{
 const browser=await chromium.launch({
  executablePath:CHROME,headless:true,
  args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']
 });
 const checked=[];
 try{
  for(const variant of [{lang:'en',width:1280,height:900},
                        {lang:'zh',width:390,height:844}]){
   const page=await browser.newPage({viewport:{width:variant.width,height:variant.height},
                                     deviceScaleFactor:1,reducedMotion:'reduce'});
   try{
    const route='/' + (variant.lang==='zh'?'zh/':'') + 'research/when2ask/';
    await page.goto(BASE+route,{waitUntil:'domcontentloaded',timeout:30000});
    assert.equal(await page.locator('html').getAttribute('lang'),
                 variant.lang==='zh'?'zh-Hant':'en');
    const section=page.locator('#reproducibility');
    await section.waitFor({state:'visible',timeout:12000});
    const toc=page.locator('.research-toc a[href="#reproducibility"]');
    assert.equal(await toc.count(),1,'Research TOC must include the audited source');
    const rows=section.locator('tbody tr');
    assert.equal(await rows.count(),4,'Exactly four controlled candidate-set states');
    const values=await rows.evaluateAll(list=>list.map(row=>
     [...row.querySelectorAll('td')].map(td=>td.textContent.trim())));
    assert.deepEqual(values.map(row=>row[0]),['1','1','1','2']);
    assert.equal(await section.locator('.research-audit-stat').count(),3);
    const links=await section.locator('.research-audit-links a').evaluateAll(list=>
     list.map(link=>({href:link.href,rel:link.rel,target:link.target})));
    assert.equal(links.length,3);
    assert.ok(links.every(link=>link.href.startsWith('https://github.com/Gule7309/When2ask/')
       && link.target==='_blank' && link.rel.includes('noopener') && link.rel.includes('noreferrer')));
    assert.ok(links.some(link=>link.href.includes('/actions/runs/41459465082/artifacts/13147204648')));
    assert.ok(links.some(link=>link.href.includes('/blob/ab0cd26da17ff63d300080811500fe87fe0f95a6/')));
    assert.equal(await page.locator('.research-disclosure--in_progress').count(),1,
                 'Synthetic replay must not upgrade a research note to a publication');
    await toc.focus();
    await page.keyboard.press('Enter');
    await page.waitForURL(/#reproducibility$/,{timeout:10000});
    const dims=await page.evaluate(()=>({
      viewport:document.documentElement.clientWidth,
      document:document.documentElement.scrollWidth
    }));
    assert.ok(dims.document<=dims.viewport+1,JSON.stringify({route,dims}));
    const prefix='when2ask-repro-'+variant.lang+'-'+variant.width;
    const first=section.locator('.research-audit-stats');
    await first.scrollIntoViewIfNeeded();
    await first.screenshot({path:path.join(OUT,prefix+'-stats.png'),animations:'disabled'});
    const table=section.locator('.research-audit-table-wrap');
    const tableDims=await table.evaluate(el=>({width:el.clientWidth,scrollWidth:el.scrollWidth}));
    assert.ok(tableDims.scrollWidth<=tableDims.width+1,
      'Audit comparison headings should not clip on narrow viewports: '+JSON.stringify({route,tableDims}));
    await table.scrollIntoViewIfNeeded();
    await table.screenshot({path:path.join(OUT,prefix+'-conditions.png'),animations:'disabled'});
    const footer=section.locator('.research-audit-links');
    await footer.scrollIntoViewIfNeeded();
    assert.ok(await footer.isVisible());
    await footer.screenshot({path:path.join(OUT,prefix+'-source-links.png'),animations:'disabled'});
    checked.push({route,width:variant.width,sourceLinks:3,conditions:4,
                  documentOverflow:dims.document-dims.viewport,
                  keyboardJump:true,publication:'work_in_progress'});
   }finally{await page.close()}
  }
  const other=await browser.newPage({viewport:{width:390,height:844}});
  try{
   await other.goto(BASE+'/research/authority-aware-agents/',{waitUntil:'domcontentloaded'});
   assert.equal(await other.locator('#reproducibility').count(),0,
     'Only supported audit records should create a section');
  }finally{await other.close()}
 }finally{await browser.close()}
 const report={status:'PASS',checked,otherResearchUnchanged:true};
 fs.writeFileSync(path.join(OUT,'research-repro-audit-qa.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report));
})().catch(e=>{console.error(e);process.exit(1)});
