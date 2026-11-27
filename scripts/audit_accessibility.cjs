'use strict';
/** Automated WCAG-focused audit + keyboard/mobile interactions.
 * Uses actual generated static pages, deterministic fixture network, Chromium
 * and axe-core. Does NOT claim full WCAG compliance or emulate screen readers.
 */
const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
const axe=require.resolve('axe-core/axe.min.js');
const fs=require('node:fs');
const path=require('node:path');
const root=process.env.PORTFOLIO_PREVIEW_URL||'http://127.0.0.1:8772/yuhisang.lo';
const browserPath=process.env.PORTFOLIO_BROWSER;
if(!browserPath)throw Error('PORTFOLIO_BROWSER is required');
const reports=[];
const problems=[];
async function accessibility(page,name){
 await page.addScriptTag({path:axe});
 const result=await page.evaluate(async()=>window.axe.run(document,{
  runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']}
 }));
 const violations=result.violations.map(v=>({
  id:v.id,impact:v.impact,description:v.help,
  nodes:v.nodes.slice(0,7).map(n=>({target:n.target,summary:n.failureSummary?.slice(0,210)}))
 }));
 reports.push({name,violations,passes:result.passes.length,incomplete:result.incomplete.length});
 for(const v of violations)if(['critical','serious','moderate'].includes(v.impact))
  problems.push(name+': '+v.impact+' '+v.id+' '+JSON.stringify(v.nodes.slice(0,3)));
}
async function checkLayout(page,name){
 const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:window.innerWidth}));
 assert(dims.scroll<=dims.viewport+1,name+' horizontal overflow '+JSON.stringify(dims));
}
async function run(){
 const browser=await chromium.launch({executablePath:browserPath,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  for(const width of [390,1280]){
   const page=await browser.newPage({viewport:{width,height:844}});
   await page.goto(root+'/',{waitUntil:'domcontentloaded'});
   await page.waitForSelector('#about h1');
   await checkLayout(page,'home '+width);
   await accessibility(page,'home-en-'+width);
   if(width===390){
    const toggle=page.locator('#nav-toggle');
    await toggle.focus();await page.keyboard.press('Enter');
    assert.equal(await toggle.getAttribute('aria-expanded'),'true');
    const first=page.locator('#primary-navigation a').first();
    await first.focus();
    assert.equal(await first.evaluate(e=>getComputedStyle(e).visibility),'visible');
    await page.keyboard.press('Escape');
    assert.equal(await toggle.getAttribute('aria-expanded'),'false');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'nav-toggle');
    await page.locator('#chinese').click();
    assert.equal(await page.locator('html').getAttribute('lang'),'zh-Hant');
    await accessibility(page,'home-zh-mobile');
   }
   await page.close();
  }
  for(const route of ['research/','projects/','zh/research/','zh/projects/']){
   const page=await browser.newPage({viewport:{width:390,height:844}});
   await page.goto(root+'/'+route,{waitUntil:'domcontentloaded'});
   await checkLayout(page,route);
   await accessibility(page,route);
   const search=page.locator('[data-archive-search]');
   if(await search.count()){
    await search.fill('definitely-no-matching-portfolio-item-xyz');
    assert.equal(await page.locator('[data-archive-item]:visible').count(),0);
    await page.locator('[data-archive-clear]').click();
    assert.equal(await search.inputValue(),'');
    assert(await page.locator('[data-archive-item]:visible').count()>0);
    assert.equal(await page.evaluate(()=>document.activeElement.matches('[data-archive-search]')),true);
   }
   await page.close();
  }
  for(const route of ['admin/review.html','admin/publish.html']){
   const page=await browser.newPage({viewport:{width:390,height:844}});
   if(route.includes('review.html')){
    await page.route('**/content/works.json',route=>route.fulfill({
     status:200,contentType:'application/json',body:JSON.stringify([
      {slug:'demo-research',category:'research',published:true,title_en:'Test',title_zh:'測試',subtitle_en:'A',subtitle_zh:'乙',summary_en:'Description',summary_zh:'說明'}
     ])
    }));
   }
   if(route.includes('publish.html')){
    await page.route('https://api.github.com/repos/Gule7309/yuhisang.lo/**',route=>route.fulfill({
     status:200,contentType:'application/json',body:route.request().url().includes('/pulls?')?'[]':JSON.stringify({status:'identical',ahead_by:0,behind_by:0,files:[]})
    }));
    await page.route('https://raw.githubusercontent.com/Gule7309/yuhisang.lo/**',route=>route.fulfill({
     status:200,contentType:'application/json',body:'[]'
    }));
   }
   await page.goto(root+'/'+route,{waitUntil:'domcontentloaded'});
   if(route.includes('review.html')){
    await page.waitForSelector('#list .item');
    const item=page.locator('#list .item').first();
    await item.focus();await page.keyboard.press('Enter');
    assert.equal(await page.locator('#detail .detail-title').innerText(),'測試');
    assert(await page.locator('#list .item').first().evaluate(e=>document.activeElement===e),
      'Selecting an item should retain keyboard focus');
    await page.locator('#search').fill('nonexistent');
    assert.match(await page.locator('#status').innerText(),/0 筆/);
   }
   await checkLayout(page,route);
   await accessibility(page,route);
   await page.close();
  }
 }finally{await browser.close();}
 const reportPath=path.join(process.cwd(),'artifacts','uiqa','accessibility-audit.json');
 fs.mkdirSync(path.dirname(reportPath),{recursive:true});
 fs.writeFileSync(reportPath,JSON.stringify(reports,null,2));
 console.log('Accessibility results:\n'+reports.map(x=>x.name+': '+x.violations.map(v=>v.id+' ('+v.impact+')').join(', ')).join('\n'));
 if(problems.length)throw Error('Accessibility violations:\n'+problems.join('\n'));
 console.log('Keyboard, forms, mobile nav and WCAG-tagged automated checks passed');
}
run().catch(e=>{console.error(e);process.exitCode=1;});
