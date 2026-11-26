'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {audit,mainTarget,inspectRulesets,summary}=require('../scripts/audit_release_governance.cjs');
const sample={id:1,name:'main',target:'branch',enforcement:'active',conditions:{ref_name:{include:['refs/heads/main'],exclude:[]}},rules:[{type:'pull_request'},{type:'required_status_checks',parameters:{required_status_checks:[{context:'Portfolio PR validation / verify'}]}},{type:'deletion'}]};
test('only active matching main rulesets count',()=>{
 assert.equal(mainTarget(sample),true);
 assert.equal(mainTarget({...sample,conditions:{ref_name:{include:['refs/heads/main'],exclude:['main']}}}),false);
 assert.equal(inspectRulesets([sample,{...sample,id:2,enforcement:'disabled'}]).activeCount,1);
});
test('reports PR and status-check rules without declaring bypass status',()=>{
 const a=inspectRulesets([sample]);
 assert.equal(a.pullRequestRequired,true);
 assert.equal(a.statusChecksConfigured,true);
 assert.equal(a.deletionBlocked,true);
 assert.deepEqual(a.requiredChecks,['Portfolio PR validation / verify']);
});
test('403 branch protection is unknown, not unprotected',async()=>{
 const mock=async url=>url.endsWith('/rulesets?includes_parents=true&per_page=100')?
  {ok:true,status:200,json:async()=>[]}:{ok:false,status:403};
 const r=await audit(mock,'');
 assert.equal(r.legacyQuery,'unknown');
 assert.equal(r.result,'manual-verification-needed');
 assert.match(summary(r),/unknown/);
});
test('full ruleset detail is inspected rather than trusting summary metadata',async()=>{
 const mock=async url=>{
  const value=url.includes('/rulesets/1')?sample:url.includes('/rulesets?')?[{id:1,name:'main'}]:{};
  return {ok:true,status:200,json:async()=>value};
 };
 const r=await audit(mock,'');
 assert.equal(r.result,'configured-check-required');
 assert.equal(r.rulesets.requiredChecks[0],'Portfolio PR validation / verify');
});
