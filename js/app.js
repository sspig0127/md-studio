/**
 * app.js — 主程式入口
 * 初始化所有模組，綁定 UI 事件
 */

const APP_VERSION = '2026-03-11.6';
console.info(`%c[md-studio] v${APP_VERSION}`, 'color:#7c6af7;font-weight:bold;font-size:13px;');

async function loadSample() {
  const lang = I18n.lang;
  const res = await fetch(`locales/sample-${lang}.md`);
  const content = await res.text();
  Tabs.createTab(`markdown-sample-${lang}.md`, content);
}

const Theme = (() => {
  const KEY = 'md_theme';

  function apply(theme) {
    localStorage.setItem(KEY, theme);
    document.querySelectorAll('[data-theme-btn]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.themeBtn === theme);
    });
  }

  function activate(theme) {
    if (theme === 'purple') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  function init() {
    const saved = localStorage.getItem(KEY) || 'purple';
    activate(saved);
    document.querySelectorAll('[data-theme-btn]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.themeBtn === saved);
      btn.addEventListener('click', () => apply(btn.dataset.themeBtn));
    });
    document.getElementById('btn-apply-theme')
      ?.addEventListener('click', () => location.reload());
  }

  return { init, apply, activate };
})();

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
}

function closeMobileDrawer() {
  const drawer = document.getElementById('mobile-drawer');
  if (drawer) drawer.hidden = true;
}

const Typo = (() => {
  const KEY = 'md_typo';

  function apply(style) {
    const el = document.getElementById('preview-content');
    if (!el) return;
    if (style === 'default') {
      el.removeAttribute('data-typo');
    } else {
      el.setAttribute('data-typo', style);
    }
    localStorage.setItem(KEY, style);
    document.querySelectorAll('[data-typo-btn]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.typoBtn === style);
    });
  }

  function init() {
    const saved = localStorage.getItem(KEY) || 'default';
    apply(saved);
    document.querySelectorAll('[data-typo-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        apply(btn.dataset.typoBtn);
        closeAllDropdowns();
        closeMobileDrawer();
      });
    });
  }

  return { init };
})();

const Outline = (() => {
  let _isOpen = false;

  function _extractHeadings(content) {
    const lines = content.split('\n');
    const headings = [];
    let inCode = false;
    for (const line of lines) {
      if (line.startsWith('```')) { inCode = !inCode; continue; }
      if (inCode) continue;
      const m = line.match(/^(#{1,6})\s+(.+)/);
      if (m) headings.push({ level: m[1].length, text: m[2].trim() });
    }
    return headings;
  }

  function _scrollToHeading(text) {
    const preview = document.getElementById('preview-content');
    if (!preview) return;
    for (const el of preview.querySelectorAll('h1,h2,h3,h4,h5,h6')) {
      if (el.textContent.trim() === text) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      }
    }
  }

  function _render() {
    const body = document.getElementById('outline-body');
    if (!body) return;
    const headings = _extractHeadings(Editor.getValue());
    if (headings.length === 0) {
      body.innerHTML = `<div class="outline-empty">${I18n.t('outline.empty')}</div>`;
      return;
    }
    body.innerHTML = '';
    headings.forEach(h => {
      const btn = document.createElement('button');
      btn.className = 'outline-item';
      btn.dataset.level = h.level;
      btn.textContent = h.text;
      btn.title = h.text;
      btn.addEventListener('click', () => _scrollToHeading(h.text));
      body.appendChild(btn);
    });
  }

  function open() {
    _isOpen = true;
    const panel = document.getElementById('outline-panel');
    const editorPane = document.getElementById('editor-pane');
    const btn = document.getElementById('btn-outline');
    if (panel) panel.classList.add('outline-open');
    if (editorPane) editorPane.hidden = true;
    if (btn) btn.classList.add('outline-active');
    _render();
  }

  function close() {
    _isOpen = false;
    const panel = document.getElementById('outline-panel');
    const editorPane = document.getElementById('editor-pane');
    const btn = document.getElementById('btn-outline');
    if (panel) panel.classList.remove('outline-open');
    if (editorPane) editorPane.hidden = false;
    if (btn) btn.classList.remove('outline-active');
  }

  function toggle() { if (_isOpen) close(); else open(); }
  function refresh() { if (_isOpen) _render(); }

  return { open, close, toggle, refresh };
})();

(async function AppInit() {
  function toggleDropdown(menuId) {
    const menu = document.getElementById(menuId);
    const isOpen = menu.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) {
      // 用 fixed 定位：取觸發按鈕的位置計算下拉選單座標
      const btn = menu.previousElementSibling;
      const rect = btn.getBoundingClientRect();
      menu.style.top   = (rect.bottom + 4) + 'px';
      menu.style.left  = 'auto';
      menu.style.right = (window.innerWidth - rect.right) + 'px';
      menu.classList.add('open');
    }
  }

  function setMode(mode) {
    document.body.classList.toggle('preview-mode', mode === 'preview');
    document.getElementById('btn-mode-edit').classList.toggle('active', mode === 'edit');
    document.getElementById('btn-mode-preview').classList.toggle('active', mode === 'preview');
  }

  // 1. Theme（最先套用，確保 EasyMDE 以正確顏色初始化）
  Theme.init();

  // 2. Typography
  Typo.init();

  // 3. i18n
  await I18n.init();

  // 4. Preview
  Preview.init(document.getElementById('preview-content'));

  // 5. Editor
  Editor.init('editor', (content) => {
    // Notify storage (auto-save + word count)
    Storage.onContentChange(content);
    // Mark current tab dirty
    const tab = Tabs.activeTab();
    if (tab) Tabs.setDirty(tab.id, true);
  });

  // 6. Tabs
  Tabs.init(
    document.getElementById('tabs-list'),
    (tab) => {
      // On tab switch: render preview for the new tab's content
      Preview.render(tab.content);
      document.title = tab.filename + ' — ' + I18n.t('nav.title');
      Outline.refresh();
    }
  );

  // 7. Storage
  Storage.init();

  // 8. Settings
  Settings.init();

  // 9. Cloud (non-blocking)
  Cloud.init();

  // ---- BIND EVENTS ----

  // New tab
  document.getElementById('btn-tab-new').addEventListener('click', () => Tabs.createTab());
  document.getElementById('btn-new')?.addEventListener('click', () => Tabs.createTab());
  document.getElementById('md-new')?.addEventListener('click', () => {
    Tabs.createTab();
    closeMobileDrawer();
  });

  // Sample file
  document.getElementById('btn-sample')?.addEventListener('click', () => loadSample());
  document.getElementById('md-sample')?.addEventListener('click', () => {
    loadSample();
    closeMobileDrawer();
  });

  // Open file
  document.getElementById('btn-open').addEventListener('click', () =>
    document.getElementById('file-input').click()
  );
  document.getElementById('md-open')?.addEventListener('click', () => {
    document.getElementById('file-input').click();
    closeMobileDrawer();
  });
  document.getElementById('file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) Storage.openFile(file);
    e.target.value = ''; // Reset so same file can be re-opened
  });

  // Download
  document.getElementById('btn-download').addEventListener('click', () => Storage.downloadFile());
  document.getElementById('md-download')?.addEventListener('click', () => {
    Storage.downloadFile();
    closeMobileDrawer();
  });

  // Cloud buttons
  document.getElementById('btn-cloud-login').addEventListener('click', () => Cloud.signIn());
  document.getElementById('btn-cloud-logout').addEventListener('click', () => Cloud.signOut());
  document.getElementById('btn-cloud-open').addEventListener('click', () => Cloud.openFromDrive());
  document.getElementById('btn-cloud-save').addEventListener('click', () => Cloud.saveToDrive());
  document.getElementById('md-cloud-login')?.addEventListener('click', () => { Cloud.signIn(); closeMobileDrawer(); });
  document.getElementById('md-cloud-open')?.addEventListener('click', () => { Cloud.openFromDrive(); closeMobileDrawer(); });
  document.getElementById('md-cloud-save')?.addEventListener('click', () => { Cloud.saveToDrive(); closeMobileDrawer(); });

  // Language buttons (desktop dropdown + mobile drawer)
  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      I18n.load(btn.dataset.lang);
      closeAllDropdowns();
      closeMobileDrawer();
    });
  });

  // Dropdown toggles
  document.getElementById('btn-cloud').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown('cloud-menu');
  });
  document.getElementById('btn-lang').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown('lang-menu');
  });
  document.getElementById('btn-typo')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown('typo-menu');
  });

  // Mobile menu
  document.getElementById('btn-mobile-menu').addEventListener('click', (e) => {
    e.stopPropagation();
    const drawer = document.getElementById('mobile-drawer');
    drawer.hidden = !drawer.hidden;
  });

  // Mobile mode toggle
  document.getElementById('btn-mode-edit').addEventListener('click', () => setMode('edit'));
  document.getElementById('btn-mode-preview').addEventListener('click', () => {
    setMode('preview');
    Preview.render(Editor.getValue());
  });

  // Close dropdowns/drawer on outside click
  document.addEventListener('click', () => {
    closeAllDropdowns();
    closeMobileDrawer();
  });

  // Initial preview render
  const activeTab = Tabs.activeTab();
  if (activeTab && activeTab.content) {
    Preview.render(activeTab.content);
  }

  // Outline panel
  document.getElementById('btn-outline')?.addEventListener('click', () => Outline.toggle());

  // Network status: disable cloud when offline
  window.addEventListener('offline', () => {
    ['btn-cloud-login','btn-cloud-open','btn-cloud-save','md-cloud-login','md-cloud-open','md-cloud-save']
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.disabled = true; el.title = I18n.t('offline.cloud.disabled'); }
      });
  });
  window.addEventListener('online', () => Cloud.init());

})();
