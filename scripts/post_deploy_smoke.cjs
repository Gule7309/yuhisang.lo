'use strict';
/* Post-deployment availability checks for public GitHub Pages routes.
 * These are smoke checks, not authenticated CMS/browser acceptance tests.
 */
const BASE='https://gule7309.github.io/yuhisang.lo/';
const ROUTES=[
  {path:'',marker:'id="main"'},
  {path:'research/',marker:'</html>'},
  {path:'projects/',marker:'</html>'},
  {path:'zh/research/',marker:'</html>'},
  {path:'zh/projects/',marker:'</html>'},
  {path:'admin/',marker:'sveltia-cms.js'}
];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function checkRoute(route,fetcher=fetch,base=BASE){
  const target=new URL(route.path,base).href;
  const response=await fetcher(target,{redirect:'follow',headers:{'Accept':'text/html'}});
  if(!response.ok)throw Error(route.path+': HTTP '+response.status);
  const type=response.headers.get('content-type')||'';
  if(!type.toLowerCase().includes('text/html'))throw Error(route.path+': unexpected type '+type);
  const body=await response.text();
  if(!body.includes(route.marker))throw Error(route.path+': missing expected marker');
  return target;
}
async function smoke({fetcher=fetch,base=BASE,retries=5,delayMs=4000,log=console}={}){
  if(retries<1)throw Error('retries must be positive');
  const results=[];
  for(const route of ROUTES){
    let lastError;
    for(let attempt=1;attempt<=retries;attempt++){
      try{
        const url=await checkRoute(route,fetcher,base);
        log.log('PASS '+url);
        results.push(url);
        lastError=null;
        break;
      }catch(error){
        lastError=error;
        log.warn('Attempt '+attempt+'/'+retries+' '+route.path+': '+error.message);
        if(attempt<retries)await sleep(delayMs);
      }
    }
    if(lastError)throw lastError;
  }
  return results;
}
module.exports={BASE,ROUTES,checkRoute,smoke};
if(require.main===module){
  smoke().catch(error=>{console.error('DEPLOY SMOKE FAILED:',error.message);process.exitCode=1;});
}
