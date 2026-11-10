/* Summarize Lighthouse lab results; do not conflate with field Core Web Vitals. */
'use strict';
const fs=require('node:fs');
const paths=process.argv.slice(2);
if(!paths.length){console.error('Usage: node scripts/summarize_lighthouse.cjs <report.json>...');process.exit(1);}
for(const path of paths){
 const report=JSON.parse(fs.readFileSync(path,'utf8'));
 if(!report.audits||!report.categories?.performance)throw Error('Invalid Lighthouse report: '+path);
 const audits=report.audits;
 const metric=id=>audits[id]?.numericValue??null;
 const format=(id,unit)=>metric(id)===null?'n/a':(unit==='s'?(metric(id)/1000).toFixed(2)+' s':metric(id).toFixed(3));
 console.log([path,'score='+Math.round(report.categories.performance.score*100),
   'LCP='+format('largest-contentful-paint','s'),
   'CLS='+format('cumulative-layout-shift','score'),
   'TBT='+format('total-blocking-time','ms')+' ms',
   'FCP='+format('first-contentful-paint','s')].join(' | '));
}
console.log('These are Lighthouse lab observations, NOT field INP or 28-day CrUX percentiles.');
