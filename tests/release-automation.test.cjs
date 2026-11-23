'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('staging release gate checks changed public records',()=>{
 const yaml=read('.github/workflows/staging-review.yml');
 assert.match(yaml,/validate_staging_changes\.cjs/);
 assert.match(yaml,/validate_content_release\.cjs/);
 assert.match(yaml,/git show "\$BASE_SHA:content\/works\.json"/);
 assert.match(yaml,/git show "\$HEAD_SHA:content\/works\.json"/);
});
test('post-deploy stage sync only fast-forwards and refuses to force push',()=>{
 const yaml=read('.github/workflows/staging-sync.yml');
 assert.match(yaml,/workflow_run:/);
 assert.match(yaml,/conclusion == 'success'/);
 assert.match(yaml,/head_branch == 'main'/);
 assert.match(yaml,/git merge-base --is-ancestor "\$stage_sha" "\$main_sha"/);
 assert.match(yaml,/git push origin "\$main_sha:refs\/heads\/cms-staging"/);
 assert.doesNotMatch(yaml,/git push[^\n]*(?:--force| -f\b)/);
 assert.doesNotMatch(yaml,/git reset --hard/);
});
test('post deployment verifies both CMS publishing and reviewing pages',()=>{
 const src=read('scripts/post_deploy_smoke.cjs');
 assert.match(src,/admin\/publish\.html/);
 assert.match(src,/admin\/review\.html/);
});
