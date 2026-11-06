'use strict';
// Real Chrome checks for bilingual archives. CI-only; no production effects.
const {chromium} = require('playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const BASE = process.env.PORTFOLIO_PREVIEW_URL || 'http://127.0.0.1:8765/yuhisang.lo';
const executablePath = process.env.PORTFOLIO_BROWSER || '/usr/bin/google-chrome';
const DIR = path.join(process.cwd(), 'artifacts/uiqa');
fs.mkdirSync(DIR,{recursive:true});

(async()=>{
  const browser = await chromium.launch({headless:true,executablePath,
    args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
  const output=[];
  try{
    for(const [language,width,height] of [
      ['en',1280,900],['zh',390,844],['zh',320,700]
    ]){
      const prefix = language==='zh' ? '/zh' : '';
      const page = await browser.newPage({viewport:{width,height},deviceScaleFactor:1,reducedMotion:'reduce'});
      try{
        for(const kind of ['research','projects']){
          const route = prefix+'/'+kind+'/';
          await page.goto(BASE+route,{waitUntil:'domcontentloaded',timeout:30000});
          assert.ok(await page.locator('h1').count()>0,'Missing archive heading '+route);
          assert.ok(await page.locator('article').count()>0,'Missing archive entries '+route);
          const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
          assert.ok(overflow<=1,'Horizontal overflow '+route+' '+width+': '+overflow);
          if(kind==='research'){
            assert.ok(await page.locator('.archive-question').count()>0,'Research question missing');
            assert.ok(await page.locator('.research-archive-stage').count()>0,'Publication disclosure missing');
          }else{
            const controls=page.locator('[data-archive-controls]');
            assert.ok(await controls.isVisible(),'Filter controls inaccessible');
            const all=page.locator('.project-list-item');
            const total=await all.count();
            const agent=page.locator('button[data-archive-filter="agent"]');
            await agent.focus();
            await page.keyboard.press('Enter');
            assert.equal(await agent.getAttribute('aria-pressed'),'true');
            const visible=await page.locator('.project-list-item:visible').count();
            assert.ok(visible>0 && visible<total,'Filter did not narrow cards');
            assert.ok(page.url().includes('category=agent'),'Category not reflected in URL');
            const noneHidden=await page.locator('.project-list-item[hidden]').count();
            assert.equal(noneHidden,total-visible);
            await page.locator('button[data-archive-filter="all"]').click();
            assert.equal(await page.locator('.project-list-item:visible').count(),total);
            assert.equal(await page.locator('button[data-archive-filter="all"]').getAttribute('aria-pressed'),'true');
          }
          const filename='phase10-'+kind+'-'+language+'-'+width+'.png';
          await page.screenshot({path:path.join(DIR,filename),fullPage:true,animations:'disabled'});
          output.push({route,language,width,height,entries:await page.locator('article').count(),overflow,screenshot:filename});
        }
      }finally{await page.close();}
    }
  }finally{await browser.close();}
  fs.writeFileSync(path.join(DIR,'phase10-archives-qa.json'),JSON.stringify({result:'PASS',cases:output},null,2)+'\n');
  console.log(JSON.stringify({result:'PASS',cases:output}));
})().catch(err=>{console.error(err);process.exit(1);});
