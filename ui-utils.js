/* Shared portfolio metadata: automatic icon choices and status styling. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PortfolioUI = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const icons = {
    github: 'bi-github', gitlab: 'bi-gitlab', linkedin: 'bi-linkedin',
    instagram: 'bi-instagram', ig: 'bi-instagram', twitter: 'bi-twitter-x',
    x: 'bi-twitter-x', threads: 'bi-threads', youtube: 'bi-youtube',
    discord: 'bi-discord', telegram: 'bi-telegram', facebook: 'bi-facebook',
    tiktok: 'bi-tiktok', reddit: 'bi-reddit', twitch: 'bi-twitch',
    medium: 'bi-medium', behance: 'bi-behance', dribbble: 'bi-dribbble',
    stackoverflow: 'bi-stack-overflow', scholar: 'bi-mortarboard',
    googlescholar: 'bi-mortarboard', researchgate: 'bi-book',
    orcid: 'bi-person-vcard', email: 'bi-envelope', mail: 'bi-envelope',
    cv: 'bi-file-earmark-pdf', resume: 'bi-file-earmark-pdf',
    blog: 'bi-journal-text', substack: 'bi-envelope-paper',
    notion: 'bi-journal-text', website: 'bi-globe2', portfolio: 'bi-globe2',
    personalwebsite: 'bi-globe2', link: 'bi-link-45deg'
  };
  const normalize = (text) => String(text || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const domainNames = [
    ['github.com', 'github'], ['gitlab.com', 'gitlab'],
    ['linkedin.com', 'linkedin'], ['instagram.com', 'instagram'],
    ['twitter.com', 'x'], ['x.com', 'x'], ['threads.net', 'threads'],
    ['youtube.com', 'youtube'], ['youtu.be', 'youtube'],
    ['discord.gg', 'discord'], ['discord.com', 'discord'],
    ['t.me', 'telegram'], ['telegram.org', 'telegram'],
    ['facebook.com', 'facebook'], ['tiktok.com', 'tiktok'],
    ['reddit.com', 'reddit'], ['twitch.tv', 'twitch'],
    ['medium.com', 'medium'], ['behance.net', 'behance'],
    ['dribbble.com', 'dribbble'], ['stackoverflow.com', 'stackoverflow'],
    ['scholar.google.com', 'scholar'], ['orcid.org', 'orcid'],
    ['researchgate.net', 'researchgate'], ['substack.com', 'substack'],
    ['notion.site', 'notion']
  ];
  function socialIcon(icon, label, href) {
    const explicit = normalize(icon);
    if (explicit && icons[explicit]) return icons[explicit];
    const labelKey = normalize(label);
    if (icons[labelKey]) return icons[labelKey];
    if (String(href || '').trim().toLowerCase().startsWith('mailto:')) return icons.email;
    let host = '';
    try { host = new URL(String(href || '')).hostname.toLowerCase().replace(/^www\./, ''); }
    catch (_) { /* Unknown URL: use a visible generic link icon. */ }
    for (const [domain, key] of domainNames) {
      if (host === domain || host.endsWith('.' + domain)) return icons[key];
    }
    return icons.link;
  }

  const allowedTypes = new Set([
    'proposal', 'research', 'exploration', 'prototype',
    'active', 'testing', 'released', 'paused', 'default'
  ]);
  function statusType(work) {
    const selected = String(work && work.status_type || '').toLowerCase();
    if (allowedTypes.has(selected)) return selected;
    const label = [work && work.status_en, work && work.status_zh]
      .filter(Boolean).join(' ').toLowerCase();
    if (/\b(released|launched|published|in production)\b|已上架|正式發佈|正式發布|正式上線/.test(label)) return 'released';
    if (/\b(internal testing|beta testing|closed beta|public beta|beta|testing)\b|內部測試|公開測試|測試中/.test(label)) return 'testing';
    if (/\b(active prototype|active development|in development)\b|持續開發|積極開發|開發中的原型/.test(label)) return 'active';
    if (/\b(explor|exploration|experimental concept|concept stage|early idea)|探索|概念驗證|構想/.test(label)) return 'exploration';
    if (/\b(proposal|proposed research)\b|提案/.test(label)) return 'proposal';
    if (/\b(research in progress|ongoing research)\b|研究進行中/.test(label)) return 'research';
    if (/\b(paused|archived|on hold)\b|暫停|封存/.test(label)) return 'paused';
    if (/\b(prototype|mvp)\b|原型/.test(label)) return 'prototype';
    return 'default';
  }
  const statusIcons = {
    proposal: 'bi-lightbulb', research: 'bi-search',
    exploration: 'bi-compass', prototype: 'bi-layers',
    active: 'bi-arrow-repeat', testing: 'bi-clipboard-check',
    released: 'bi-check-circle', paused: 'bi-pause-circle', default: 'bi-tag'
  };
  function statusIcon(type) { return statusIcons[type] || statusIcons.default; }
  return { socialIcon, statusType, statusIcon };
});
