const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
test('home hero portrait reserves dimensions and is prioritized',()=>{
 const script=read('site.js');
 assert.match(script,/class="avatar"[\s\S]*?width="136" height="136" decoding="async" loading="eager" fetchpriority="high"/);
});
test('homepage work gallery avoids all-eager download competition',()=>{
 const script=read('site.js');
 assert.doesNotMatch(script,/renderImage\(g\.image, tr\(g, 'caption'\) \|\| tr\(w, 'title'\), 'phone-shot', 'eager'\)/);
 assert.match(script,/fetchpriority="low"/);
});
test('detail pages keep hero eagerly loaded with high priority',()=>{
 for(const file of ['scripts/build_project_pages.py','scripts/build_research_pages.py'])
   assert.match(read(file),/loading="eager" fetchpriority="high" decoding="async"/);
});
test('Lighthouse checks deploys and workflow changes without claiming field INP',()=>{
 const workflow=read('.github/workflows/lighthouse.yml');
 assert.match(workflow,/workflow_dispatch/);
 assert.match(workflow,/lighthouse@12/);
 assert.match(workflow,/workflow_run:/);
 assert.match(workflow,/pull_request:/);
 assert.match(workflow,/'.github\/workflows\/lighthouse.yml'/);
 assert.match(workflow,/github.event.workflow_run.conclusion == 'success'/);
});
