'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {gzipSync} = require('node:zlib');
const {
  buildHomepageWorks, CARD_FIELDS, MEDIA_FIELDS
} = require('../scripts/build_homepage_data.cjs');

const ROOT=path.join(__dirname,'..');
const works=JSON.parse(fs.readFileSync(path.join(ROOT,'content/works.json'),'utf8'));
const generated=fs.readFileSync(path.join(ROOT,'content/homepage-works.json'),'utf8');
const subset=JSON.parse(generated);

test('compact homepage payload is deterministic and derived from authoritative works.json',()=>{
  assert.deepEqual(subset,buildHomepageWorks(works));
  assert.equal(generated,JSON.stringify(buildHomepageWorks(works),null,2)+'\n',
    'Homepage data must be regenerated on Pages deployment; never manually edited');
  assert.ok(subset.length>0);
  assert.ok(subset.every(w=>w.published && (w.category==='research' ||
    (w.category==='project' && w.featured===true))));
  for (const work of subset) {
    const original=works.find(w=>w.slug===work.slug);
    assert.ok(original);
    for(const key of Object.keys(work)) assert.ok([...CARD_FIELDS,'gallery','research_figures'].includes(key));
    for(const key of ['gallery','research_figures'])if(work[key]){
      for(const media of work[key])for(const field of Object.keys(media)){
        assert.ok(MEDIA_FIELDS.includes(field));
      }
    }
    for(const field of ['title_en','title_zh','status_en','status_zh','summary_en','summary_zh']){
      assert.equal(work[field],original[field]);
    }
    assert.equal(work.image,original.image);
  }
  assert.ok(!generated.includes('architecture_layers'));
  assert.ok(!generated.includes('source_traces'));
  assert.ok(!generated.includes('research_progress_en'));
});

test('smaller homepage index retains images and is a meaningful transfer reduction',()=>{
  const full=fs.readFileSync(path.join(ROOT,'content/works.json'));
  const slim=Buffer.from(generated);
  assert.ok(slim.length<full.length*0.5,
    'Regression: homepage should not refetch complete project/research narratives');
  assert.ok(gzipSync(slim).length<gzipSync(full).length*0.7,
    'Meaningful reduction also expected for compressed transmission');
  const pixels=subset.find(w=>w.slug==='pixelfit');
  assert.ok(pixels && pixels.gallery?.length>=3);
  const radar=subset.find(w=>w.slug==='trading-radar');
  assert.ok(radar && radar.image);
  const when2ask=subset.find(w=>w.slug==='when2ask');
  assert.ok(when2ask && when2ask.research_figures?.length);
});

test('projection rejects invalid or duplicate public slugs',()=>{
  assert.throws(()=>buildHomepageWorks([null,{published:true,category:'project',featured:true,slug:'X'}]),/Invalid or duplicate/);
  assert.throws(()=>buildHomepageWorks([
    {published:true,category:'research',slug:'sample'},
    {published:true,category:'research',slug:'sample'}]),/Invalid or duplicate/);
});
