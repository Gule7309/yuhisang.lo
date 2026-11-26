'use strict';
/**
 * Isolated release lifecycle simulation. Creates throwaway local Git repos.
 * Does NOT authenticate into Sveltia, access GitHub remotely, or publish real data.
 */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const cp=require('node:child_process');
const scripts=path.resolve(__dirname,'../scripts');
function cmd(cwd,program,args,opts={}){
 return cp.execFileSync(program,args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe'],...opts}).trim();
}
function fixture(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'portfolio-release-e2e-'));
 const remote=path.join(root,'remote.git');
 const work=path.join(root,'editor');
 const cleanup=()=>fs.rmSync(root,{recursive:true,force:true});
 cmd(root,'git',['init','--bare','-b','main',remote]);
 cmd(root,'git',['clone',remote,work]);
 cmd(work,'git',['config','user.email','cms-test@example.invalid']);
 cmd(work,'git',['config','user.name','CMS Test Fixture']);
 fs.mkdirSync(path.join(work,'content'),{recursive:true});
 fs.writeFileSync(path.join(work,'content/works.json'),'[]\n');
 cmd(work,'git',['add','.']);
 cmd(work,'git',['commit','-m','initial main']);
 cmd(work,'git',['push','origin','HEAD:main']);
 cmd(work,'git',['push','origin','HEAD:cms-staging']);
 const rev=branch=>cmd(root,'git',['--git-dir',remote,'rev-parse','refs/heads/'+branch]);
 const stageSave=(entry,subject='saved staging draft')=>{
   cmd(work,'git',['checkout','-B','cms-staging','origin/cms-staging']);
   fs.writeFileSync(path.join(work,'content/works.json'),JSON.stringify([entry],null,2)+'\n');
   cmd(work,'git',['add','content/works.json']);
   cmd(work,'git',['commit','-m',subject]);
   cmd(work,'git',['push','origin','HEAD:cms-staging']);
 };
 const mainChange=()=>{
   cmd(work,'git',['checkout','main']);
   cmd(work,'git',['pull','--ff-only','origin','main']);
   fs.writeFileSync(path.join(work,'README.fixture'),'reviewed site update\n'+Date.now()+'\n');
   cmd(work,'git',['add','README.fixture']);
   cmd(work,'git',['commit','-m','reviewed release']);
   cmd(work,'git',['push','origin','HEAD:main']);
 };
 const sync=(env={})=>cmd(work,'bash',[path.join(scripts,'cms_staging_sync.sh')],{
   env:{...process.env,CMS_EVENT_TYPE:'workflow_dispatch',CMS_REMOTE:'origin',...env}
 });
 return {root,work,remote,cleanup,rev,stageSave,mainChange,sync};
}
const item={slug:'sample-work',published:false,category:'research',title_en:'Draft'};
test('CMS staging save remains out of main until explicit publication',()=>{
 const f=fixture();
 try{
   const main=f.rev('main');
   f.stageSave(item);
   assert.equal(f.rev('main'),main);
   assert.notEqual(f.rev('cms-staging'),main);
   const out=f.sync();
   assert.match(out,/SKIP: unpublished or divergent staging commits/);
   assert.notEqual(f.rev('cms-staging'),main);
 }finally{f.cleanup();}
});
test('successful review release can fast-forward an untouched staging branch',()=>{
 const f=fixture();
 try{
   const stage=f.rev('cms-staging');
   f.mainChange();
   const updated=f.rev('main');
   assert.notEqual(updated,stage);
   assert.match(f.sync(),/UPDATED: staging fast-forwarded to main/);
   assert.equal(f.rev('cms-staging'),updated);
   assert.match(f.sync(),/SYNCED/);
 }finally{f.cleanup();}
});
test('diverging main and staging retains unpublished content',()=>{
 const f=fixture();
 try{
   f.stageSave(item);
   const draftSha=f.rev('cms-staging');
   f.mainChange();
   const deployed=f.rev('main');
   assert.match(f.sync(),/SKIP: unpublished or divergent staging commits/);
   assert.equal(f.rev('cms-staging'),draftSha);
   assert.equal(f.rev('main'),deployed);
 }finally{f.cleanup();}
});
test('late workflow_run cannot sync a newer main commit',()=>{
 const f=fixture();
 try{
   const deployed=f.rev('main');
   f.mainChange();
   assert.match(f.sync({CMS_EVENT_TYPE:'workflow_run',CMS_DEPLOYED_SHA:deployed}),/SKIP: main advanced/);
   assert.notEqual(f.rev('cms-staging'),f.rev('main'));
 }finally{f.cleanup();}
});
test('content release gate rejects incomplete public records and accepts hidden drafts',()=>{
 const {validate}=require('../scripts/validate_content_release.cjs');
 const draft={slug:'sample-work',category:'research',published:false,title_en:'Unpublished'};
 assert.equal(validate([],[draft]).ok,true);
 const publicEntry={...draft,published:true};
 const invalid=validate([],[publicEntry]);
 assert.equal(invalid.ok,false);
 assert(invalid.errors.some(e=>e.includes('summary_zh')));
 const complete={...publicEntry,title_zh:'研究',subtitle_en:'Research',subtitle_zh:'研究',summary_en:'Summary',summary_zh:'摘要'};
 assert.equal(validate([],[complete]).ok,true);
});
