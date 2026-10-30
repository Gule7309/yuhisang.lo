
'use strict';

const $ = (selector) => document.querySelector(selector);
let language = 'en';
try { language = localStorage.getItem('gule-language') === 'zh' ? 'zh' : 'en'; } catch (_) {}

const labels = {
  en: {
    about: 'About', research: 'Selected Research', projects: 'Selected Projects',
    experience: 'Experience', education: 'Education', news: 'News',
    writing: 'Writing & Research Notes', achievements: 'Awards & Credentials',
    personal: 'Beyond Research', contact: 'Contact', intro: 'About me',
    researchNote: 'Ongoing research directions and experiments, not peer-reviewed publications.',
    projectsNote: 'Products and engineering prototypes at various stages of development.',
    writingNote: 'Working notes and reflections, not peer-reviewed articles.',
    achievementNote: 'Verified credentials; awards will be added with supporting evidence.',
    gallery: 'Project screenshots', openNote: 'Read note',
    contactNote: 'Interested in research, engineering, or collaboration? Find me here.',
    cv: 'Curriculum Vitae', demo: 'Demo', repository: 'GitHub',
    caseStudy: 'Case study', allProjects: 'Browse all projects',
    researchDetail: 'Research overview', allResearch: 'Browse all research',
    paper: 'Paper', video: 'Video', resource: 'Related resource', photoAlt: 'Project screenshot'
  },
  zh: {
    about: '關於', research: '精選研究', projects: '精選專案',
    experience: '經歷', education: '學歷', news: '近期動態',
    writing: '研究筆記與文章', achievements: '獎項與證照',
    personal: '研究之外', contact: '聯絡', intro: '關於我',
    researchNote: '研究方向與實驗工作，並非已發表或經同儕審查的論文。',
    projectsNote: '不同開發階段的產品與工程原型。',
    writingNote: '研究過程中的個人筆記與反思，並非正式學術論文。',
    achievementNote: '目前先列有紀錄的語言檢定；獎項將待資料核實後加入。',
    gallery: '專案截圖', openNote: '閱讀筆記',
    contactNote: '歡迎交流研究、工程與產品開發。',
    cv: '英文履歷', demo: 'Demo', repository: 'GitHub',
    caseStudy: '專案詳情', allProjects: '查看全部專案',
    researchDetail: '研究詳情', allResearch: '查看全部研究',
    paper: '論文', video: '影片', resource: '相關資料', photoAlt: '專案截圖'
  }
};

const esc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[ch]);
const tr = (item, field) => item && (item[field + '_' + language] || item[field + '_en'] || '') || '';
const url = (raw) => {
  const value = String(raw || '').trim();
  if (!value) return '';
  try {
    const parsed = new URL(value, location.href);
    return ['https:', 'mailto:'].includes(parsed.protocol) ? parsed.href : '';
  } catch (_) { return ''; }
};
// Shared icons are auto-selected from the platform, label, or URL.
function getIcon(iconName, label, href) { return PortfolioUI.socialIcon(iconName, label, href); }
function icon(name) { return '<i class="bi ' + esc(name) + '" aria-hidden="true"></i>'; }
function anchor(raw, label, cssClass, iconName) {
  const href = url(raw);
  if (!href) return '';
  const className = cssClass ? ' class="' + esc(cssClass) + '"' : '';
  return '<a' + className + ' href="' + esc(href) +
    '" target="_blank" rel="noopener noreferrer">' +
    (iconName ? icon(iconName) : '') + '<span>' + esc(label) + '</span></a>';
}
function socialLink(link) {
  return anchor(link.url, link.label, 'social-link', getIcon(link.icon, link.label, link.url));
}
function tags(list) {
  const values = Array.isArray(list) ? list : [];
  return values.length ? '<div class="tags">' + values.map((s) =>
    '<span>' + esc(s) + '</span>').join('') + '</div>' : '';
}
function renderImage(raw, alt, className) {
  const src = url(raw);
  if (!src) return '';
  return '<img' + (className ? ' class="' + esc(className) + '"' : '') +
    ' src="' + esc(src) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async">';
}
function renderGallery(item) {
  const files = Array.isArray(item.gallery) ? item.gallery : [];
  const images = files.filter((g) => g && url(g.image));
  if (!images.length) return '';
  return '<div class="work-gallery-label">' + labels[language].gallery + '</div>' +
    '<div class="work-images">' + images.map((g, index) => {
      const source = url(g.image);
      const caption = tr(g, 'caption') || (labels[language].photoAlt + ' ' + (index + 1));
      return '<a href="' + esc(source) + '" target="_blank" rel="noopener noreferrer"' +
        ' title="' + esc(caption) + '">' + renderImage(g.image, caption, '') + '</a>';
    }).join('') + '</div>';
}
let database = null;
function renderWorks(category) {
  const items = (database.works || []).filter((w) =>
    w.published && w.category === category && (category !== 'project' || w.featured === true))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  return items.map((w) => {
    const statusVariant = PortfolioUI.statusType(w);
    const detailPath = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(w.slug || '')
      ? (language === 'zh' ? 'zh/' : '') + (category === 'research' ? 'research/' : 'projects/') + w.slug + '/' : '';
    const detailLabel = category === 'research' ? labels[language].researchDetail : labels[language].caseStudy;
    const ownPaper = category !== 'research' ||
      (w.publication_status === 'preprint' && Boolean(w.paper)) ||
      (w.publication_status === 'peer_reviewed' && Boolean(w.paper) && Boolean(w.publication_venue));
    const hasImage = Boolean(url(w.image));
    const cover = hasImage ? renderImage(w.image, tr(w, 'title'), '') :
      '<small>GULE LAB / ' + esc(category) + '</small>' +
      '<strong>' + esc(String(w.slug || '').replace(/-/g, ' ').split(' ').slice(0, 3).join(' ')) + '</strong>';
    const links = [
      detailPath ? '<a href="' + esc(detailPath) + '"><i class="bi bi-arrow-up-right" aria-hidden="true"></i><span>' + esc(detailLabel) + '</span></a>' : '',
      anchor(w.github, labels[language].repository, '', 'bi-github'),
      anchor(w.demo, labels[language].demo, '', 'bi-box-arrow-up-right'),
      ownPaper ? anchor(w.paper, labels[language].paper, '', 'bi-file-earmark-text') : '',
      anchor(w.video_link, labels[language].video, '', 'bi-play-circle')
    ].filter(Boolean).join('');
    return '<article class="work"><div class="cover' + (hasImage ? ' has-image' : '') + '">' +
      cover + '</div><div><span class="badge status-badge status-badge--' + esc(statusVariant) + '">' +
      icon(PortfolioUI.statusIcon(statusVariant)) + '<span>' + esc(tr(w, 'status')) +
      '</span></span><span class="year">' + esc(w.year || '') + '</span><h3>' +
      (detailPath ? '<a class="case-title-link" href="' + esc(detailPath) + '">' + esc(tr(w, 'title')) + '</a>' : esc(tr(w, 'title'))) +
      '</h3><div class="subtitle">' + esc(tr(w, 'subtitle')) +
      '</div><p class="summary">' + esc(tr(w, 'summary')) + '</p>' + tags(w.tags) +
      (links ? '<div class="links work-extra-links">' + links + '</div>' : '') +
      renderGallery(w) + '</div></article>';
  }).join('');
}
function section(id, content) {
  const element = $('#' + id);
  if (!element) return;
  element.hidden = !content;
  const nav = document.querySelector('nav a[data-i="' + id + '"]');
  if (nav) nav.hidden = !content;
  if (content) element.innerHTML = '<h2>' + esc(labels[language][id]) + '</h2>' + content;
}
function education() {
  return (database.profile.education || []).map((e) =>
    '<div class="edu"><div><strong>' + esc(tr(e, 'institution')) + '</strong>' +
    '<p>' + esc(tr(e, 'degree')) + '</p><p>' + esc(tr(e, 'details')) + '</p></div>' +
    '<time>' + esc(e.period || '') + '</time></div>').join('');
}
function experience() {
  return (database.profile.experience || []).filter((e) => e.published).map((e) =>
    '<div class="edu"><div><strong>' + esc(tr(e, 'organization')) + '</strong>' +
    '<p>' + esc(tr(e, 'role')) + '</p><p>' + esc(tr(e, 'details')) + '</p></div>' +
    '<time>' + esc(e.period || '') + '</time></div>').join('');
}
function news() {
  return (database.news || []).filter((n) => n.published)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .map((n) => '<div class="newsrow"><time>' + esc(n.date) +
      '</time><span>' + esc(tr(n, 'title')) + '</span></div>').join('');
}
function writing() {
  return (database.writing || []).filter((n) => n.published)
    .sort((a, b) => (a.order || 0) - (b.order || 0)).map((n) => {
      const paragraphs = tr(n, 'body').split(/\n\s*\n/g).map((x) =>
        '<p>' + esc(x.trim()) + '</p>').join('');
      return '<article class="article-entry"><div class="article-meta"><span>' +
        esc(n.date || '') + '</span><span>' + esc(n.type || 'Research Note') + '</span></div>' +
        '<h3>' + esc(tr(n, 'title')) + '</h3><p class="article-summary">' +
        esc(tr(n, 'summary')) + '</p>' +
        (paragraphs ? '<details class="note-expand"><summary>' + labels[language].openNote +
          '</summary><div class="note-body">' + paragraphs + '</div></details>' : '') +
        (url(n.related_url) ? '<div class="links">' +
          anchor(n.related_url, labels[language].resource, '', 'bi-arrow-up-right') + '</div>' : '') +
        '</article>';
    }).join('');
}
function achievements() {
  return (database.achievements || []).filter((a) => a.published)
    .sort((a, b) => (a.order || 0) - (b.order || 0)).map((a) => {
      const kind = a.type === 'award' ? (language === 'zh' ? '獎項' : 'Award') :
        a.type === 'certification' ? (language === 'zh' ? '檢定 / 證照' : 'Certification') :
        (language === 'zh' ? '成果' : 'Achievement');
      return '<div class="credential"><div><span class="credential-kind">' + esc(kind) +
        '</span><h3>' + esc(tr(a, 'title')) + '</h3><p>' +
        esc([a.issuer, tr(a, 'details')].filter(Boolean).join(' · ')) + '</p>' +
        (url(a.evidence_url) ? '<div class="links">' +
          anchor(a.evidence_url, language === 'zh' ? '證明資料' : 'Evidence', '', 'bi-box-arrow-up-right') +
          '</div>' : '') + '</div><span class="credential-year">' + esc(a.year || '') +
        '</span></div>';
    }).join('');
}
function personal() {
  const p = database.personal;
  if (!p || !p.published) return '';
  const photos = (p.photos || []).filter((x) => url(x.image));
  const gallery = photos.length ? '<div class="photo-grid">' +
    photos.map((x) => '<figure>' + renderImage(x.image, tr(x, 'caption') || tr(p, 'title'), '') +
      '<figcaption>' + esc(tr(x, 'caption')) + '</figcaption></figure>').join('') +
    '</div>' : '';
  return '<p class="personal-copy">' + esc(tr(p, 'about')) + '</p>' + gallery;
}
function render() {
  const p = database.profile;
  const t = labels[language];
  document.documentElement.lang = language === 'zh' ? 'zh-Hant' : 'en';
  document.title = (language === 'zh' ? p.name_zh : p.name_en) + ' | Research & Engineering';
  document.querySelectorAll('nav a').forEach((a) => {
    if (a.dataset.i && t[a.dataset.i]) a.textContent = t[a.dataset.i];
  });
  $('#english').classList.toggle('selected', language === 'en');
  $('#chinese').classList.toggle('selected', language === 'zh');
  const social = (p.socials || []).map(socialLink).join('');
  const email = p.email ? anchor('mailto:' + p.email, 'Email', 'social-link', 'bi-envelope') : '';
  const cv = p.cv_url ? anchor(p.cv_url, t.cv + ' ↗', 'profile-quicklink', 'bi-file-earmark-pdf') : '';
  $('#profile').innerHTML =
    '<img class="avatar" src="' + esc(url(p.avatar)) + '" alt="' + esc(tr(p, 'name')) + '">' +
    '<h2>' + esc(p.short_name) + '</h2><p class="role">' +
    esc(tr(p, 'role')) + '<br>' + esc(tr(p, 'affiliation')) + '</p>' +
    '<p class="side-message">' + esc(tr(p, 'headline')) + '</p>' +
    '<div class="socials">' + email + social + '</div>' + cv;
  $('#about').innerHTML = '<p class="eyebrow">' + esc(t.intro) + '</p>' +
    '<h1>' + esc(tr(p, 'headline')) + '</h1>' +
    '<div class="bio">' + tr(p, 'about').split(/\n\s*\n/g).map((x) =>
      '<p>' + esc(x) + '</p>').join('') + '</div>' + tags(p.interests) +
    (p.cv_url ? '<div class="links" style="margin-top:23px">' +
      anchor(p.cv_url, t.cv + ' ↗', 'cv-link', 'bi-file-earmark-pdf') + '</div>' : '');
  section('research', '<p class="hint">' + t.researchNote + '</p>' + renderWorks('research') + '<p class="archive-more"><a href="' + (language === 'zh' ? 'zh/research/' : 'research/') + '">' + esc(t.allResearch) + ' <i class="bi bi-arrow-right" aria-hidden="true"></i></a></p>');
  section('projects', '<p class="hint">' + t.projectsNote + '</p>' + renderWorks('project') + '<p class="archive-more"><a href="' + (language === 'zh' ? 'zh/projects/' : 'projects/') + '">' + esc(t.allProjects) + ' <i class="bi bi-arrow-right" aria-hidden="true"></i></a></p>');
  section('experience', experience());
  section('education', education());
  section('news', news());
  const articles = writing();
  section('writing', articles ? '<p class="section-eyebrow">' + t.writingNote + '</p>' + articles : '');
  const awards = achievements();
  section('achievements', awards ? '<p class="section-eyebrow">' + t.achievementNote + '</p>' + awards : '');
  const personalContent = personal();
  section('personal', personalContent);
  if (personalContent && database.personal && tr(database.personal, 'title')) {
    const heading = document.querySelector('#personal h2');
    if (heading) heading.textContent = tr(database.personal, 'title');
  }
  const contacts = (p.email ? anchor('mailto:' + p.email, 'Email', '', 'bi-envelope') : '') +
    (p.socials || []).map((s) => anchor(s.url, s.label, '', getIcon(s.icon, s.label, s.url))).join('') +
    (p.cv_url ? anchor(p.cv_url, t.cv, '', 'bi-file-earmark-pdf') : '');
  section('contact', '<p class="hint">' + t.contactNote + '</p><div class="contactlinks">' +
    contacts + '</div>');
  $('#footer').textContent = '© ' + new Date().getFullYear() + ' ' +
    p.short_name + ' · Research, engineering, and thoughtful products.';
}
async function fetchJson(name, fallback) {
  try {
    const response = await fetch('content/' + name + '.json', {cache:'no-cache'});
    if (!response.ok) throw new Error(name + ': HTTP ' + response.status);
    return response.json();
  } catch (error) {
    console.warn('Content could not load:', name, error);
    return fallback;
  }
}
Promise.all([
  fetchJson('profile', null), fetchJson('works', []), fetchJson('news', []),
  fetchJson('writing', []), fetchJson('achievements', []), fetchJson('personal', {})
]).then(([profile, works, newsItems, writingItems, achievementItems, personalData]) => {
  if (!profile) throw new Error('Missing profile content');
  database = {profile, works, news: newsItems, writing: writingItems,
    achievements: achievementItems, personal: personalData};
  render();
}).catch((error) => {
  console.error(error);
  $('#about').textContent = 'Content unavailable. Please refresh the page.';
});
function setLanguage(next) {
  language = next;
  try { localStorage.setItem('gule-language', next); } catch (_) {}
  if (database) render();
}
$('#english').addEventListener('click', () => setLanguage('en'));
$('#chinese').addEventListener('click', () => setLanguage('zh'));
$('#up').addEventListener('click', () => scrollTo({top:0, behavior:'smooth'}));
