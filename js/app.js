/**
 * app.js — 主程式入口
 * 初始化所有模組，綁定 UI 事件
 */

const APP_VERSION = '2026-03-13.1';
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
  let _backdrop = null;

  function _isMobile() { return window.innerWidth < 768; }

  function _getBackdrop() {
    if (!_backdrop) {
      _backdrop = document.getElementById('outline-backdrop');
      if (_backdrop) _backdrop.addEventListener('click', close);
    }
    return _backdrop;
  }

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

    if (_isMobile()) {
      // 行動版：確保切換到預覽模式（preview-pane 才可見）
      if (!document.body.classList.contains('preview-mode')) {
        document.body.classList.add('preview-mode');
        document.getElementById('btn-mode-edit')?.classList.remove('active');
        document.getElementById('btn-mode-preview')?.classList.add('active');
      }
      close(); // 關閉大綱底部抽屜
      // 等 display:none → block 生效後再 scroll
      requestAnimationFrame(() => {
        for (const el of preview.querySelectorAll('h1,h2,h3,h4,h5,h6')) {
          if (el.textContent.trim() === text) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            break;
          }
        }
      });
      return;
    }

    // 桌機：預覽區一直可見，直接 scroll
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
    const btn = document.getElementById('btn-outline');
    if (panel) panel.classList.add('outline-open');
    if (btn) btn.classList.add('outline-active');
    if (_isMobile()) {
      // Mobile: bottom sheet + backdrop
      const bd = _getBackdrop();
      if (bd) bd.classList.add('active');
    } else {
      // Desktop: slide outline in, hide editor pane
      const editorPane = document.getElementById('editor-pane');
      if (editorPane) editorPane.hidden = true;
    }
    _render();
  }

  function close() {
    _isOpen = false;
    const panel = document.getElementById('outline-panel');
    const editorPane = document.getElementById('editor-pane');
    const btn = document.getElementById('btn-outline');
    if (panel) panel.classList.remove('outline-open');
    if (editorPane) editorPane.hidden = false;  // always restore
    if (btn) btn.classList.remove('outline-active');
    const bd = _getBackdrop();
    if (bd) bd.classList.remove('active');
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

  // 5b. Search (requires CodeMirror instance from Editor)
  Search.init(Editor.instance().codemirror);

  // 6. Tabs
  Tabs.init(
    document.getElementById('tabs-list'),
    (tab) => {
      // On tab switch: render preview for the new tab's content
      Preview.render(tab.content);
      Storage.updateStats(tab.content);
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

  // Export HTML
  document.getElementById('btn-export-html')?.addEventListener('click', () => {
    closeAllDropdowns();
    Storage.exportHTML();
  });
  document.getElementById('md-export-html')?.addEventListener('click', () => {
    Storage.exportHTML();
    closeMobileDrawer();
  });

  // Export PDF
  document.getElementById('btn-export-pdf')?.addEventListener('click', () => {
    closeAllDropdowns();
    // On mobile edit mode, switch to preview first so print shows content
    if (window.innerWidth <= 767) setMode('preview');
    setTimeout(() => window.print(), 80);
  });
  document.getElementById('md-export-pdf')?.addEventListener('click', () => {
    closeMobileDrawer();
    if (window.innerWidth <= 767) setMode('preview');
    setTimeout(() => window.print(), 80);
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
  document.getElementById('btn-export')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown('export-menu');
  });
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

  // Initial preview render + word count
  // setTimeout ensures this runs after any pending EasyMDE async change events
  const activeTab = Tabs.activeTab();
  if (activeTab && activeTab.content) {
    Preview.render(activeTab.content);
    setTimeout(() => Storage.updateStats(activeTab.content), 0);
  }

  // Outline panel
  document.getElementById('btn-outline')?.addEventListener('click', () => Outline.toggle());

  // ---- BOTTOM TOOLBAR (mobile) ----
  const _btbActions = {
    'btb-bold':    () => EasyMDE.toggleBold(Editor.instance()),
    'btb-italic':  () => EasyMDE.toggleItalic(Editor.instance()),
    'btb-heading': () => EasyMDE.toggleHeadingSmaller(Editor.instance()),
    'btb-ulist':   () => EasyMDE.toggleUnorderedList(Editor.instance()),
    'btb-olist':   () => EasyMDE.toggleOrderedList(Editor.instance()),
    'btb-code':    () => EasyMDE.toggleCodeBlock(Editor.instance()),
  };
  Object.entries(_btbActions).forEach(([id, action]) => {
    document.getElementById(id)?.addEventListener('click', (e) => {
      e.preventDefault();
      action();
      Editor.focus();
    });
  });

  // ---- SWIPE GESTURE (mobile: edit ↔ preview) ----
  (function initSwipe() {
    const wrapper = document.getElementById('editor-wrapper');
    if (!wrapper) return;
    let startX = 0, startY = 0;
    wrapper.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    wrapper.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < 80 || Math.abs(dx) <= Math.abs(dy)) return;
      if (dx < 0) {
        // Swipe left → preview
        setMode('preview');
        Preview.render(Editor.getValue());
      } else {
        // Swipe right → edit
        setMode('edit');
      }
    }, { passive: true });
  })();

  // ---- DROP ZONE (desktop drag & drop) ----
  (function initDropZone() {
    const overlay = document.getElementById('drop-zone-overlay');
    if (!overlay) return;
    const VALID_TYPES = ['text/markdown', 'text/plain', 'text/x-markdown'];
    const VALID_EXTS  = ['.md', '.txt', '.markdown'];
    let dragDepth = 0;

    function isDesktop() { return window.innerWidth > 767; }

    document.addEventListener('dragenter', (e) => {
      if (!isDesktop()) return;
      const items = e.dataTransfer?.items;
      if (!items || ![...items].some(i => i.kind === 'file')) return;
      e.preventDefault();
      dragDepth++;
      overlay.classList.add('active');
    });

    document.addEventListener('dragover', (e) => {
      if (!isDesktop()) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });

    document.addEventListener('dragleave', () => {
      if (!isDesktop()) return;
      dragDepth = Math.max(0, dragDepth - 1);
      if (dragDepth === 0) overlay.classList.remove('active');
    });

    document.addEventListener('drop', (e) => {
      e.preventDefault();
      dragDepth = 0;
      overlay.classList.remove('active');
      if (!isDesktop()) return;
      const files = [...(e.dataTransfer?.files || [])];
      files.forEach(file => {
        const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
        if (VALID_TYPES.includes(file.type) || VALID_EXTS.includes(ext)) {
          Storage.openFile(file);
        }
      });
    });
  })();

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
