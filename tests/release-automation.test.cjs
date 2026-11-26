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
test('post-deploy stage sync is non-destructive and script-backed',()=>{
 const yaml=read('.github/workflows/staging-sync.yml');
 const script=read('scripts/cms_staging_sync.sh');
 assert.match(yaml,/workflow_run:/);
 assert.match(yaml,/conclusion == 'success'/);
 assert.match(yaml,/head_branch == 'main'/);
 assert.match(yaml,/bash scripts\/cms_staging_sync\.sh/);
 assert.match(script,/git merge-base --is-ancestor "\$stage_sha" "\$main_sha"/);
 assert.match(script,/git push "\$remote" "\$main_sha:refs\/heads\/cms-staging"/);
 assert.doesNotMatch(script,/git push[^\n]*(?:--force| -f\b)/);
 assert.doesNotMatch(script,/git reset --hard/);
});
test('post deployment verifies both CMS publishing and reviewing pages',()=>{
 const src=read('scripts/post_deploy_smoke.cjs');
 assert.match(src,/admin\/publish\.html/);
 assert.match(src,/admin\/review\.html/);
});
