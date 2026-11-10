'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {ROUTES,checkRoute,smoke}=require('../scripts/post_deploy_smoke.cjs');
function response(body,type='text/html',status=200){
 return {ok:status>=200&&status<300,status,headers:{get:()=>type},text:async()=>body};
}
test('smoke covers public homepage, bilingual archives and CMS',()=>{
 assert.deepEqual(ROUTES.map(x=>x.path),['','research/','projects/','zh/research/','zh/projects/','admin/']);
});
test('checks HTTP status and HTML markers',async()=>{
 const route={path:'projects/',marker:'test'};
 await assert.rejects(()=>checkRoute(route,async()=>response('oops','text/html',404)),/HTTP 404/);
 await assert.rejects(()=>checkRoute(route,async()=>response('test','application/json')),/unexpected type/);
 await assert.rejects(()=>checkRoute(route,async()=>response('missing')),/missing expected marker/);
 assert.match(await checkRoute(route,async()=>response('test')),/projects/);
});
test('smoke succeeds for valid routes without doing authenticated requests',async()=>{
 const calls=[];
 const fetcher=async url=>{
   calls.push(url);
   const route=ROUTES.find(x=>new URL(x.path,'https://gule7309.github.io/yuhisang.lo/').href===url);
   return response('<!doctype html><html><main id="main"></main> '+route.marker+'</html>');
 };
 const result=await smoke({fetcher,retries:1,delayMs:0,log:{log(){},warn(){}}});
 assert.equal(result.length,ROUTES.length);
 assert.equal(calls.length,ROUTES.length);
});
