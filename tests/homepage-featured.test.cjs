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
    URL, location:{href:'https://gule7309.github.io/yuhisang.lo/'},
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
  assert.ok(en.includes('Browse all projects'));
  assert.ok(en.includes('href="projects/"'));
  assert.ok(elt('#research').innerHTML.includes('When2ask'));
  assert.ok(!elt('#research').innerHTML.includes('projects/when2ask'));

  assert.ok(handlers.has('#chinese:click'));
  handlers.get('#chinese:click')();
  const zh = elt('#projects').innerHTML;
  assert.ok(zh.includes('href="zh/projects/"'));
  assert.ok(zh.includes('zh/projects/pixelfit/'));
  assert.ok(zh.includes('查看全部專案'));
  assert.equal(document.documentElement.lang,'zh-Hant');
});
