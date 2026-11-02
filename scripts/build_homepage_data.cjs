'use strict';
/**
 * Produce the small homepage work index from the authoritative CMS-managed
 * content/works.json. Research/project details always read the full source.
 * Run on every Pages build BEFORE client JavaScript tests and deployment.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'content/works.json');
const DEST = path.join(ROOT, 'content/homepage-works.json');

const CARD_FIELDS = [
  'slug', 'category', 'published', 'featured', 'order',
  'title_en', 'title_zh', 'subtitle_en', 'subtitle_zh',
  'summary_en', 'summary_zh', 'status_en', 'status_zh', 'status_type',
  'year', 'tags', 'image', 'image_alt_en', 'image_alt_zh',
  'media_label_en', 'media_label_zh', 'media_layout',
  'github', 'demo', 'paper', 'publication_status', 'publication_venue',
  'video_link'
];
const MEDIA_FIELDS = ['image', 'caption_en', 'caption_zh', 'alt_en', 'alt_zh'];

function pick(source, fields) {
  const result = {};
  for (const name of fields) {
    if (Object.prototype.hasOwnProperty.call(source, name)) result[name] = source[name];
  }
  return result;
}

function buildHomepageWorks(works) {
  if (!Array.isArray(works)) throw new TypeError('Expected an array of CMS works');
  const cards = works.filter((work) => work && work.published === true &&
    (work.category === 'research' ||
      (work.category === 'project' && work.featured === true)));
  const slugs = new Set();
  return cards.map((work) => {
    if (typeof work.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(work.slug) ||
        slugs.has(work.slug)) throw new Error('Invalid or duplicate homepage slug');
    slugs.add(work.slug);
    const card = pick(work, CARD_FIELDS);
    for (const key of ['gallery', 'research_figures']) {
      const source = work[key];
      if (Array.isArray(source)) {
        card[key] = source.filter((media) => media &&
          typeof media.image === 'string' && media.image.trim()).map((media) =>
          pick(media, MEDIA_FIELDS));
      }
    }
    return card;
  });
}

function writeHomepageData() {
  const source = fs.readFileSync(SOURCE, 'utf8');
  const works = JSON.parse(source);
  const compact = buildHomepageWorks(works);
  const encoded = JSON.stringify(compact, null, 2) + '\n';
  fs.writeFileSync(DEST, encoded, 'utf8');
  const result = {
    visibleWorks: compact.length,
    fullSourceBytes: Buffer.byteLength(source, 'utf8'),
    homepageBytes: Buffer.byteLength(encoded, 'utf8')
  };
  console.log(JSON.stringify(result));
  return result;
}
if (require.main === module) writeHomepageData();

module.exports = {buildHomepageWorks, writeHomepageData, CARD_FIELDS, MEDIA_FIELDS};
