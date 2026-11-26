'use strict';
/**
 * Read-only repository release governance audit.
 * Never treats API 403/404 for branch protection as proof of absence.
 * Ruleset evidence must target main and be active; unknown rule shapes are not inferred.
 */
const REPO='Gule7309/yuhisang.lo';
const EXPECTED_CHECKS=['Portfolio PR validation / verify','Portfolio pull request checks / validate','CMS staging publication gate / cms-content-only'];
function mainTarget(rule){
 const target=rule&&rule.conditions&&rule.conditions.ref_name;
 const include=Array.isArray(target&&target.include)?target.include:[];
 const exclude=Array.isArray(target&&target.exclude)?target.exclude:[];
 if(exclude.includes('refs/heads/main')||exclude.includes('main'))return false;
 return include.some(x=>x==='refs/heads/main'||x==='main'||x==='~DEFAULT_BRANCH'||x==='~ALL');
}
function inspectRulesets(rulesets){
 if(!Array.isArray(rulesets))throw Error('Invalid ruleset list');
 const active=rulesets.filter(x=>x&&x.enforcement==='active'&&x.target==='branch'&&mainTarget(x));
 const needed=active.some(x=>Array.isArray(x.rules)&&x.rules.some(r=>r.type==='required_status_checks'));
 const pr=active.some(x=>Array.isArray(x.rules)&&x.rules.some(r=>r.type==='pull_request'));
 const noDelete=active.some(x=>Array.isArray(x.rules)&&x.rules.some(r=>r.type==='deletion'));
 const checks=active.flatMap(x=>(x.rules||[]).filter(r=>r.type==='required_status_checks').flatMap(r=>(r.parameters&&r.parameters.required_status_checks)||[]).map(x=>x.context));
 return {activeCount:active.length,pullRequestRequired:pr,statusChecksConfigured:needed,requiredChecks:[...new Set(checks)],deletionBlocked:noDelete};
}
async function requestJSON(path,fetcher,token){
 const headers={Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
 if(token)headers.Authorization='Bearer '+token;
 try{
  const response=await fetcher('https://api.github.com/repos/'+REPO+path,{headers});
  if(response.status===403||response.status===401)return {status:'unknown',reason:'insufficient API permission or rate limit'};
  if(response.status===404)return {status:'unknown',reason:'endpoint not found or unavailable to integration'};
  if(!response.ok)return {status:'unknown',reason:'HTTP '+response.status};
  return {status:'ok',value:await response.json()};
 }catch(_){return {status:'unknown',reason:'API request failed'};}
}
async function audit(fetcher=fetch,token=process.env.GITHUB_TOKEN||''){
 const list=await requestJSON('/rulesets?includes_parents=true&per_page=100',fetcher,token);
 let rules=null;
 if(list.status==='ok'&&Array.isArray(list.value)){
  const expanded=[];
  for(const rule of list.value){
   if(!rule||!rule.id)continue;
   const detail=await requestJSON('/rulesets/'+rule.id,fetcher,token);
   if(detail.status==='ok')expanded.push(detail.value);
  }
  rules=inspectRulesets(expanded);
 }
 const protection=await requestJSON('/branches/main/protection',fetcher,token);
 const legacy=protection.status==='ok'?{
  requiredReviews:!!protection.value.required_pull_request_reviews,
  requiredStatusChecks:!!protection.value.required_status_checks,
  enforcedAdmins:!!(protection.value.enforce_admins&&protection.value.enforce_admins.enabled),
  allowForcePushes:!!(protection.value.allow_force_pushes&&protection.value.allow_force_pushes.enabled)
 }:null;
 // Even a configured ruleset may have exceptions / bypass actors, so no definitive
 // claim that every direct push is blocked is made here.
 return {repo:REPO,rulesetQuery:list.status,rulesets:rules,
   legacyQuery:protection.status,legacy,
   result:rules&&rules.pullRequestRequired&&rules.statusChecksConfigured?'configured-check-required':'manual-verification-needed',
   recommendedChecks:EXPECTED_CHECKS};
}
function summary(data){
 const safe=v=>String(v==null?'unknown':v);
 const rows=[
  '## Release governance read-only audit',
  '- Repository: `'+data.repo+'`',
  '- Active matching main rulesets: '+(data.rulesets?data.rulesets.activeCount:'unknown'),
  '- Ruleset PR requirement: '+(data.rulesets?safe(data.rulesets.pullRequestRequired):'unknown'),
  '- Ruleset required status checks: '+(data.rulesets?safe(data.rulesets.statusChecksConfigured):'unknown'),
  '- Reported check contexts: '+(data.rulesets&&data.rulesets.requiredChecks.length?data.rulesets.requiredChecks.join(', '):'not verified'),
  '- Traditional branch protection API: '+data.legacyQuery,
  '- Governance status: '+data.result,
  '',
  '**Do not interpret missing permission as missing protection.** Check bypass actors, required checks and ruleset enforcement directly in GitHub Settings.'
 ];
 return rows.join('\n')+'\n';
}
if(require.main===module){
 audit().then(data=>{const out=summary(data);process.stdout.write(out);if(process.env.GITHUB_STEP_SUMMARY)require('node:fs').appendFileSync(process.env.GITHUB_STEP_SUMMARY,out);})
 .catch(e=>{console.error(e);process.exitCode=1;});
}
module.exports={audit,summary,mainTarget,inspectRulesets,EXPECTED_CHECKS};
