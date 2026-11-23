'use strict';
/**
 * A staging content PR must contain only CMS-owned content and media changes.
 * Branch protection must still be configured in GitHub for required checks.
 */
const path=require('node:path');
const fs=require('node:fs');
const allowedContent=new Set([
  'content/profile.json','content/works.json','content/news.json',
  'content/writing.json','content/achievements.json','content/personal.json'
]);
function allowedChangedPath(file){
  const value=String(file||'');
  if(!value||value.startsWith('/')||value.includes('\\')||
     value.split('/').includes('..')||value.split('/').includes('.'))return false;
  if(allowedContent.has(value))return true;
  return (value.startsWith('assets/uploads/')||value.startsWith('assets/cv/')) &&
    value.split('/').length>=3 && !value.endsWith('/');
}
function inspectChangedPaths(paths){
  return paths.filter(file=>!allowedChangedPath(file));
}
function check(){
  const changedPath=process.argv[2];
  if(!changedPath)throw Error('Usage: node scripts/validate_staging_changes.cjs <newline-file-list>');
  const files=fs.readFileSync(path.resolve(changedPath),'utf8').split(/\r?\n/).filter(Boolean);
  if(!files.length)throw Error('No content changes found: avoid empty staging release PRs.');
  const rejected=inspectChangedPaths(files);
  if(rejected.length)throw Error('Staging PR includes non-CMS paths: '+rejected.join(', '));
  console.log('Validated '+files.length+' CMS-owned content/media changes');
}
if(require.main===module){
  try{check();}catch(error){console.error(error.message);process.exitCode=1;}
}
module.exports={allowedChangedPath,inspectChangedPaths};
