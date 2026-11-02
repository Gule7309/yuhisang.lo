'use strict';
// Deterministic, browser-rendered visual and functional checks of source-grounded
// engineering case studies. This script never modifies public data or deploys.
const {chromium} = require('playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const BASE = process.env.PORTFOLIO_PREVIEW_URL || 'http://127.0.0.1:8765/yuhisang.lo';
const CHROME = process.env.PORTFOLIO_BROWSER || '/usr/bin/google-chrome';
const OUT = path.join(process.cwd(), 'artifacts/uiqa');
fs.mkdirSync(OUT, {recursive:true});

const cases = [
  {slug:'pixelfit',locale:'en',viewport:{width:1280,height:900}},
  {slug:'pixelfit',locale:'zh',viewport:{width:390,height:844}},
  {slug:'trading-radar',locale:'en',viewport:{width:1280,height:900}},
  {slug:'trading-radar',locale:'zh',viewport:{width:390,height:844}},
];

(async()=>{
  const browser = await chromium.launch({
    executablePath:CHROME,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']
  });
  const results=[];
  try{
    for(const item of cases){
      const page = await browser.newPage({
        viewport:item.viewport,deviceScaleFactor:1,reducedMotion:'reduce'
      });
      try{
        const route = '/' + (item.locale==='zh'?'zh/':'') + 'projects/' + item.slug + '/';
        await page.goto(BASE+route,{waitUntil:'domcontentloaded',timeout:30000});
        const expectedLocale = item.locale==='zh'?'zh-Hant':'en';
        assert.equal(await page.locator('html').getAttribute('lang'),expectedLocale);
        const architecture = page.locator('#architecture');
        const engineering = page.locator('#engineering');
        const evidence = page.locator('#verification');
        await architecture.waitFor({state:'visible',timeout:12000});
        assert.equal(await architecture.locator('li.case-architecture-layer').count(),4);
        assert.equal(await engineering.locator('li.case-decision').count(),3);
        assert.equal(await evidence.locator('li.case-evidence-item').count(),3);
        const statuses = await evidence.locator('.case-evidence-state').allTextContents();
        assert.equal(statuses.length,3);
        assert.ok(statuses.every(x=>x.trim().length>0));
        const sourceUrls = await evidence.locator('a.case-evidence-source').evaluateAll(els=>els.map(a=>a.href));
        assert.ok(sourceUrls.every(x=>x.startsWith('https://')),'Evidence links must be public HTTPS');
        if(item.slug==='pixelfit') assert.equal(sourceUrls.length,0,'No private PixelFit links exposed');

        const dims=await page.evaluate(()=>{
          const main=document.querySelector('main');
          const grid=document.querySelector('.case-architecture-grid');
          const area=document.querySelector('#architecture');
          return {
            viewport:document.documentElement.clientWidth,
            document:document.documentElement.scrollWidth,
            main:main?.getBoundingClientRect().width,
            architectureWidth:area?.getBoundingClientRect().width,
            columns:getComputedStyle(grid).gridTemplateColumns.split(/\s+/).filter(Boolean).length
          };
        });
        assert.ok(dims.document<=dims.viewport+1,
          'Document overflow: '+JSON.stringify({route,dims}));
        assert.ok(dims.architectureWidth<=dims.viewport+1,
          'Architecture width outside viewport: '+JSON.stringify({route,dims}));
        const expectedColumns=item.viewport.width>990?4:1;
        assert.equal(dims.columns,expectedColumns,'Architecture grid should reflow');

        // Test the real in-page navigation with a keyboard event.
        const jump=page.locator('.case-technical-jump');
        await jump.focus();
        await page.keyboard.press('Enter');
        await page.waitForURL(/#architecture$/,{timeout:10000});

        const filePrefix=item.slug+'-'+item.locale+'-'+item.viewport.width;
        await architecture.screenshot({path:path.join(OUT,filePrefix+'-architecture.png'),animations:'disabled'});
        await evidence.screenshot({path:path.join(OUT,filePrefix+'-evidence.png'),animations:'disabled'});
        results.push({route,locale:expectedLocale,architectureLayers:4,decisions:3,
          evidenceItems:3,sourceLinks:sourceUrls.length,overflow:dims.document-dims.viewport,
          gridColumns:dims.columns,keyboardJump:true});
      }finally{await page.close()}
    }
    const tavi=await browser.newPage({viewport:{width:1280,height:900}});
    try{
      await tavi.goto(BASE+'/projects/tavi/',{waitUntil:'domcontentloaded'});
      assert.equal(await tavi.locator('#architecture,#engineering,#verification,.case-technical-jump').count(),0,
        'Missing CMS data must not create empty technical sections');
    }finally{await tavi.close()}
  }finally{await browser.close()}
  const report={result:'PASS',cases:results,otherProjectsRemainUnchanged:true};
  fs.writeFileSync(path.join(OUT,'technical-case-study-qa.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report));
})().catch(err=>{console.error(err);process.exit(1)});
