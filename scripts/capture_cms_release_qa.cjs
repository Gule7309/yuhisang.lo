'use strict';
/* Mock browser acceptance test for release dashboard, no CMS credentials or writes. */
const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
const browserPath=process.env.PORTFOLIO_BROWSER;
const base=process.env.PORTFOLIO_PREVIEW_URL||'http://127.0.0.1:8771/yuhisang.lo';
if(!browserPath)throw Error('PORTFOLIO_BROWSER is required');
(async()=>{
 const browser=await chromium.launch({executablePath:browserPath,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.route('https://api.github.com/repos/Gule7309/yuhisang.lo/**',async route=>{
    const url=route.request().url();
    const data=url.includes('/compare/')?
      {status:'ahead',ahead_by:1,behind_by:0,files:[{filename:'content/works.json',status:'modified'}]}:
      [{state:'open',head:{ref:'cms-staging'},base:{ref:'main'},number:42,
        html_url:'https://github.com/Gule7309/yuhisang.lo/pull/42',draft:true}];
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  });
  await page.route('https://raw.githubusercontent.com/Gule7309/yuhisang.lo/**',async route=>{
    const body=route.request().url().includes('/cms-staging/')?
      [{slug:'sample',category:'research',published:false,title_zh:'新增草稿'}]:[];
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
  await page.goto(base+'/admin/publish.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#release-status')?.classList.contains('review'));
  assert.match(await page.locator('#branch-delta').innerText(),/領先 1/);
  assert.match(await page.locator('#work-diff').innerText(),/新增草稿/);
  assert.match(await page.locator('#release-link').getAttribute('href'),/pull\/42$/);
  assert.match(await page.locator('#changed-files').innerText(),/content\/works\.json/);
  await page.locator('#refresh').click();
  await page.waitForFunction(()=>document.querySelector('#refresh')?.disabled===false);
  console.log('CMS release dashboard mock-browser acceptance passed');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
