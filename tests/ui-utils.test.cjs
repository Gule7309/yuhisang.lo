'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { socialIcon, statusType, statusIcon } = require('../ui-utils.js');

test('bilingual status text resolves into a semantic stage', () => {
  const cases = [
    ['Research in progress', '研究進行中', 'research'],
    ['Research proposal', '研究提案階段', 'proposal'],
    ['Internal testing', '內部測試中', 'testing'],
    ['Active prototype', '持續開發中的原型', 'active'],
    ['Prototype exploration', '原型探索中', 'exploration'],
    ['Exploratory prototype', '探索性原型', 'exploration'],
    ['Prototype', '原型開發', 'prototype'],
    ['Released', '正式上線', 'released']
  ];
  for (const [status_en, status_zh, kind] of cases) {
    assert.equal(statusType({status_en, status_zh}), kind);
  }
});

test('CMS stage selection overrides text; unknown entries remain safe', () => {
  assert.equal(statusType({status_type:'active',status_zh:'其他狀態'}),'active');
  assert.equal(statusType({status_type:'auto',status_en:'Beta testing'}),'testing');
  assert.equal(statusType({status_type:'unrecognized',status_zh:'未知狀態'}),'default');
  assert.equal(statusType({status_en:'In review'}),'default');
});

test('every recognized stage has a status icon', () => {
  for (const kind of ['proposal','research','exploration','prototype','active','testing','released','paused','default']) {
    assert.match(statusIcon(kind), /^bi-/);
  }
});

test('social icon comes from override, label or platform URL with a generic fallback', () => {
  assert.equal(socialIcon('github','My work','https://example.com'),'bi-github');
  assert.equal(socialIcon('', 'Instagram','https://example.com'),'bi-instagram');
  assert.equal(socialIcon('', 'Follow me','https://x.com/example'),'bi-twitter-x');
  assert.equal(socialIcon('', 'Academic profile','https://scholar.google.com/citations?user=123'),'bi-mortarboard');
  assert.equal(socialIcon('', 'Professional network','https://www.linkedin.com/in/example'),'bi-linkedin');
  assert.equal(socialIcon('', 'Reach out','mailto:hello@example.org'),'bi-envelope');
  assert.equal(socialIcon('', 'Example','https://other-provider.example'),'bi-link-45deg');
  assert.equal(socialIcon('link','GitHub','https://github.com/example'),'bi-link-45deg');
});

test('site loads status utilities before use; current project metadata is valid', () => {
  const root = path.resolve(__dirname, '..');
  const markup = fs.readFileSync(path.join(root, 'index.html'),'utf8');
  assert.ok(markup.indexOf('src="ui-utils.js"') < markup.indexOf('src="site.js"'));
  assert.ok(markup.includes('href="status-badges.css"'));
  vm.compileFunction(fs.readFileSync(path.join(root,'site.js'),'utf8'), []);
  const css = fs.readFileSync(path.join(root,'status-badges.css'),'utf8');
  const works = JSON.parse(fs.readFileSync(path.join(root,'content/works.json'),'utf8'));
  for (const entry of works) {
    const kind=statusType(entry);
    assert.match(css,new RegExp('status-badge--'+kind+'\\\\s*\\\\{'));
  }
});
