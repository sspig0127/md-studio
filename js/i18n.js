/**
 * i18n.js — 多語言切換（zh-TW / en / vi）
 */
const I18n = (() => {
  let _dict = {};
  let _lang = 'zh-TW';

  async function load(lang) {
    try {
      const res = await fetch(`locales/${lang}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      _dict = await res.json();
      _lang = lang;
      localStorage.setItem('lang', lang);
      _apply();
    } catch (e) {
      console.error('[i18n] Failed to load', lang, e);
    }
  }

  function t(key) {
    return _dict[key] || key;
  }

  function _apply() {
    // Text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (val) el.textContent = val;
    });
    // Placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = t(key);
      if (val) el.placeholder = val;
    });
    // Title attribute
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const val = t(key);
      if (val) el.title = val;
    });
    // Inner HTML (for locale strings that contain safe HTML like <b>)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const val = t(key);
      if (val) el.innerHTML = val;
    });
    // Document title
    document.title = t('nav.title');
    // Notify app
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: _lang } }));
  }

  async function init() {
    const saved = localStorage.getItem('lang') || 'zh-TW';
    await load(saved);
  }

  return { init, load, t, get lang() { return _lang; } };
})();
