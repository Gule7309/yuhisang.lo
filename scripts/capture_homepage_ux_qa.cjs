'use strict';
const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const zlib=require('node:zlib');

const BASE=process.env.PORTFOLIO_PREVIEW_URL||'http://127.0.0.1:8770/yuhisang.lo';
const BROWSER=process.env.PORTFOLIO_BROWSER||'/usr/bin/google-chrome';
const OUT=path.join(process.cwd(),'artifacts/uiqa');
fs.mkdirSync(OUT,{recursive:true});
const sizes={};
for(const name of ['works.json','homepage-works.json']){
  const buf=fs.readFileSync(path.join(process.cwd(),'content',name));
  sizes[name]={raw:buf.length,gzip:zlib.gzipSync(buf).length};
}
assert.ok(sizes['homepage-works.json'].raw<sizes['works.json'].raw/2);
assert.ok(sizes['homepage-works.json'].gzip<sizes['works.json'].gzip*.7);

(async()=>{
const browser=await chromium.launch({executablePath:BROWSER,headless:true,
  args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const summary=[];
try{
 for(const viewport of [{width:1280,height:900},{width:390,height:844},{width:320,height:700}]){
  const context=await browser.newContext({viewport,deviceScaleFactor:1,reducedMotion:'reduce'});
  const page=await context.newPage();
  try{
    const requests=[];
    page.on('request',r=>{if(r.url().includes('/content/')&&r.url().endsWith('.json')) requests.push(r.url());});
    await page.goto(BASE+'/',{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForFunction(()=>document.querySelector('#site-status')?.hidden===true,
      null,{timeout:15000});
    assert.equal(await page.locator('#projects article.work').count(),3,
      'All featured projects should remain visible');
    assert.equal(await page.locator('#research article.work').count(),2,
      'All selected research notes should remain visible');
    assert.ok(requests.some(p=>p.includes('/content/homepage-works.json')));
    assert.ok(!requests.some(p=>p.includes('/content/works.json')),
      'Full 40KB works.json must not be fetched by homepage');
    assert.equal(await page.locator('#chinese').getAttribute('aria-pressed'),'false');
    assert.equal(await page.locator('#english').getAttribute('aria-pressed'),'true');
    const nav=page.locator('#primary-navigation');
    const toggle=page.locator('#nav-toggle');
    const isMobile=viewport.width<=680;
    const navVisible=await nav.evaluate(el=>getComputedStyle(el).visibility==='visible');
    assert.equal(navVisible,!isMobile,
      'Desktop navigation always visible; mobile navigation closed initially');
    if(isMobile) {
      assert.equal(await toggle.isVisible(),true);
      assert.equal(await toggle.getAttribute('aria-expanded'),'false');
      await toggle.click();
      assert.equal(await nav.getAttribute('data-open'),'true');
      assert.equal(await toggle.getAttribute('aria-expanded'),'true');
      const dims=await nav.evaluate(el=>({
        width:el.getBoundingClientRect().width,
        scrollHeight:el.scrollHeight,
        clientHeight:el.clientHeight
      }));
      assert.ok(dims.width<viewport.width);
      assert.ok(dims.scrollHeight<=dims.clientHeight+1,
        'Full menu should be visible at this viewport');
      await page.screenshot({path:path.join(OUT,'home-menu-open-'+viewport.width+'.png'),
        animations:'disabled'});
      // The Escape key must close and return focus to the menu control.
      await page.keyboard.press('Escape');
      assert.equal(await toggle.getAttribute('aria-expanded'),'false');
      assert.equal(await toggle.evaluate(el=>document.activeElement===el),true);
      await toggle.click();
      await nav.locator('a[href="#research"]').click();
      assert.equal(await toggle.getAttribute('aria-expanded'),'false');
      assert.ok(page.url().endsWith('/#research'));
      await page.evaluate(()=>scrollTo(0,0));
      await toggle.click();
      // The document content begins below the sticky header: click the safe
      // outer viewport gutter, rather than a point obscured by the header.
      await page.mouse.click(7,viewport.height-20);
      assert.equal(await toggle.getAttribute('aria-expanded'),'false',
        'Pointer outside closes menu');
    } else {
      assert.equal(await toggle.isVisible(),false);
    }
    await page.locator('#chinese').click();
    assert.equal(await page.locator('html').getAttribute('lang'),'zh-Hant');
    assert.equal(await page.locator('#chinese').getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('#nav-toggle-label').textContent(),'選單');
    assert.equal(await page.locator('#skip-link').textContent(),'跳至主要內容');
    assert.equal(await page.locator('#up').getAttribute('aria-label'),'回到頁首');
    if(isMobile) {
      await toggle.click();
      assert.equal(await nav.locator('a[href="#projects"]').textContent(),'精選專案');
      await page.screenshot({path:path.join(OUT,'home-menu-zh-'+viewport.width+'.png'),
        animations:'disabled'});
      await toggle.click();
    }
    await page.evaluate(()=>scrollTo(0,0));
    const widths=await page.evaluate(()=>({
      viewport:document.documentElement.clientWidth,
      document:document.documentElement.scrollWidth,
      header:document.querySelector('header').getBoundingClientRect().height
    }));
    assert.ok(widths.document<=widths.viewport+1,
      'No horizontal overflow in viewport '+viewport.width+': '+JSON.stringify(widths));
    if(isMobile)assert.equal(Math.round(widths.header),62);
    await page.screenshot({path:path.join(OUT,'home-closed-'+viewport.width+'.png'),
      animations:'disabled'});
    summary.push({viewport,featuredProjects:3,selectedResearch:2,
      language:'zh-Hant',navMode:isMobile?'button + dropdown':'desktop links',
      overflowPx:widths.document-widths.viewport,headerHeight:widths.header,
      usesCompactPayload:true});
  }finally{await context.close()}
 }
 // The loading notice must be replaced by a functional bilingual fallback on failure.
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const page=await context.newPage();
 try{
   await page.route(/\/content\/profile\.json/,route=>route.fulfill({status:503,body:'Unavailable'}));
   await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.querySelector('#site-status')?.getAttribute('role')==='alert',
     null,{timeout:12000});
   const notice=page.locator('#site-status');
   assert.ok((await notice.innerText()).includes('Content unavailable'));
   assert.equal(await notice.locator('a[href="research/"]').count(),1);
   assert.equal(await notice.locator('a[href="projects/"]').count(),1);
   await page.screenshot({path:path.join(OUT,'home-loading-error.png'),animations:'disabled'});
 }finally{await context.close()}
}finally{await browser.close()}
const report={result:'PASS',payloadBytes:sizes,scenarios:summary,
  failureStateTest:'PASS'};
fs.writeFileSync(path.join(OUT,'homepage-ux-qa.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
})().catch(err=>{console.error(err);process.exit(1)});
