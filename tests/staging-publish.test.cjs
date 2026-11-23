'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {allowedChangedPath,inspectChangedPaths}=require('../scripts/validate_staging_changes.cjs');
test('CMS changes allow only explicit content JSON and uploaded assets',()=>{
 for(const f of ['content/works.json','content/profile.json','content/news.json',
   'content/writing.json','content/achievements.json','content/personal.json',
   'assets/uploads/figure.webp','assets/cv/my-cv.pdf'])assert.equal(allowedChangedPath(f),true,f);
 for(const f of ['admin/config.yml','site.js','.github/workflows/pages.yml','README.md',
   'content/private.json','assets/../admin/config.yml','assets\\cv\\bad.pdf',
   '/assets/uploads/figure.webp','assets/uploads/','assets/generated-cv/test.pdf'])
   assert.equal(allowedChangedPath(f),false,f);
});
test('staging review rejects all unexpected changed files',()=>{
 assert.deepEqual(inspectChangedPaths(['content/works.json','assets/uploads/p.png','scripts/build_project_pages.py']),
   ['scripts/build_project_pages.py']);
});
test('CMS backend must stay isolated from main and Pages deploy main only',()=>{
 const root=path.resolve(__dirname,'..');
 const config=fs.readFileSync(path.join(root,'admin/config.yml'),'utf8');
 const pages=fs.readFileSync(path.join(root,'.github/workflows/pages.yml'),'utf8');
 assert.match(config,/branch:\s*cms-staging/);
 assert.match(config,/publish_mode:\s*simple/);
 assert.match(pages,/branches:\s*\[main\]/);
 assert.match(pages,/if:\s*github\.ref == 'refs\/heads\/main'/);
 assert.doesNotMatch(pages,/branches:\s*\[cms-staging\]/);
});

test('staging publication CI requires current main and content-only diff',()=>{
 const root=path.resolve(__dirname,'..');
 const workflow=fs.readFileSync(path.join(root,'.github/workflows/staging-review.yml'),'utf8');
 assert.match(workflow,/git merge-base --is-ancestor/);
 assert.match(workflow,/validate_staging_changes\.cjs/);
 assert.match(workflow,/head\.ref == 'cms-staging'/);
 assert.match(workflow,/head\.repo\.full_name == github\.repository/);
});
test('editor guide exposes GitHub PR review and warns that staging is public',()=>{
 const root=path.resolve(__dirname,'..');
 const html=fs.readFileSync(path.join(root,'admin/publish.html'),'utf8');
 assert(html.includes('main...cms-staging?expand=1'));
 assert(html.includes('GitHub'));
 assert(html.includes('公開'));
 assert(!html.includes('fetch('));
});
