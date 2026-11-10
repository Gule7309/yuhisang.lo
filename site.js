
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
    paper: 'Paper', video: 'Video', resource: 'Related resource', photoAlt: 'Project screenshot',
    menu: 'Sections', menuOpen: 'Open sections', menuClose: 'Close sections',
    navName: 'Page sections', skip: 'Skip to content', backToTop: 'Back to top',
    errorTitle: 'Content unavailable', errorMessage: 'The homepage could not load. You can still browse the research and projects archives.'
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
    paper: '論文', video: '影片', resource: '相關資料', photoAlt: '專案截圖',
    menu: '選單', menuOpen: '開啟章節選單', menuClose: '關閉章節選單',
    navName: '頁面章節導覽', skip: '跳至主要內容', backToTop: '回到頁首',
    errorTitle: '內容暫時無法載入', errorMessage: '首頁資料未能成功載入，你仍可瀏覽研究及專案列表。'
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
    if (['https:', 'mailto:'].includes(parsed.protocol)) return parsed.href;
    // Only allow same-origin local portfolio assets during HTTP preview/QA.
    // Never allow insecure external HTTP images or other protocols.
    const origin = new URL(location.href).origin;
    if (parsed.protocol === 'http:' && parsed.origin === origin &&
        parsed.pathname.startsWith('/yuhisang.lo/assets/')) return parsed.href;
    return '';
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
function renderImage(raw, alt, className, loading = 'lazy') {
  const src = url(raw);
  if (!src) return '';
  const priority = loading === 'eager' ? 'eager' : 'lazy';
  return '<img' + (className ? ' class="' + esc(className) + '"' : '') +
    ' src="' + esc(src) + '" alt="' + esc(alt) + '" loading="' + priority + '" decoding="async" fetchpriority="low">';
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
// The first genuine figure/screenshot can serve as a cover when no explicit cover was uploaded.
function previewMedia(work) {
  if (url(work.image)) return { image: work.image, alt: tr(work, 'image_alt') || tr(work, 'title') };
  const choices = work.category === 'research' ? work.research_figures : work.gallery;
  const first = Array.isArray(choices) ? choices.find(item => item && url(item.image)) : null;
  return first ? { image: first.image, alt: tr(first, 'alt') || tr(first, 'caption') || tr(work, 'title') } : { image: '', alt: '' };
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
    const preview = previewMedia(w);
    const hasImage = Boolean(preview.image);
    const isDiagram = /\.svg(?:[?#]|$)/i.test(preview.image);
    const phoneShots = category === 'project' && w.media_layout === 'phone' && Array.isArray(w.gallery)
      ? w.gallery.filter(g => g && url(g.image)).slice(0, 3) : [];
    const hasPhoneStrip = phoneShots.length > 1;
    const mediaLabel = hasImage && tr(w, 'media_label') ? '<span class="media-proof-label">' + esc(tr(w, 'media_label')) + '</span>' : '';
    const cover = hasPhoneStrip
      ? '<div class="cover-phone-strip">' + phoneShots.map(g =>
          renderImage(g.image, tr(g, 'caption') || tr(w, 'title'), 'phone-shot')).join('') + '</div>'
      : hasImage ? renderImage(preview.image, preview.alt, '') :
        '<small>GULE LAB / ' + esc(category) + '</small>' +
        '<strong>' + esc(String(w.slug || '').replace(/-/g, ' ').split(' ').slice(0, 3).join(' ')) + '</strong>';
    const links = [
      detailPath ? '<a href="' + esc(detailPath) + '"><i class="bi bi-arrow-up-right" aria-hidden="true"></i><span>' + esc(detailLabel) + '</span></a>' : '',
      anchor(w.github, labels[language].repository, '', 'bi-github'),
      anchor(w.demo, labels[language].demo, '', 'bi-box-arrow-up-right'),
      ownPaper ? anchor(w.paper, labels[language].paper, '', 'bi-file-earmark-text') : '',
      anchor(w.video_link, labels[language].video, '', 'bi-play-circle')
    ].filter(Boolean).join('');
    return '<article class="work"><div class="cover' + (hasImage ? ' has-image' : '') + (isDiagram ? ' has-diagram' : '') + (hasPhoneStrip ? ' has-phone-layout' : '') + '">' +
      cover + mediaLabel + '</div><div><span class="badge status-badge status-badge--' + esc(statusVariant) + '">' +
      icon(PortfolioUI.statusIcon(statusVariant)) + '<span>' + esc(tr(w, 'status')) +
      '</span></span><span class="year">' + esc(w.year || '') + '</span><h3>' +
      (detailPath ? '<a class="case-title-link" href="' + esc(detailPath) + '">' + esc(tr(w, 'title')) + '</a>' : esc(tr(w, 'title'))) +
      '</h3><div class="subtitle">' + esc(tr(w, 'subtitle')) +
      '</div><p class="summary">' + esc(tr(w, 'summary')) + '</p>' + tags(w.tags) +
      (links ? '<div class="links work-extra-links">' + links + '</div>' : '') +
      (hasPhoneStrip ? '' : renderGallery(w)) + '</div></article>';
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
  $('#english').setAttribute('aria-pressed', String(language === 'en'));
  $('#chinese').setAttribute('aria-pressed', String(language === 'zh'));
  $('#primary-navigation').setAttribute('aria-label', t.navName);
  $('#nav-toggle-label').textContent = t.menu;
  $('#nav-toggle').setAttribute('aria-label',
    $('#nav-toggle').getAttribute('aria-expanded') === 'true' ? t.menuClose : t.menuOpen);
  $('#skip-link').textContent = t.skip;
  $('#up').setAttribute('aria-label', t.backToTop);
  $('#site-status').hidden = true;
  const social = (p.socials || []).map(socialLink).join('');
  const email = p.email ? anchor('mailto:' + p.email, 'Email', 'social-link', 'bi-envelope') : '';
  const cv = p.cv_url ? anchor(p.cv_url, t.cv + ' ↗', 'profile-quicklink', 'bi-file-earmark-pdf') : '';
  $('#profile').innerHTML =
    '<img class="avatar" src="' + esc(url(p.avatar)) + '" alt="' + esc(tr(p, 'name')) + '" width="136" height="136" decoding="async" loading="eager" fetchpriority="high">' +
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
  fetchJson('profile', null), fetchJson('homepage-works', []), fetchJson('news', []),
  fetchJson('writing', []), fetchJson('achievements', []), fetchJson('personal', {})
]).then(([profile, works, newsItems, writingItems, achievementItems, personalData]) => {
  if (!profile) throw new Error('Missing profile content');
  database = {profile, works, news: newsItems, writing: writingItems,
    achievements: achievementItems, personal: personalData};
  render();
}).catch((error) => {
  console.error(error);
  renderFailure();
});
function renderFailure() {
  const t = labels[language];
  document.documentElement.lang = language === 'zh' ? 'zh-Hant' : 'en';
  $('#english').classList.toggle('selected', language === 'en');
  $('#chinese').classList.toggle('selected', language === 'zh');
  $('#english').setAttribute('aria-pressed', String(language === 'en'));
  $('#chinese').setAttribute('aria-pressed', String(language === 'zh'));
  document.querySelectorAll('nav a').forEach((a) => {
    if (a.dataset.i && t[a.dataset.i]) a.textContent = t[a.dataset.i];
  });
  $('#primary-navigation').setAttribute('aria-label', t.navName);
  $('#nav-toggle-label').textContent = t.menu;
  $('#nav-toggle').setAttribute('aria-label', t.menuOpen);
  $('#skip-link').textContent = t.skip;
  $('#up').setAttribute('aria-label', t.backToTop);
  const status = $('#site-status');
  status.hidden = false;
  status.setAttribute('role', 'alert');
  status.innerHTML = '<strong>' + esc(t.errorTitle) + '</strong><p>' +
    esc(t.errorMessage) + '</p><div class="site-status-links">' +
    '<a href="' + (language === 'zh' ? 'zh/research/' : 'research/') + '">' + esc(t.allResearch) + '</a>' +
    '<a href="' + (language === 'zh' ? 'zh/projects/' : 'projects/') + '">' + esc(t.allProjects) + '</a></div>';
}

const navToggle = $('#nav-toggle');
const navMenu = $('#primary-navigation');
function closeNav(returnFocus = false) {
  navMenu.removeAttribute('data-open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', labels[language].menuOpen);
  if (returnFocus) navToggle.focus();
}
function openNav() {
  navMenu.setAttribute('data-open', 'true');
  navToggle.setAttribute('aria-expanded', 'true');
  navToggle.setAttribute('aria-label', labels[language].menuClose);
}
navToggle.addEventListener('click', () => {
  if (navToggle.getAttribute('aria-expanded') === 'true') closeNav();
  else openNav();
});
navMenu.addEventListener('click', (event) => {
  const target = event.target && event.target.closest('a[href^="#"]');
  if (target) closeNav();
});
if (typeof document.addEventListener === 'function') {
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      closeNav(true);
    }
  });
  document.addEventListener('pointerdown', (event) => {
    if (navToggle.getAttribute('aria-expanded') === 'true' &&
        !navMenu.contains(event.target) && !navToggle.contains(event.target)) {
      closeNav();
    }
  });
}
function setLanguage(next) {
  language = next;
  try { localStorage.setItem('gule-language', next); } catch (_) {}
  closeNav();
  if (database) render();
  else if ($('#site-status').getAttribute('role') === 'alert') renderFailure();
}
$('#english').addEventListener('click', () => setLanguage('en'));
$('#chinese').addEventListener('click', () => setLanguage('zh'));
$('#up').addEventListener('click', () => scrollTo({top:0, behavior:'smooth'}));
