'use strict';
// CI-only browser visual QA: use real generated portfolio pages and real PixelFit images.
// No application code, uploaded screenshot, or production data is modified.
const {chromium} = require('playwright-core');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const BASE = process.env.PORTFOLIO_PREVIEW_URL || 'http://127.0.0.1:8765/yuhisang.lo';
const BROWSER_PATH = process.env.PORTFOLIO_BROWSER || '/usr/bin/google-chrome';
const OUT = path.join(process.cwd(), 'artifacts/uiqa');
fs.mkdirSync(OUT, {recursive:true});

const cases = [
  {route:'/', anchor:'#projects .work:has(a[href="projects/pixelfit/"])',
    imageSelector:'#projects .cover-phone-strip img', minimum:3,
    output:'homepage-pixelfit-desktop.png', viewport:{width:1280,height:900}, align:'center'},
  {route:'/', anchor:'#projects .work:has(a[href="projects/pixelfit/"])',
    imageSelector:'#projects .cover-phone-strip img', minimum:3,
    output:'homepage-pixelfit-mobile.png', viewport:{width:390,height:844}, align:'center'},
  {route:'/projects/pixelfit/', anchor:'#gallery',
    imageSelector:'#gallery .case-gallery.has-phone-layout img', minimum:4,
    output:'pixelfit-gallery-actual-desktop.png', viewport:{width:1280,height:900}, align:'start'},
  {route:'/zh/projects/pixelfit/', anchor:'#gallery',
    imageSelector:'#gallery .case-gallery.has-phone-layout img', minimum:4,
    output:'pixelfit-gallery-actual-mobile.png', viewport:{width:390,height:844}, align:'start'},
];

(async () => {
  const browser = await chromium.launch({
    executablePath:BROWSER_PATH, headless:true,
    args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'],
  });
  const summaries=[];
  try {
    for (const item of cases) {
      const page = await browser.newPage({
        viewport:item.viewport,deviceScaleFactor:1,reducedMotion:'reduce'
      });
      try {
        await page.goto(BASE+item.route,{waitUntil:'domcontentloaded',timeout:25000});
        const target = page.locator(item.anchor).first();
        await target.waitFor({state:'visible',timeout:15000});
        await target.evaluate((element,align)=>element.scrollIntoView({
          block:align,inline:'nearest',behavior:'instant'
        }),item.align);
        const gallery = page.locator(item.imageSelector);
        const count = await gallery.count();
        assert.ok(count >= item.minimum, 'Too few authentic images for '+item.output+': '+count);
        const pictures=await gallery.evaluateAll(async images=>{
          return await Promise.all(images.map(async img=>{
            await img.decode().catch(()=>{});
            return {src:img.getAttribute('src'),complete:img.complete,
              naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight};
          }));
        });
        const invalid=pictures.filter(im=>!im.complete || im.naturalWidth<60 || im.naturalHeight<60);
        assert.equal(invalid.length,0,'Broken or tiny images: '+JSON.stringify(invalid));
        const dims=await page.evaluate(()=>({
          width:document.documentElement.clientWidth,
          scrollWidth:document.documentElement.scrollWidth
        }));
        assert.ok(dims.scrollWidth<=dims.width+1,
          'Horizontal document overflow in '+item.output+': '+JSON.stringify(dims));
        await page.screenshot({path:path.join(OUT,item.output),animations:'disabled'});
        summaries.push({route:item.route,shot:item.output,viewport:item.viewport,
          imageCount:count,overflow:dims.scrollWidth-dims.width});
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
  fs.writeFileSync(path.join(OUT,'pixelfit-image-qa.json'),
    JSON.stringify({result:'PASS',cases:summaries},null,2)+'\n');
  console.log(JSON.stringify({result:'PASS',cases:summaries}));
})().catch(e=>{console.error(e);process.exit(1)});
