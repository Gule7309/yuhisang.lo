'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const PortfolioUI = require('../ui-utils.js');
const root = path.resolve(__dirname, '..');

test('homepage honors Featured and uses localized product detail links', async () => {
  const elements = new Map();
  const handlers = new Map();
  const navNames = ['about', 'research', 'projects', 'experience', 'education', 'news', 'writing', 'achievements', 'contact'];
  const navs = navNames.map((name) => ({dataset: {i:name}, textContent:'',hidden:false}));
  function elt(key) {
    if (!elements.has(key)) elements.set(key, {
      innerHTML:'', hidden:false, textContent:'', classList:{toggle(){}},
      addEventListener(event, callback){handlers.set(key + ':' + event, callback);}
    });
    return elements.get(key);
  }
  const document = {
    documentElement: {lang:'en'},
    title: '',
    querySelector(selector) {
      const navMatch = selector.match(/^nav a\[data-i="([^"]+)"\]$/);
      if (navMatch) return navs.find(n=>n.dataset.i===navMatch[1]) || null;
      return elt(selector);
    },
    querySelectorAll(selector) {return selector === 'nav a' ? navs : [];}
  };
  const data = Object.fromEntries(['profile','works','news','writing','achievements','personal']
    .map((name) => [name, JSON.parse(fs.readFileSync(path.join(root,'content',name+'.json'), 'utf8'))]));
  const sandbox = {
    document, PortfolioUI,
    URL, location:{href:'http://127.0.0.1:8765/yuhisang.lo/'},
    localStorage:{getItem:()=>null,setItem(){}},
    fetch: async (pathname) => ({ok:true,json:async()=>data[pathname.replace(/^content\//,'').replace(/\.json$/,'')]}),
    console,scrollTo(){}
  };
  const script = fs.readFileSync(path.join(root,'site.js'),'utf8');
  vm.runInNewContext(script,sandbox);
  await new Promise(resolve=>setImmediate(resolve));
  const en = elt('#projects').innerHTML;
  const featured = data.works.filter(w=>w.published && w.category==='project' && w.featured);
  assert.equal((en.match(/<article class="work">/g)||[]).length,featured.length);
  for (const project of featured) assert.ok(en.includes('projects/'+project.slug+'/'));
  for (const project of data.works.filter(w=>w.category==='project' && !w.featured)) {
    assert.ok(!en.includes('projects/'+project.slug+'/'));
  }
  assert.ok(en.includes('pixelfit-home-browser-preview.jpg'));
  assert.ok(en.includes('pixelfit-workout-browser-preview.jpg'));
  assert.ok(en.includes('pixelfit-result-browser-preview.jpg'));
  assert.ok(en.includes('class="cover-phone-strip"'));
  assert.ok(en.includes('has-phone-layout'));
  assert.ok(en.includes('Real UI · browser QA'));
  assert.ok(en.includes('trading-radar-dashboard-demo.png'));
  assert.ok(en.includes('Real UI · mock data'));
  assert.ok(en.includes('Browse all projects'));
  assert.ok(en.includes('href="projects/"'));
  const researchEn = elt('#research').innerHTML;
  assert.ok(researchEn.includes('When2ask'));
  assert.ok(researchEn.includes('when2ask-intervention-plan.svg'));
  assert.ok(researchEn.includes('authority-aware-framing.svg'));
  assert.ok(researchEn.includes('Conceptual diagram'));
  assert.ok(researchEn.includes('href="research/when2ask/"'));
  assert.ok(researchEn.includes('href="research/authority-aware-agents/"'));
  assert.ok(researchEn.includes('href="research/"'));
  assert.ok(researchEn.includes('Browse all research'));
  assert.ok(!researchEn.includes('projects/when2ask'));
  assert.ok(!researchEn.includes('Paper ↗'));

  assert.ok(handlers.has('#chinese:click'));
  handlers.get('#chinese:click')();
  const zh = elt('#projects').innerHTML;
  assert.ok(zh.includes('href="zh/projects/"'));
  assert.ok(zh.includes('zh/projects/pixelfit/'));
  assert.ok(zh.includes('查看全部專案'));
  assert.ok(zh.includes('真實介面 · Mock 資料'));
  assert.ok(zh.includes('實際介面 · 瀏覽器 QA'));
  const researchZh = elt('#research').innerHTML;
  assert.ok(researchZh.includes('href="zh/research/when2ask/"'));
  assert.ok(researchZh.includes('href="zh/research/"'));
  assert.ok(researchZh.includes('查看全部研究'));
  assert.equal(document.documentElement.lang,'zh-Hant');
});
